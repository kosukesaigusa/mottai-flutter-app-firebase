/**
 * あるユーザーの FCM トークンのリストと、現在の未読数をセットでもつデータ
 */
interface FCMTarget {
  fcmTokens: string[]
  badgeNumber: number
}
