import { FieldValue } from '@google-cloud/firestore'
import * as functions from 'firebase-functions'
import { accountConverter } from '../../../src/converters/accountConverter'

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
            await snapshot.after.ref.update({
                displayName: after.displayName,
                imageURL: after.imageURL,
                updatedAt: FieldValue.serverTimestamp()
            })
        } catch (e) {
            functions.logger.error(`onUpdateAccount に失敗しました: ${e}`)
        }
    })
