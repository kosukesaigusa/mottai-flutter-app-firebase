import 'jest'
import { WrappedFunction, WrappedScheduledFunction } from 'firebase-functions-test/lib/main'
import { QueryDocumentSnapshot } from '@google-cloud/firestore'
import { onCreateAccount } from '~/src/firebase-functions/account/onCreateAccount'
import { AppAccount } from '~/src/models/account'
import { PublicUserRepository } from '~/src/repositories/publicUser'
import { testEnv } from '../../setUp'

// testEnv.mockConfig({ someApi: { key: `abc123` } })

describe(`onCrateAccount のテスト`, () => {
    let wrappedOnCreateAccount: WrappedScheduledFunction | WrappedFunction<QueryDocumentSnapshot>
    beforeAll(() => {
        wrappedOnCreateAccount = testEnv.wrap(onCreateAccount)
    })

    test(`新しい account ドキュメントが作成されると、publicUser ドキュメントが作成される。`, async () => {
        const accountId = `test-account-id`
        const path = `accounts/${accountId}`
        const account = new AppAccount({ accountId, displayName: `山田太郎`, imageURL: `https://google.com` })
        const snapshot = testEnv.firestore.makeDocumentSnapshot(account, path)

        // ラップした onCreateAccount 関数を模擬的に実行する
        await wrappedOnCreateAccount(snapshot)

        // 結果を検証する（publicUsers/:accountId ドキュメントが作成されているはず）
        const repository = new PublicUserRepository()
        const publicUser = await repository.fetchPublicUser({ publicUserId: accountId })
        expect(publicUser).toBeDefined()
        expect(publicUser?.userId).toBe(accountId)
        expect(publicUser?.displayName).toBe(`山田太郎`)
        expect(publicUser?.imageURL).toBe(`https://google.com`)
    })
})
