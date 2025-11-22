export interface UserGallery {
  uid: string;
  imgUrl: string;
  caption?: string;
  uploadedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  coverUrl?: string;

  bio?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string; // YYYY-MM-DD
  photoGallery?: UserGallery[];

  status: "online" | "offline" | "working" | "break";
  lastActivity: number;
  
  location?: {
    lat: number; // vĩ độ
    lng: number; // kinh độ
  }
  
  interests?: string[]; // sở thích
  job?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Friend {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  status: "online" | "offline" | "working" | "break";
}

export interface FriendRequest {
  requestId: string;
  fromUid: string;
  toUid: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}