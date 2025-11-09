export interface Message {
  conversationId: string;
  senderId: string;
  content: string;
  seenBy: string[]; // uid
  status: "sending" | "sent" | "failed";

  attachments?: {
    url: string;
    name: string;
  }[];

  isEdited?: boolean;
  editedAt?: FirebaseFirestore.Timestamp;
  isDeleted?: boolean;
  deletedAt?: FirebaseFirestore.Timestamp;
  
  createdAt: FirebaseFirestore.Timestamp;
};

// sort theo conversationId và createdAt giảm dần