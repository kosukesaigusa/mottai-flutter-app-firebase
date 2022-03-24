import { FieldValue } from "@google-cloud/firestore"

export const roomConverter = {
    fromFirestore(qds: FirebaseFirestore.QueryDocumentSnapshot): Room {
        const data = qds.data()
        return {
            roomId: qds.id,
            hostId: data.hostId,
            workerId: data.workerId,
            updatedAt: data.updatedAt ?? null
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
