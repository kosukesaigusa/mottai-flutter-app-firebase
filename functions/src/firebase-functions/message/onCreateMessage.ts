import { FieldValue } from '@google-cloud/firestore'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { PublicUserRepository } from '../../repositories/publicUser'
import { sendFCMByUserIds } from '../../../src/utils/fcm/sendFCMNotification'
import { attendingRoomConverter } from '../../../src/converters/attendingRoomConverter'
import { messageConverter } from '../../../src/converters/messageConverter'
import { MessageRepository } from '../../repositories/message'
import { attendingRoomRef } from '../../firestore-refs/firestoreRefs'

/** ルームに新しいメッセージが作成されたときに発火する Function。*/
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
        const hostAttendingRoomRef = attendingRoomRef({ userId: hostId, roomId: roomId })
        const workerAttendingRoomRef = attendingRoomRef({ userId: workerId, roomId: roomId })
        const hostAttendingRoomDs = await hostAttendingRoomRef.get()
        const workerAttendingRoomDs = await workerAttendingRoomRef.get()
        const hostAttendingRoom = hostAttendingRoomDs.data()
        const workerAttendingRoom = workerAttendingRoomDs.data()

        // ルーム参加者のそれぞれの AttendingRoom バッチ書き込みする。
        // すでに AttendingRoom が存在していれば updatedAt と unreadCount を更新する。
        // 存在しなければ新たに set する。
        const batch = admin.firestore().batch()
        if (hostAttendingRoom !== undefined) {
            batch.update(hostAttendingRoomRef, {
                updatedAt: FieldValue.serverTimestamp(),
                unreadCount: FieldValue.increment(1)
            })
        } else {
            batch.set(
                hostAttendingRoomRef,
                attendingRoomConverter.toFirestore({
                    roomId,
                    partnerId: workerId,
                    unreadCount: 0,
                    muteNotification: false,
                    isBlocked: false,
                    lastReadMessageId: ``
                })
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
                attendingRoomConverter.toFirestore({
                    roomId,
                    partnerId: hostId,
                    unreadCount: 0,
                    muteNotification: false,
                    isBlocked: false,
                    lastReadMessageId: ``
                })
            )
        }
        try {
            await batch.commit()
            functions.logger.info(`onCreateMessage による AttendingRoom の更新に成功しました`)
        } catch (e) {
            functions.logger.error(`onCreateMessage のバッチ書き込みに失敗しました：${e}`)
            return
        }

        // 通知を送る対象を確認する
        const userIds: string[] = []
        if (senderId === hostId) {
            const cannotSendFCM =
                (workerAttendingRoom?.isBlocked ?? false) || (workerAttendingRoom?.muteNotification ?? false)
            if (!cannotSendFCM) {
                userIds.push(workerId)
            }
        } else if (senderId === workerId) {
            const cannotSendFCM =
                (hostAttendingRoom?.isBlocked ?? false) || (hostAttendingRoom?.muteNotification ?? false)
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
        try {
            await sendFCMByUserIds({ userIds, title, body, path })
            functions.logger.info(`onCreateMessage による通知の送信に成功しました`)
        } catch (e) {
            functions.logger.error(`通知の送信に失敗しました：${e}`)
            return
        }
    })
