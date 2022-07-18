import { roomRef } from '../firestore-refs/firestoreRefs'

/** Message ドメイン関係のリポジトリ */
export class MessageRepository {
    /** 指定した Room を取得する。 */
    async fetchRoom({ roomId }: { roomId: string }): Promise<Room | undefined> {
        const ds = await roomRef({ roomId: roomId }).get()
        return ds.data()
    }
}
