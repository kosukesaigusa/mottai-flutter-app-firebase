import { FieldValue, FirestoreDataConverter } from '@google-cloud/firestore'
import { Message } from '../models/message'

export const messageConverter: FirestoreDataConverter<Message> = {
    fromFirestore(qds: FirebaseFirestore.QueryDocumentSnapshot): Message {
        const data = qds.data()
        return {
            messageId: qds.id,
            createdAt: data.createdAt,
            type: data.type,
            senderId: data.senderId,
            body: data.body,
            imageURLs: data.imageURLs ?? [],
            detail: data.detail,
            isDeleted: data.isDeleted ?? false
        }
    },
    toFirestore(message: Message): FirebaseFirestore.DocumentData {
        return {
            messageId: message.messageId,
            createdAt: FieldValue.serverTimestamp(),
            type: message.type,
            senderId: message.senderId,
            body: message.body,
            imageURLs: message.imageURLs ?? [],
            detail: message.detail,
            isDeleted: message.isDeleted ?? false
        }
    }
}
