import { FieldValue } from "@google-cloud/firestore"

export const attendingRoomConverter = {
    fromFirestore(qds: FirebaseFirestore.QueryDocumentSnapshot): AttendingRoom {
        const data = qds.data()
        return {
            roomId: qds.id,
            hostId: data.hostId,
            workerId: data.workerId,
            updatedAt: data.updatedAt ?? null,
            unreadCount: data.unreadCount ?? 0,
            muteNotification: data.muteNotification ?? false,
            lastReadMessageId: data.lastReadMessageId
        }
    },
    toFirestore(attendingRoom: AttendingRoom): FirebaseFirestore.DocumentData {
        return {
            roomId: attendingRoom.roomId,
            hostId: attendingRoom.hostId,
            workerId: attendingRoom.workerId,
            updatedAt: FieldValue.serverTimestamp(),
            unreadCount: attendingRoom.unreadCount ?? 0,
            muteNotification: attendingRoom.muteNotification ?? false,
            lastReadMessageId: attendingRoom.lastReadMessageId
        }
    }
}
