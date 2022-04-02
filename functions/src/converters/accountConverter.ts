import { FieldValue } from "@google-cloud/firestore"

export const accountConverter = {
    fromFirestore(qds: FirebaseFirestore.QueryDocumentSnapshot): AppAccount {
        const data = qds.data()
        return {
            accountId: qds.id,
            createdAt: data.createdAt ?? null,
            updatedAt: data.updatedAt ?? null,
            displayName: data.displayName,
            imageURL: data.imageURL ?? null,
            providers: data.providers ?? [],
            fcmTokens: data.fcmTokens ?? []
        }
    },
    toFirestore(account: AppAccount): FirebaseFirestore.DocumentData {
        return {
            accountId: account.accountId,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            displayName: account.displayName,
            imageURL: account.imageURL ?? null,
            providers: account.providers ?? [],
            fcmTokens: account.fcmTokens ?? []
        }
    }
}
