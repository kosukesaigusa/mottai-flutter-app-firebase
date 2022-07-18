import { FieldValue, FirestoreDataConverter } from "@google-cloud/firestore"

export const accountConverter: FirestoreDataConverter<AppAccount> = {
    fromFirestore(qds: FirebaseFirestore.QueryDocumentSnapshot): AppAccount {
        const data = qds.data()
        return {
            accountId: qds.id,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            displayName: data.displayName ?? ``,
            imageURL: data.imageURL ?? ``,
            providers: data.providers ?? [],
            fcmTokens: data.fcmTokens ?? []
        }
    },
    toFirestore(account: AppAccount): FirebaseFirestore.DocumentData {
        return {
            accountId: account.accountId,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            displayName: account.displayName ?? ``,
            imageURL: account.imageURL ?? ``,
            providers: account.providers ?? [],
            fcmTokens: account.fcmTokens ?? []
        }
    }
}
