/** node_modules 内の同名の Account interface と衝突するので AppAccount とした */
interface AppAccount {
  accountId: string
  createdAt?: FirebaseFirestore.Timestamp | null
  updatedAt?: FirebaseFirestore.Timestamp | null
  displayName: string
  imageURL: string | null
  providers: string[]
}
