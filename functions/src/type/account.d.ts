interface Account {
  accountId: string
  createdAt?: FirebaseFirestore.Timestamp | null
  updatedAt?: FirebaseFirestore.Timestamp | null
  displayName: string
  imageURL: string | null
  providers: string[]
}
