export interface Attachment {
  id: string;
  urlView: string;
  urlDownload: string;
  size: number;
  originalName: string;
  storedName: string;
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
  hasAttachments: boolean;

  isEdited?: boolean;
  editedAt?: FirebaseFirestore.Timestamp;
  isDeleted?: boolean;
  deletedAt?: FirebaseFirestore.Timestamp;
  
  createdAt: FirebaseFirestore.Timestamp;
};

// sort theo conversationId (tăng dần) và createdAt (giảm dần)