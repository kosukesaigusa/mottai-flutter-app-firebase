interface AttendingRoom {
  roomId: string
  hostId: string
  workerId: string
  updatedAt?: FirebaseFirestore.Timestamp | null
  unreadCount?: number
  muteNotification?: boolean
  lastReadMessageId?: string
}
