interface Message {
    messageId: string
    createdAt?: FirebaseFirestore.Timestamp
    type: `plain` | `reply` | `images` | `information`
    senderId: string
    body: string
    imageURLs: string[]
    detail?: MessageDetail
    isDeleted: boolean
}

interface MessageDetail {
    something: string
    another: number
}
