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
): Promise<{email: string}> => {
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
        return { email }
    } catch (e) {
        functions.logger.log(e)
        throw new Error(`⚠️ LINE の POST /oauth2/v2.1/verify で失敗しました。${e}`)
    }
}

/**
 *
 * @param email
 * @returns
 */
export const getLINEProfile = async (
    accessToken: string
): Promise<{userId: string, displayName: string, pictureUrl: string | null}> => {
    try {
        const response = await axios.get<LINEGetProfileResponse>(
            `https://api.line.me/v2/profile`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        )
        if (response.status !== 200) {
            throw new Error(`[${response.status}]: GET /v2/profile`)
        }
        return {
            userId: response.data.userId,
            displayName: response.data.displayName,
            pictureUrl: response.data.pictureUrl ?? null
        }
    } catch (e) {
        throw new Error(`⚠️ LINE の GET /v2/profile で失敗しました。${e}`)
    }
}


/**
 *
 * @param {string} email - メールアドレス
 * @returns
 */
export const getOrCreateFirebaseAuthUser = async (
    { uid, email }:{ uid: string, email: string}
): Promise<admin.auth.UserRecord> => {
    try {
        const userRecord = await admin.auth().getUserByEmail(email)
        functions.logger.log(
            `ログインに使用された LINE アカウント同じ Email の Firebase Auth ユーザーが見つかりました。
            (userId, email): (${userRecord.uid}, ${email})`
        )
        return userRecord
    } catch (e) {
        functions.logger.log(`新しく LINE アカウントの User ID でユーザーを作成します。`)
        const userRecord = await admin.auth().createUser({ uid, email })
        return userRecord
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
export const createCustomToken = async (userId: string): Promise<string> => {
    try {
        // firebaseAuthUserId が null でない場合は LINE の POST verify API
        // を叩いた流れで得られたものなので Custom Token へ入力するユーザー ID として使用する。
        // null の場合は LINE のユーザー ID を使用する。
        const customToken = await admin.auth().createCustomToken(userId)
        return customToken
    } catch (e) {
        throw new Error(`⚠️ LINE の GET /oauth2/v2.1/verify で失敗しました。${e}`)
    }
}
