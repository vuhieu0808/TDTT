interface Participant {
  uid: string;
  joinedAt: FirebaseFirestore.Timestamp;
}

interface LastMessage {
  content: string;
  senderId: string;
  createdAt: FirebaseFirestore.Timestamp;
}

interface Group {
  groupName: string;
  createdBy: string;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  participants: Participant[];

  lastMessageAt: FirebaseFirestore.Timestamp;
  lastMessage?: LastMessage;
  
  group?: Group;
  
  seenBy?: string[]; // uid
  unreadCount: { [uid: string]: number }; // uid -> count

  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}