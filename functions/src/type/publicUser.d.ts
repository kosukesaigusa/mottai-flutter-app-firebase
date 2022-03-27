interface PublicUser {
  userId: string
  updatedAt?: FirebaseFirestore.Timestamp | null
  displayName: string
  imageURL: string | null
}
