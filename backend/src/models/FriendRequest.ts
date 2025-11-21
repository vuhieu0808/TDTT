export interface FriendRequest {
  id: string;
  senderId: string;
  receivedId: string;
  requestMessage?: string;
  requestedAt: FirebaseFirestore.Timestamp;
}