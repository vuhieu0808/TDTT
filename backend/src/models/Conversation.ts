import { SendUser } from "./Message.js";

interface Participant {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  joinedAt: FirebaseFirestore.Timestamp;
}

interface LastMessage {
  content: string;
  sender: SendUser;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface SeenUser {
  uid: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  participants: Participant[];
  participantIds: string[];

  groupName?: string; // tên nhóm chat hoặc tên hiển thị của người dùng khác
  groupAvatarUrl?: string; // URL ảnh đại diện nhóm chat hoặc của người dùng khác

  lastMessageAt?: FirebaseFirestore.Timestamp;
  lastMessage?: LastMessage;
  
  seenBy?: SeenUser[]; // uid
  unreadCount: { [uid: string]: number }; // uid -> count

  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}