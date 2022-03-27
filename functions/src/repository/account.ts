import * as admin from 'firebase-admin'
import { CollectionReference, DocumentReference, Query } from '@google-cloud/firestore'
import { accountConverter } from '../converters/accountConverter'

/** Account のリポジトリ */
export class AccountRepository {
  static readonly collectionName = `account`

  static accountsRef: CollectionReference<Account> = admin.firestore()
      .collection(AccountRepository.collectionName)
      .withConverter<Account>(accountConverter)

  static accountRef(
      { accountId }: { accountId: string }
  ): DocumentReference<Account> {
      return AccountRepository.accountsRef
          .doc(accountId)
          .withConverter<Account>(accountConverter)
  }

  /** Account 一覧を取得する。 */
  static async fetchAccounts({
      queryBuilder,
      compare
  }: {
  queryBuilder?: (query: Query<Account>) => Query<Account>,
  compare?: (lhs: Account, rhs: Account) => number,
}): Promise<Account[]> {
      let query: Query<Account> = AccountRepository.accountsRef
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

  /** 指定した Account を取得する。 */
  static async fetchAccount(
      { accountId }: { accountId: string }
  ): Promise<Account | undefined> {
      const ds = await AccountRepository.accountRef({ accountId: accountId }).get()
      return ds.data()
  }
}
