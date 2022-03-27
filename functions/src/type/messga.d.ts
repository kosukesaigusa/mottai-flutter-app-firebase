interface Message {
  messageId: string
  createdAt?: FirebaseFirestore.Timestamp | null
  type: `plain` | `reply` | `images` | `information`
  senderId: string
  body: string
  imageURLs: string[]
  detail?: MessageDetail
}

interface MessageDetail {
  something: string
  another: number
}
