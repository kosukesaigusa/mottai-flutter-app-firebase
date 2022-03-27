import * as functions from 'firebase-functions'
import { PublicUserRepository } from '../../../src/repository/publicUser'
import { accountConverter } from '../../../src/converters/accountConverter'

export const onCreateAccount = functions
    .region(`asia-northeast1`)
    .firestore.document(`/accounts/{accountId}`)
    .onCreate(async (snapshot) => {
        const account = accountConverter.fromFirestore(snapshot)
        const publicUser: PublicUser = {
            userId: account.accountId,
            displayName: account.displayName,
            imageURL: account.imageURL ?? null
        }
        try {
            await PublicUserRepository
                .publicUserRef({ publicUserId: account.accountId }).set(publicUser)
        } catch (e) {
            functions.logger.error(`⚠️ onCreateAccount に失敗しました: ${e}`)
        }
    })
