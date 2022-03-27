import { FieldValue } from "@google-cloud/firestore"

export const publicUserConverter = {
    fromFirestore(qds: FirebaseFirestore.QueryDocumentSnapshot): PublicUser {
        const data = qds.data()
        return {
            userId: qds.id,
            updatedAt: data.updatedAt ?? null,
            displayName: data.displayName,
            imageURL: data.imageURL ?? null
        }
    },
    toFirestore(publicUser: PublicUser): FirebaseFirestore.DocumentData {
        return {
            userId: publicUser.userId,
            updatedAt: FieldValue.serverTimestamp(),
            displayName: publicUser.displayName,
            imageURL: publicUser.imageURL ?? null
        }
    }
}
