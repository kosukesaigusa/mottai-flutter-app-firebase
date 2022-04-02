import { FieldValue } from '@google-cloud/firestore'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { attendingRoomConverter } from '../../../src/converters/attendingRoomConverter'
import { messageConverter } from '../../../src/converters/messageConverter'
import { MessageRepository } from '../../../src/repository/message'

/**
 * ルームに新しいメッセージが作成されたときに発火する Function。
 */
export const onCreateMessage = functions
    .region(`asia-northeast1`)
    .firestore.document(`message/{v1Message}/rooms/{roomId}/messages/{messageId}`)
    .onCreate(async (snapshot, context) => {
        const message = messageConverter.fromFirestore(snapshot)
        const senderId = message.senderId
        functions.logger.log(`${message}, ${senderId} は後に通知で使用する`)
        const roomId = context.params.roomId
        const room = await MessageRepository.fetchRoom({ roomId: roomId })
        if (room === undefined) {
            return
        }
        const hostId = room.hostId
        const workerId = room.workerId
        const hostAttendingRoomRef = MessageRepository.attendingRoomRef({ userId: hostId, roomId: roomId })
        const workerAttendingRoomRef = MessageRepository.attendingRoomRef({ userId: workerId, roomId: roomId })
        const hostAttendingRoom = await hostAttendingRoomRef.get()
        const workerAttendingRoom = await workerAttendingRoomRef.get()

        // ルーム参加者のそれぞれの AttendingRoom バッチ書き込みする。
        // すでに AttendingRoom が存在していれば updatedAt と unreadCount を更新する。
        // 存在しなければ新たに set する。
        const batch = admin.firestore().batch()
        if (hostAttendingRoom.exists) {
            batch.update(hostAttendingRoomRef, {
                updatedAt: FieldValue.serverTimestamp()
            })
        } else {
            const partnerId = workerId
            batch.set(
                hostAttendingRoomRef,
                attendingRoomConverter.toFirestore({ roomId, partnerId }),
            )
        }
        if (!workerAttendingRoom.exists) {
            batch.update(workerAttendingRoomRef, {
                updatedAt: FieldValue.serverTimestamp()
            })
        } else {
            const partnerId = hostId
            batch.set(
                workerAttendingRoomRef,
                attendingRoomConverter.toFirestore({ roomId, partnerId })
            )
        }
        try {
            await batch.commit()
            functions.logger.info(`🎉 onCreateMessage に成功しました`)
        } catch (e) {
            functions.logger.error(`⚠️ onCreateMessage のバッチ書き込みに失敗しました：${e}`)
        }
    })
