export interface Friend {
  userA: string;
  userB: string;
  isNewFriend: boolean
  createdAt: FirebaseFirestore.Timestamp;
}