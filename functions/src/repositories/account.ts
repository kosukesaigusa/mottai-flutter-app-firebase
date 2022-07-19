import { accountRef } from '../firestore-refs/firestoreRefs'
import { AppAccount } from '../models/account'

/** AppAccount のリポジトリクラス */
export class AppAccountRepository {
    /** 指定した AppAccount を取得する。 */
    async fetchAccount({ accountId }: { accountId: string }): Promise<AppAccount | undefined> {
        const ds = await accountRef({ accountId: accountId }).get()
        return ds.data()
    }
}
