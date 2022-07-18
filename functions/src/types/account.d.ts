/** node_modules 内の同名の Account interface と衝突するので AppAccount とした */
interface AppAccount {
  accountId: string
  createdAt?: FirebaseFirestore.Timestamp
  updatedAt?: FirebaseFirestore.Timestamp
  displayName: string
  imageURL: string
  providers: string[]
  fcmTokens: string[]
}
