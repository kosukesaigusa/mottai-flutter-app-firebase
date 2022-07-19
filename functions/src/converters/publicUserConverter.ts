import { FieldValue, FirestoreDataConverter } from '@google-cloud/firestore'
import { PublicUser } from '../models/publicUser'

export const publicUserConverter: FirestoreDataConverter<PublicUser> = {
    fromFirestore(qds: FirebaseFirestore.QueryDocumentSnapshot): PublicUser {
        const data = qds.data()
        return {
            userId: qds.id,
            updatedAt: data.updatedAt,
            displayName: data.displayName,
            imageURL: data.imageURL
        }
    },
    toFirestore(publicUser: PublicUser): FirebaseFirestore.DocumentData {
        return {
            userId: publicUser.userId,
            updatedAt: FieldValue.serverTimestamp(),
            displayName: publicUser.displayName,
            imageURL: publicUser.imageURL
        }
    }
}
