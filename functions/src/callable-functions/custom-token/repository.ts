import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import axios from 'axios'
import * as url from 'url'

/**
 * LINE の GET Verify API を実行してチャンネル ID と有効期限を返す。
 * @param {string} accessToken - アクセストークン
 */
export const getVerifyAPI = async (
    { accessToken }: {accessToken: string}
): Promise<{channelId: string, expiresIn: number}> => {
    try {
        const response = await axios.get<LINEGetVerifyAPIResponse>(
            `https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`
        )
        if (response.status !== 200) {
            throw new Error(`[${response.status}]: GET /oauth2/v2.1/verify`)
        }
        return {
            channelId: response.data.client_id,
            expiresIn: response.data.expires_in
        }
    } catch (e) {
        throw new Error(`⚠️ LINE の GET /oauth2/v2.1/verify で失敗しました。${e}`)
    }
}

/**
 * LINE の POST Verify API を実行して...
 * @param {string} accessToken - アクセストークン
 */
export const postVerifyAPI = async (
    { idToken }: {idToken: string}
): Promise<{firebaseAuthUserId: string | null}> => {
    const params = new url.URLSearchParams({
        id_token: idToken,
        client_id: `1656968545` // TODO: 後で修正する
    })
    try {
        const response = await axios.post<LINEPostVerifyAPIResponse>(
            `https://api.line.me/oauth2/v2.1/verify/`,
            params.toString(), {
                headers: { 'content-type': `application/x-www-form-urlencoded` }
            }
        )
        if (response.status !== 200) {
            throw new Error(`[${response.status}]: GET /oauth2/v2.1/verify`)
        }
        const email = response.data.email
        try {
            const userRecord = await admin.auth().getUserByEmail(email)
            return { firebaseAuthUserId: userRecord.uid }
        } catch (e) {
            return { firebaseAuthUserId: null }
        }
    } catch (e) {
        functions.logger.log(e)
        throw new Error(`⚠️ LINE の POST /oauth2/v2.1/verify で失敗しました。${e}`)
    }
}

/**
 * LINE の GET Profile API を実行して LINE のユーザー ID を得た上で
 * Firebase Auth の Custom Token を作成する。
 * また、引数の Firebase Auth のユーザー ID が null でない場合は、
 * それに対応する Firebase Auth ユーザーの存在を確認し、
 * そのメールアドレスと LINE のユーザーメールアドレスとが一致する場合は
 * LINE のユーザー ID の代わりに Firebase Auth のユーザー ID から
 * カスタムトークンを作成する。
 * @param {string} accessToken - アクセストークン
 * @param {string | null} firebaseAuthUserId - Firebase Auth のユーザー ID
 */
export const createCustomToken = async ({
    accessToken, firebaseAuthUserId
}:{ accessToken: string, firebaseAuthUserId: string | null }
): Promise<string> => {
    try {
        const response = await axios.get<LINEGetProfileResponse>(
            `https://api.line.me/v2/profile`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        )
        if (response.status !== 200) {
            throw new Error(`[${response.status}]: GET /v2/profile`)
        }
        // firebaseAuthUserId が null でない場合は LINE の POST verify API
        // を叩いた流れで得られたものなので Custom Token へ入力するユーザー ID として使用する。
        // null の場合は LINE のユーザー ID を使用する。
        const userId = firebaseAuthUserId ?? response.data.userId
        const customToken = await admin.auth().createCustomToken(userId)
        return customToken
    } catch (e) {
        throw new Error(`⚠️ LINE の GET /oauth2/v2.1/verify で失敗しました。${e}`)
    }
}
