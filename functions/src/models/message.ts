export class Message {
    messageId = ``
    createdAt?: FirebaseFirestore.Timestamp
    type: `plain` | `reply` | `images` | `information` = `plain`
    senderId = ``
    body = ``
    imageURLs: string[] = []
    detail?: MessageDetail
    isDeleted = false

    constructor(partial?: Partial<Message>) {
        Object.assign(this, partial)
    }
}

class MessageDetail {
    foo = ``
    bar = ``

    constructor(partial?: Partial<MessageDetail>) {
        Object.assign(this, partial)
    }
}
