import * as functions from 'firebase-functions'
import {
    createCustomToken,
    getLINEProfile,
    getOrCreateFirebaseAuthUser,
    getVerifyAPI,
    postVerifyAPI
} from './repository'

/**
 * LINE ログイン用の Firebase Auth のカスタムトークン認証のための Callable Function。
 * 行うべき処理は下記の通り。
 *
 * 1. GET /oauth2/v2.1/verify で accessToken の検証を行う。channelId と expiresIn を受け取り、
 * クライアントへのレスポンスとする。
 * 2. POST /oauth2/v2.1/verify/ で idToken の検証を行い、問題なければメールアドレスを取得する。
 * 3. 1 で検証した accessToken を用いて GET /v2/profile をコールし、
 * LINE の ユーザー ID とプロフィール情報を取得する。
 * 4. 取得したメールアドレスと一致する Firebase Auth ユーザーがすでに存在するか確かめる。
 * 存在すれば、4 の Custom Token の作成に使用するユーザー ID はその Firebase Auth ユーザーのユーザー ID
 * とする。存在しなければ、Firebase Auth にそのユーザー ID, メールアドレスで新しいユーザーを作成した上で
 * 3 の Custom Token の作成に使用するユーザー ID は 1 で検証を済ませた LINE のアクセストークンとする。
 * 5. 3 で得られるユーザー ID から Firebase Auth の Custom Token を作成する。
 */
export const createFirebaseAuthCustomToken = functions.region(`asia-northeast1`).https.onCall(async (data) => {
    const accessToken = data.accessToken as string
    const idToken = data.idToken as string
    try {
        // Step 1, 2
        const promises = await Promise.all([getVerifyAPI({ accessToken }), postVerifyAPI({ idToken })])
        const channelId = promises[0].channelId
        const expiresIn = promises[0].expiresIn
        const email = promises[1].email
        // Step 3
        const lineProfile = await getLINEProfile(accessToken)
        // Step 4
        const userRecord = await getOrCreateFirebaseAuthUser({ uid: lineProfile.userId, email })
        // Step 5
        const customToken = await createCustomToken(userRecord.uid)
        return { channelId, expiresIn, customToken }
    } catch (e) {
        if (e instanceof Error) {
            functions.logger.log(e.message)
        }
        throw new functions.https.HttpsError(`internal`, `LINE ログインを用いた認証に失敗しました。`)
    }
})
