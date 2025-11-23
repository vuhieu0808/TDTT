interface Attachment {
  url: string;
  name: string;
  size?: number;
}

export interface SendUser {
  // Người gửi tin nhắn
  uid: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: SendUser;
  content: string;

  attachments?: Attachment[];

  isEdited?: boolean;
  editedAt?: FirebaseFirestore.Timestamp;
  isDeleted?: boolean;
  deletedAt?: FirebaseFirestore.Timestamp;
  
  createdAt: FirebaseFirestore.Timestamp;
};

// sort theo conversationId (tăng dần) và createdAt (giảm dần)