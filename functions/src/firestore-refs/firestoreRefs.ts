import * as admin from 'firebase-admin'
import { CollectionReference, DocumentReference } from '@google-cloud/firestore'
import { AttendingRoom } from '../models/attendingRoom'
import { accountConverter } from '../converters/accountConverter'
import { attendingRoomConverter } from '../converters/attendingRoomConverter'
import { roomConverter } from '../converters/roomConverter'
import { messageConverter } from '../converters/messageConverter'
import { publicUserConverter } from '../converters/publicUserConverter'
import { AppAccount } from '../models/account'
import { Message } from '../models/message'
import { PublicUser } from '../models/publicUser'
import { Room } from '../models/room'

const db = admin.firestore()

/** accounts コレクションの参照 */
export const accountsRef: CollectionReference<AppAccount> = db
    .collection(`accounts`)
    .withConverter<AppAccount>(accountConverter)

/** account ドキュメントの参照 */
export const accountRef = ({ accountId }: { accountId: string }): DocumentReference<AppAccount> =>
    accountsRef.doc(accountId)

/** v1Message ドキュメントの参照 */
export const v1MessageRef = db.collection(`message`).doc(`v1Message`)

/** attendingRooms コレクションの参照 */
export const attendingRoomsRef = ({ userId }: { userId: string }): CollectionReference<AttendingRoom> =>
    v1MessageRef
        .collection(`users`)
        .doc(userId)
        .collection(`attendingRooms`)
        .withConverter<AttendingRoom>(attendingRoomConverter)

/** attendingRoom ドキュメントの参照 */
export const attendingRoomRef = ({
    userId,
    roomId
}: {
    userId: string
    roomId: string
}): DocumentReference<AttendingRoom> => attendingRoomsRef({ userId: userId }).doc(roomId)

/** room コレクションの参照 */
export const roomsRef: CollectionReference<Room> = v1MessageRef.collection(`rooms`).withConverter(roomConverter)

/** room ドキュメントの参照 */
export const roomRef = ({ roomId }: { roomId: string }): DocumentReference<Room> => roomsRef.doc(roomId)

/** messages コレクションの参照 */
export const messagesRef = ({ roomId }: { roomId: string }): CollectionReference<Message> =>
    roomRef({ roomId: roomId }).collection(`messages`).withConverter<Message>(messageConverter)

/** message ドキュメントの参照 */
export const messageRef = ({ roomId, messageId }: { roomId: string; messageId: string }): DocumentReference<Message> =>
    messagesRef({ roomId: roomId }).doc(messageId)

/** publicUsers コレクションの参照 */
export const publicUsersRef: CollectionReference<PublicUser> = db
    .collection(`publicUsers`)
    .withConverter<PublicUser>(publicUserConverter)

/** publicUser ドキュメントの参照 */
export const publicUserRef = ({ publicUserId }: { publicUserId: string }): DocumentReference<PublicUser> =>
    publicUsersRef.doc(publicUserId)
