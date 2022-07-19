import { FieldValue, FirestoreDataConverter } from '@google-cloud/firestore'
import { Room } from '../models/room'

export const roomConverter: FirestoreDataConverter<Room> = {
    fromFirestore(qds: FirebaseFirestore.QueryDocumentSnapshot): Room {
        const data = qds.data()
        return {
            roomId: qds.id,
            hostId: data.hostId,
            workerId: data.workerId,
            updatedAt: data.updatedAt
        }
    },
    toFirestore(room: Room): FirebaseFirestore.DocumentData {
        return {
            roomId: room.roomId,
            hostId: room.hostId,
            workerId: room.workerId,
            updatedAt: FieldValue.serverTimestamp()
        }
    }
}
