import { attendingRoomRef, roomRef } from '../firestore-refs/firestoreRefs'

/** Message ドメイン関係のリポジトリ */
export class MessageRepository {
    /** 指定した Room を取得する。 */
    async fetchRoom({ roomId }: { roomId: string }): Promise<Room | undefined> {
        const ds = await roomRef({ roomId: roomId }).get()
        return ds.data()
    }

    /** 指定した AttendingRoom を取得する */
    async fetchAttendingRoom({
        userId,
        roomId
    }: {
        userId: string
        roomId: string
    }): Promise<AttendingRoom | undefined> {
        const ds = await attendingRoomRef({ userId: userId, roomId: roomId }).get()
        return ds.data()
    }
}
