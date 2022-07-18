import * as functions from 'firebase-functions'
import { accountConverter } from '../../../src/converters/accountConverter'
import { publicUserRef } from '../../../src/firestore-refs/firestoreRefs'

export const onCreateAccount = functions
    .region(`asia-northeast1`)
    .firestore.document(`/accounts/{accountId}`)
    .onCreate(async (snapshot) => {
        const account = accountConverter.fromFirestore(snapshot)
        const publicUser: PublicUser = {
            userId: account.accountId,
            displayName: account.displayName,
            imageURL: account.imageURL
        }
        try {
            await publicUserRef({ publicUserId: account.accountId }).set(publicUser)
        } catch (e) {
            functions.logger.error(`onCreateAccount に失敗しました: ${e}`)
        }
    })
