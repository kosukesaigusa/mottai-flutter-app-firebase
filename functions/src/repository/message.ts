import * as admin from 'firebase-admin'
import { CollectionReference, DocumentReference, Query } from '@google-cloud/firestore'
import { attendingRoomConverter } from '../converters/attendingRoomConverter'
import { messageConverter } from '../converters/messageConverter'
import { roomConverter } from '../converters/roomConverter'

/** message ドメイン関係のリポジトリ */
export class MessageRepository {
  static readonly domainCollectionName = `message`
  static readonly domainDocumentName = `v1Message`;
  static readonly attendingRoomSubCollectionName = `attendingRooms`;
  static readonly roomSubCollectionName = `rooms`;
  static readonly userSubCollectionName = `users`;
  static readonly messageSubCollectionName = `messages`;

  static readonly baseRef = admin.firestore().collection(this.domainCollectionName).doc(this.domainDocumentName)

  static attendingRoomsRef(
      { userId }: { userId: string }
  ): CollectionReference<AttendingRoom> {
      return this.baseRef
          .collection(this.userSubCollectionName)
          .doc(userId)
          .collection(this.attendingRoomSubCollectionName)
          .withConverter<AttendingRoom>(attendingRoomConverter)
  }

  static attendingRoomRef(
      { userId, roomId }: {userId: string, roomId: string}
  ): DocumentReference<AttendingRoom> {
      return this.attendingRoomsRef({ userId: userId }).doc(roomId)
  }

  static readonly roomsRef: CollectionReference<AttendingRoom> =
      this.baseRef
          .collection(this.roomSubCollectionName)
          .withConverter<AttendingRoom>(roomConverter)

  static roomRef(
      { roomId }: {roomId: string}
  ): DocumentReference<AttendingRoom> {
      return this.roomsRef.doc(roomId)
  }

  static readonly messagesRef: CollectionReference<Message> =
      this.baseRef
          .collection(this.roomSubCollectionName)
          .withConverter<Message>(messageConverter)

  static messageRef(
      { messageId }: {messageId: string}
  ): DocumentReference<Message> {
      return this.messagesRef.doc(messageId)
  }

  /** AttendingRoom 一覧を取得する。 */
  static async fetchAttendingRooms({
      userId,
      queryBuilder,
      compare
  }: {
    userId: string,
    queryBuilder?: (query: Query<AttendingRoom>) => Query<AttendingRoom>,
    compare?: (lhs: AttendingRoom, rhs: AttendingRoom) => number,
  }): Promise<AttendingRoom[]> {
      let query: Query<AttendingRoom> = this.attendingRoomsRef({ userId: userId })
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

  /** 指定した AttendingRoom を取得する。 */
  static async fetchAttendingRoom(
      { userId, roomId }: {userId: string, roomId: string}
  ): Promise<AttendingRoom | undefined> {
      const ds = await this.attendingRoomRef({ userId: userId, roomId: roomId }).get()
      return ds.data()
  }

  /** Room 一覧を取得する。 */
  static async fetchRooms({
      queryBuilder, compare
  }: {
    queryBuilder?: (query: Query<Room>) => Query<Room>,
    compare?: (lhs: Room, rhs: Room) => number,}): Promise<Room[]> {
      let query: Query<Room> = this.roomsRef
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

  /** 指定した Room を取得する。 */
  static async fetchRoom({ roomId }: {roomId: string}): Promise<Room | undefined> {
      const ds = await this.roomRef({ roomId: roomId }).get()
      return ds.data()
  }

  /** Message 一覧を取得する。 */
  static async fetchMessages({
      queryBuilder, compare
  }: {
    queryBuilder?: (query: Query<Message>) => Query<Message>,
    compare?: (lhs: Message, rhs: Message) => number,
    }): Promise<Message[]> {
      let query: Query<Message> = this.messagesRef
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

  /** 指定した Message を取得する。 */
  static async fetchMessage({ messageId }: { messageId: string }): Promise<Message | undefined> {
      const ds = await this.messageRef({ messageId: messageId }).get()
      return ds.data()
  }
}
