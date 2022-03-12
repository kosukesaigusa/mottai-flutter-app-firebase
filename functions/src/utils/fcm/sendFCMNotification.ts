import { messaging } from 'firebase-admin'

/**
 * 1次元配列を 500 要素ずつの 2 次元配列に分割する
 */
const arrayChunk = ([...array], size = 500): string[][] => {
    return array.reduce(
        (acc, _, index) =>
            index % size ? acc : [...acc, array.slice(index, index + size)],
        []
    )
}

/**
 * FCMTarget（FCM トークンのリスト、現在の未読数のリスト）、
 * 通知内容、通知をタップしたときに遷移するべきページの情報を受け取って、通知を送信する。
 * ひとりひとり現在の未読数が異なっており、各ユーザーの複数の FCM トークンごとに
 * messaging.MulticastMessage を用いて送信する。
 * ひとりが 500 個以上の異なるトークンを保持することは本来想定していないが、500 個ごとに
 * チャンクして送信する。
 */
export const sendFCMByTargets = async function f(
    fcmTargets: FCMTarget[],
    title: string,
    body: string,
    path: RoutePath,
): Promise<void> {
    for (const fcmTarget of fcmTargets) {
        const twoDimensionTokens = arrayChunk(fcmTarget.fcmTokens)
        for (let i = 0; i < twoDimensionTokens.length; i++) {
            const message: messaging.MulticastMessage = {
                tokens: twoDimensionTokens[i],
                notification: {
                    title: title,
                    body: body
                },
                data: {
                    title: title,
                    body: body,
                    path: path,
                    click_action: `FLUTTER_NOTIFICATION_CLICK`,
                    id: `1`,
                    status: `done`
                },
                apns: {
                    headers: { 'apns-priority': `10` },
                    payload: {
                        aps: {
                            contentAvailable: true,
                            badge: fcmTarget.badgeNumber,
                            sound: `default`
                        }
                    }
                },
                android: {
                    priority: `high`,
                    notification: {
                        priority: `max`,
                        defaultSound: true,
                        notificationCount: 1 // 増加数
                    }
                }
            }
            const response = await messaging().sendMulticast(message)
            if (response.failureCount > 0) {
                const failedTokens: string[] = []
                response.responses.forEach((resp, j) => {
                    if (!resp.success) {
                        failedTokens.push(twoDimensionTokens[i][j])
                    }
                })
                console.warn(
                    `送信に失敗した FCM Token（${response.failureCount}個）: ${failedTokens}`
                )
                return
            }
            console.log(`指定した全員に通知送信が成功した`)
        }
    }
}

/**
 * 受け取った ユーザー ID に対して通知を打つ。
 */
export const sendFCMByUserIds = async function f(
    userIds: string[],
    title: string,
    body: string,
    path: RoutePath,
): Promise<void> {
    const fcmTargets: FCMTarget[] = []
    // TODO: userIdから FCMTarget の配列を作成する
    await sendFCMByTargets(fcmTargets, title, body, path)
}

/**
 * 受け取った FCM トークンに対して通知を打つ。
 * テスト用。
 */
export const sendFCMByToken= async function f(
    token: string,
    title: string,
    body: string,
    path: RoutePath,
): Promise<void> {
    const fcmTarget: FCMTarget = {
        fcmTokens: [token],
        badgeNumber: 1
    }
    await sendFCMByTargets([fcmTarget], title, body, path)
}

