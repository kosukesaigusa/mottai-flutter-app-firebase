import * as functions from 'firebase-functions'
import { messageConverter } from '~/src/converters/messageConverter'
import { MessageRepository } from '~/src/repository/messageRepository'

/**
 * ルームに新しいメッセージが作成されたときに発火する Function。
 */
export const onCreateMessage = functions
    .region(`asia-northeast1`)
    .firestore.document(`messages/v1Message/rooms/{roomId}/messages/{messageId}`)
    .onCreate(async (snapshot, context) => {
        const message = messageConverter.fromFirestore(snapshot)
        // const senderId = message.senderId
        const roomId = context.params.roomId
        const room = await MessageRepository.fetchRoom({ roomId: roomId })
        if (room === undefined) {
            return
        }
    })
