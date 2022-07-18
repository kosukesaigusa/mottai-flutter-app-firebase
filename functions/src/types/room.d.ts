interface Room {
  roomId: string
  hostId: string
  workerId: string
  updatedAt?: FirebaseFirestore.Timestamp
}
