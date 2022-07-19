import { FieldValue } from '@google-cloud/firestore'
import * as functions from 'firebase-functions'
import { publicUserRef } from '../../../src/firestore-refs/firestoreRefs'
import { accountConverter } from '../../../src/converters/accountConverter'

/**
 * account ドキュメントが更新されたときに発火する。
 * 表示名か画像 URL が変更されていれば、対応する publicUser ドキュメントも更新する。
 */
export const onUpdateAccount = functions
    .region(`asia-northeast1`)
    .firestore.document(`/accounts/{accountId}`)
    .onUpdate(async (snapshot) => {
        const before = accountConverter.fromFirestore(snapshot.before)
        const after = accountConverter.fromFirestore(snapshot.after)
        const willUpdate = before.displayName !== after.displayName || before.imageURL !== after.imageURL
        if (!willUpdate) {
            return
        }
        try {
            await publicUserRef({ publicUserId: after.accountId }).update({
                displayName: after.displayName,
                imageURL: after.imageURL,
                updatedAt: FieldValue.serverTimestamp()
            })
        } catch (e) {
            functions.logger.error(`account ドキュメントの更新に伴う publicUser の更新に失敗しました: ${e}`)
        }
    })
