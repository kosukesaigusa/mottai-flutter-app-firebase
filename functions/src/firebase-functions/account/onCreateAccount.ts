import * as functions from 'firebase-functions'
import { accountConverter } from '~/src/converters/accountConverter'
import { publicUserRef } from '~/src/firestore-refs/firestoreRefs'
import { PublicUser } from '~/src/models/publicUser'

/**
 * 新しい account ドキュメントが作成されたときに発火する。
 * account ドキュメントに対応する publicUser ドキュメントを作成する。
 */
export const onCreateAccount = functions
    .region(`asia-northeast1`)
    .firestore.document(`/accounts/{accountId}`)
    .onCreate(async (snapshot) => {
        const account = accountConverter.fromFirestore(snapshot)
        const publicUser = new PublicUser({
            userId: account.accountId,
            displayName: account.displayName,
            imageURL: account.imageURL
        })
        try {
            await publicUserRef({ publicUserId: account.accountId }).set(publicUser)
        } catch (e) {
            functions.logger.error(`account ドキュメントの作成に伴う publicUser の作成に失敗しました: ${e}`)
        }
    })
