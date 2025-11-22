interface Attachment {
  url: string;
  name: string;
  size?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;

  attachments?: Attachment[];

  isEdited?: boolean;
  editedAt?: FirebaseFirestore.Timestamp;
  isDeleted?: boolean;
  deletedAt?: FirebaseFirestore.Timestamp;
  
  createdAt: FirebaseFirestore.Timestamp;
};

// sort theo conversationId (tăng dần) và createdAt (giảm dần)