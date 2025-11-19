interface Attchment {
  url: string;
  name: string;
  size?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;

  attachments?: Attchment[];

  isEdited?: boolean;
  editedAt?: FirebaseFirestore.Timestamp;
  isDeleted?: boolean;
  deletedAt?: FirebaseFirestore.Timestamp;
  
  createdAt: FirebaseFirestore.Timestamp;
};

// sort theo conversationId (tăng dần) và createdAt (giảm dần)