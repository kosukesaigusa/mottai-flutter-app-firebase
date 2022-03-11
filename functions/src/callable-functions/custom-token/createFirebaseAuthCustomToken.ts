import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

/**
 * LINE ログイン用の Firebase Auth のカスタムトークン認証のための Callable Function
 * リクエストボディで lineUserId を受け取る。
 */
export const createFirebaseAuthCustomToken = functions
    .region('asia-northeast1')
    .https.onCall(async (data) => {
        const lineUserId = data.lineUserId as string
        const customToken = await admin.auth().createCustomToken(lineUserId)
        return { customToken }
    })
