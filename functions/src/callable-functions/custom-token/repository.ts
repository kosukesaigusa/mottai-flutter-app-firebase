import * as admin from 'firebase-admin'
import axios from "axios"

/**
 * LINE の Verify API を実行してチャンネル ID と有効期限を返す。
 * @param {string} accessToken - アクセストークン
 */
export const verifyAccessToken = async (
    { accessToken }: {accessToken: string}
): Promise<{channelId: string, expiresIn: number}> => {
    try {
        const response = await axios.get<LINEVerifyAPIResponse>(
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
 * LINE の GET Profile API を実行して LINE のユーザー ID を得た上で
 * Firebase Auth の Custom Token を作成する。
 * @param {string} accessToken - アクセストークン
 */
export const createCustomToken = async (
    { accessToken }: {accessToken: string}
): Promise<{customToken: string}> => {
    try {
        const response = await axios.get<LINEGetProfileResponse>(
            `https://api.line.me/v2/profile`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        )
        if (response.status !== 200) {
            throw new Error(`[${response.status}]: GET /v2/profile`)
        }
        const customToken = await admin.auth().createCustomToken(response.data.userId)
        return { customToken }
    } catch (e) {
        throw new Error(`⚠️ LINE の GET /oauth2/v2.1/verify で失敗しました。${e}`)
    }
}
