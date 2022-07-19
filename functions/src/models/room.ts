export class Room {
    roomId = ``
    hostId = ``
    workerId = ``
    updatedAt?: FirebaseFirestore.Timestamp

    constructor(partial?: Partial<Room>) {
        Object.assign(this, partial)
    }
}
