interface Participant {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  joinedAt: FirebaseFirestore.Timestamp;
}

interface LastMessage {
  content: string;
  senderId: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  participants: Participant[];
  participantIds: string[];

  lastMessageAt?: FirebaseFirestore.Timestamp;
  lastMessage?: LastMessage;
  
  seenBy?: string[]; // uid
  unreadCount: { [uid: string]: number }; // uid -> count

  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}