export interface FriendRequest {
  senderId: string;
  receivedId: string;
  requestMessage?: string;
  requestedAt: FirebaseFirestore.Timestamp;
}