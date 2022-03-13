import * as functions from 'firebase-functions'
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
        let userId = response.data.userId

        // TODO: 本当はユーザー ID ではなく、LINE のメールアドレスを取得して、
        // TODO: それと一致するかどうかを調べるようにしたい
        // firebaseAuthUserId が指定されている場合は、そのユーザーの存在確認をして
        // 見つかれば、Custom Token へ入力するユーザー ID を上書きする。
        if (firebaseAuthUserId !== null) {
            try {
                const userRecord = await admin.auth().getUser(firebaseAuthUserId)
                userId = userRecord.uid
            } catch {
                functions.logger.log(`⚠️ 対応するユーザーが見つかりませんでした。`)
            }
        }
        const customToken = await admin.auth().createCustomToken(userId)
        return { customToken }
    } catch (e) {
        throw new Error(`⚠️ LINE の GET /oauth2/v2.1/verify で失敗しました。${e}`)
    }
}
