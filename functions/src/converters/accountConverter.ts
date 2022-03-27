import { FieldValue } from "@google-cloud/firestore"

export const accountConverter = {
    fromFirestore(qds: FirebaseFirestore.QueryDocumentSnapshot): Account {
        const data = qds.data()
        return {
            accountId: qds.id,
            createdAt: data.createdAt ?? null,
            updatedAt: data.updatedAt ?? null,
            displayName: data.displayName,
            imageURL: data.imageURL ?? null,
            providers: data.providers ?? []
        }
    },
    toFirestore(account: Account): FirebaseFirestore.DocumentData {
        return {
            accountId: account.accountId,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            displayName: account.displayName,
            imageURL: account.imageURL ?? null,
            providers: account.providers ?? []
        }
    }
}
