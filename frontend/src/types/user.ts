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
  dateOfBirth?: string; // YYYY-MM-DD
  photoGallery?: UserGallery[];

  status: "online" | "offline" | "working" | "break";
  lastActivity: string;

  // Thông tin dùng để matching

  isReadyToMatch: boolean;

  age?: number;
  // agePreference?: { min: number; max: number }; // [minAge, maxAge]

  gender?: "male" | "female" | "other";

  interests?: string[]; // sở thích

  availability?: number[];

  occupation?: string;
  occupationDescription?: string;

  location?: {
    lat: number; // vĩ độ
    lng: number; // kinh độ
  };
  maxDistanceKm?: number; // khoảng cách tối đa (km)

  workVibe?: "quiet-focus" | "creative-chat" | "deep-work" | "balanced";

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
