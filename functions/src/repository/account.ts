import * as admin from 'firebase-admin'
import { CollectionReference, DocumentReference, Query } from '@google-cloud/firestore'
import { accountConverter } from '../converters/accountConverter'

/** AppAccount のリポジトリ */
export class AppAccountRepository {
  static readonly collectionName = `accounts`

  static accountsRef: CollectionReference<AppAccount> = admin.firestore()
      .collection(AppAccountRepository.collectionName)
      .withConverter<AppAccount>(accountConverter)

  static accountRef(
      { accountId }: { accountId: string }
  ): DocumentReference<AppAccount> {
      return AppAccountRepository.accountsRef
          .doc(accountId)
          .withConverter<AppAccount>(accountConverter)
  }

  /** AppAccount 一覧を取得する。 */
  static async fetchAccounts({
      queryBuilder,
      compare
  }: {
  queryBuilder?: (query: Query<AppAccount>) => Query<AppAccount>,
  compare?: (lhs: AppAccount, rhs: AppAccount) => number,
}): Promise<AppAccount[]> {
      let query: Query<AppAccount> = AppAccountRepository.accountsRef
      if (queryBuilder !== undefined) {
          query = queryBuilder(query)
      }
      const qs = await query.get()
      const result = qs.docs.map((qds) => qds.data())
      if (compare !== undefined) {
          result.sort(compare)
      }
      return result
  }

  /** 指定した AppAccount を取得する。 */
  static async fetchAccount(
      { accountId }: { accountId: string }
  ): Promise<AppAccount | undefined> {
      const ds = await AppAccountRepository.accountRef({ accountId: accountId }).get()
      return ds.data()
  }
}
