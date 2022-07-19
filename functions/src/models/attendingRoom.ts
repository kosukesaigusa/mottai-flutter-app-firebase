export class AttendingRoom {
    roomId = ``
    partnerId = ``
    updatedAt?: FirebaseFirestore.Timestamp
    unreadCount = 0
    muteNotification = false
    isBlocked = false
    lastReadMessageId = ``

    constructor(partial?: Partial<AttendingRoom>) {
        Object.assign(this, partial)
    }

    // 比較用
    // constructor({
    //     roomId,
    //     partnerId,
    //     unreadCount,
    //     muteNotification,
    //     isBlocked,
    //     lastReadMessageId
    // }: {
    //     roomId: string
    //     partnerId: string
    //     unreadCount?: number
    //     muteNotification?: boolean
    //     isBlocked?: boolean
    //     lastReadMessageId?: string
    // }) {
    //     this.roomId = roomId
    //     this.partnerId = partnerId
    //     this.unreadCount = unreadCount ?? 0
    //     this.muteNotification = muteNotification ?? false
    //     this.isBlocked = isBlocked ?? false
    //     this.lastReadMessageId = lastReadMessageId ?? ``
    // }
}
