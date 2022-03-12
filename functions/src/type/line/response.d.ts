/**
 * LINE のログイン関係の API のレスポンスを定義する。
 * 参考：https://developers.line.biz/ja/reference/line-login/
 */


/** GET https://api.line.me/oauth2/v2.1/verify のレスポンス*/
interface LINEVerifyAPIResponse {
  scope: string
  client_id: string
  expires_in: number
}

/** GET https://api.line.me/v2/profile のレスポンス */
interface LINEGetProfileResponse {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}
