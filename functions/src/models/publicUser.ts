export class PublicUser {
    userId = ``
    updatedAt?: FirebaseFirestore.Timestamp
    displayName = ``
    imageURL = ``

    constructor(partial?: Partial<PublicUser>) {
        Object.assign(this, partial)
    }
}
