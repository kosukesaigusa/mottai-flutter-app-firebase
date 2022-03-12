import * as functions from 'firebase-functions'
import { createCustomToken, verifyAccessToken } from './repository'

/**
 * LINE ログイン用の Firebase Auth のカスタムトークン認証のための Callable Function。
 * リクエストボディで、クライアントで LINE ログインをした結果の accessToken を受け取って
 * LINE の GET https://api.line.me/oauth2/v2.1/verify を実行して確認する。
 * その後、
 * LINE の GET https://api.line.me/v2/profile を実行して LINE のユーザー ID を得る。
 * それを用いて Firebase Auth の Custom Token を作成する。
 */
export const createFirebaseAuthCustomToken = functions
    .region(`asia-northeast1`)
    .https.onCall(async (data) => {
        const accessToken = data.accessToken as string
        try {
            const promises = await Promise.all([
                verifyAccessToken({ accessToken }),
                createCustomToken({ accessToken })
            ])
            return {
                channelId: promises[0].channelId,
                expiresIn: promises[0].expiresIn,
                customToken: promises[1].customToken
            }
        } catch (e) {
            if (e instanceof Error) {
                functions.logger.log(e.message)
            }
            throw new functions.https.HttpsError(
                `internal`,
                `LINE ログインを用いた認証に失敗しました。`
            )
        }
    })
