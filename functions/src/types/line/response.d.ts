/**
 * LINE のログイン関係の API のレスポンスを定義する。
 * 参考：https://developers.line.biz/ja/reference/line-login/
 */


/** GET https://api.line.me/oauth2/v2.1/verify のレスポンス*/
interface LINEGetVerifyAPIResponse {
  scope: string
  client_id: string
  expires_in: number
}

/** POST https://api.line.me/oauth2/v2.1/verify のレスポンス*/
interface LINEPostVerifyAPIResponse {
  iss: string
  sub: string
  aud: string
  exp: number
  iat: number
  auth_time?: number
  nonce?: string
  amr?: string[]
  name: string
  picture?: string
  email: string
}

/** GET https://api.line.me/v2/profile のレスポンス */
interface LINEGetProfileResponse {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}
