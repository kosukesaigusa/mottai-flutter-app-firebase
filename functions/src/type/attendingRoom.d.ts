interface AttendingRoom {
  roomId: string
  partnerId: string
  updatedAt?: FirebaseFirestore.Timestamp | null
  unreadCount?: number
  muteNotification?: boolean
  lastReadMessageId?: string
}
