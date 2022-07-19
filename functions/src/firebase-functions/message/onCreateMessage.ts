import { FieldValue } from '@google-cloud/firestore'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { attendingRoomConverter } from '~/src/converters/attendingRoomConverter'
import { messageConverter } from '~/src/converters/messageConverter'
import { attendingRoomRef } from '~/src/firestore-refs/firestoreRefs'
import { AttendingRoom } from '~/src/models/attendingRoom'
import { Message } from '~/src/models/message'
import { PublicUser } from '~/src/models/publicUser'
import { Room } from '~/src/models/room'
import { MessageRepository } from '~/src/repositories/message'
import { PublicUserRepository } from '~/src/repositories/publicUser'
import { sendFCMByUserIds } from '~/src/utils/fcm/sendFCMNotification'

/**
 * チャットルームに新しいメッセージが作成されたときに発火する。
 * チャットルーム参加者のそれぞれの AttendingRoom の書き込みと、
 * メッセージの受信者への通知の送信を行う。
 */
export const onCreateMessage = functions
    .region(`asia-northeast1`)
    .firestore.document(`message/{v1Message}/rooms/{roomId}/messages/{messageId}`)
    .onCreate(async (snapshot, context) => {
        const publicUserRepository = new PublicUserRepository()
        const messageRepository = new MessageRepository()
        const message = messageConverter.fromFirestore(snapshot)
        const senderId = message.senderId
        const roomId: string = context.params.roomId
        const sender = await publicUserRepository.fetchPublicUser({ publicUserId: senderId })
        const room = await messageRepository.fetchRoom({ roomId: roomId })
        if (sender === undefined || room === undefined) {
            return
        }
        const hostId = room.hostId
        const workerId = room.workerId
        const hostAttendingRoom = await messageRepository.fetchAttendingRoom({ userId: hostId, roomId: roomId })
        const workerAttendingRoom = await messageRepository.fetchAttendingRoom({ userId: workerId, roomId: roomId })

        // チャットルーム参加者のそれぞれの AttendingRoom を更新 or 作成する。
        try {
            updateAttendingRoomsByMessage({ hostAttendingRoom, workerAttendingRoom, room: room })
            functions.logger.info(`onCreateMessage による AttendingRoom の更新に成功しました。`)
        } catch (e) {
            functions.logger.error(`onCreateMessage のバッチ書き込みに失敗しました。：${e}`)
            return
        }

        // メッセージの受信者に通知を送る。
        try {
            await sendNotificationToReceiver({ hostAttendingRoom, workerAttendingRoom, room, message, sender })
            functions.logger.info(`onCreateMessage による通知の送信に成功しました。`)
        } catch (e) {
            functions.logger.error(`通知の送信に失敗しました。：${e}`)
        }
    })

/**
 * チャットルームに参加しているそれぞれのユーザーの AttendingRoom をバッチ書き込みをする。
 * すでに AttendingRoom が存在していれば updatedAt と unreadCount を更新する。
 * 存在しなければ新たに AttendingRoom ドキュメントを set する。
 */
const updateAttendingRoomsByMessage = async ({
    hostAttendingRoom,
    workerAttendingRoom,
    room
}: {
    hostAttendingRoom: AttendingRoom | undefined
    workerAttendingRoom: AttendingRoom | undefined
    room: Room
}): Promise<void> => {
    const hostId = room.hostId
    const workerId = room.workerId
    const roomId = room.roomId

    const hostAttendingRoomRef = attendingRoomRef({ userId: hostId, roomId: roomId })
    const workerAttendingRoomRef = attendingRoomRef({ userId: workerId, roomId: roomId })

    const batch = admin.firestore().batch()
    if (hostAttendingRoom !== undefined) {
        batch.update(hostAttendingRoomRef, {
            updatedAt: FieldValue.serverTimestamp(),
            unreadCount: FieldValue.increment(1)
        })
    } else {
        batch.set(
            hostAttendingRoomRef,
            attendingRoomConverter.toFirestore(new AttendingRoom({ roomId, partnerId: workerId }))
        )
    }
    if (workerAttendingRoom !== undefined) {
        batch.update(workerAttendingRoomRef, {
            updatedAt: FieldValue.serverTimestamp(),
            unreadCount: FieldValue.increment(1)
        })
    } else {
        batch.set(
            workerAttendingRoomRef,
            attendingRoomConverter.toFirestore(new AttendingRoom({ roomId, partnerId: hostId }))
        )
    }
    await batch.commit()
}

/** 対象者に FCM の通知を送る。*/
const sendNotificationToReceiver = async ({
    hostAttendingRoom,
    workerAttendingRoom,
    room,
    message,
    sender
}: {
    hostAttendingRoom: AttendingRoom | undefined
    workerAttendingRoom: AttendingRoom | undefined
    room: Room
    message: Message
    sender: PublicUser
}): Promise<void> => {
    const senderId = message.senderId
    const hostId = room.hostId
    const workerId = room.workerId
    const userIds: string[] = []
    if (senderId === hostId) {
        const cannotSendFCM =
            (workerAttendingRoom?.isBlocked ?? false) || (workerAttendingRoom?.muteNotification ?? false)
        if (!cannotSendFCM) {
            userIds.push(workerId)
        }
    } else if (senderId === workerId) {
        const cannotSendFCM = (hostAttendingRoom?.isBlocked ?? false) || (hostAttendingRoom?.muteNotification ?? false)
        if (!cannotSendFCM) {
            userIds.push(workerId)
        }
    }
    if (userIds.length === 0) {
        functions.logger.info(`通知の送信対象が存在しませんでした`)
        return
    }
    const title = sender.displayName
    const body = message.body
    const path = `/room`
    await sendFCMByUserIds({ userIds, title, body, path })
}
