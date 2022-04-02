import * as admin from 'firebase-admin'
import { CollectionReference, DocumentReference, Query } from '@google-cloud/firestore'
import { publicUserConverter } from '../converters/publicUserConverter'

/** PublicUser のリポジトリ */
export class PublicUserRepository {
  static readonly collectionName = `publicUsers`

  static publicUsersRef: CollectionReference<PublicUser> = admin.firestore()
      .collection(PublicUserRepository.collectionName)
      .withConverter<PublicUser>(publicUserConverter)

  static publicUserRef(
      { publicUserId }: { publicUserId: string }
  ): DocumentReference<PublicUser> {
      return PublicUserRepository.publicUsersRef
          .doc(publicUserId)
          .withConverter<PublicUser>(publicUserConverter)
  }

  /** PublicUser 一覧を取得する。 */
  static async fetchPublicUsers({ queryBuilder, compare }: {
  queryBuilder?: (query: Query<PublicUser>) => Query<PublicUser>,
  compare?: (lhs: PublicUser, rhs: PublicUser) => number,
}): Promise<PublicUser[]> {
      let query: Query<PublicUser> = PublicUserRepository.publicUsersRef
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

  /** 指定した PublicUser を取得する。 */
  static async fetchPublicUser(
      { publicUserId }: { publicUserId: string }
  ): Promise<PublicUser | undefined> {
      const ds = await PublicUserRepository.publicUserRef({ publicUserId: publicUserId }).get()
      return ds.data()
  }
}
