/** node_modules 内の同名の Account interface と衝突するので AppAccount とした */
export class AppAccount {
    accountId = ``
    createdAt?: FirebaseFirestore.Timestamp
    updatedAt?: FirebaseFirestore.Timestamp
    displayName = ``
    imageURL = ``
    providers: string[] = []
    fcmTokens: string[] = []

    constructor(partial?: Partial<AppAccount>) {
        Object.assign(this, partial)
    }
}
