export interface FriendRequest {
  id: string;
  senderId: string;
  receivedId: string;
  requestedAt: FirebaseFirestore.Timestamp;
}