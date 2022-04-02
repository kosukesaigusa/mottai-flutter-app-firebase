import { FieldValue } from "@google-cloud/firestore"

export const attendingRoomConverter = {
    fromFirestore(qds: FirebaseFirestore.QueryDocumentSnapshot): AttendingRoom {
        const data = qds.data()
        return {
            roomId: qds.id,
            partnerId: data.partnerId,
            updatedAt: data.updatedAt ?? null,
            unreadCount: data.unreadCount ?? 0,
            muteNotification: data.muteNotification ?? false,
            isBlocked: data.isBlocked ?? false,
            lastReadMessageId: data.lastReadMessageId ?? null
        }
    },
    toFirestore(attendingRoom: AttendingRoom): FirebaseFirestore.DocumentData {
        return {
            roomId: attendingRoom.roomId,
            partnerId: attendingRoom.partnerId,
            updatedAt: FieldValue.serverTimestamp(),
            unreadCount: attendingRoom.unreadCount ?? 0,
            muteNotification: attendingRoom.muteNotification ?? false,
            isBlocked: attendingRoom.isBlocked ?? false,
            lastReadMessageId: attendingRoom.lastReadMessageId ?? null
        }
    }
}
