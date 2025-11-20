export interface UserGallery {
  uid: string;
  imgUrl: string;
  caption?: string;
  uploadedAt: FirebaseFirestore.Timestamp;
}

export interface User {
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
  lastActivity: FirebaseFirestore.Timestamp;
  
  location?: {
    lat: number; // vĩ độ
    lng: number; // kinh độ
  }
  
  interests?: string[]; // sở thích
  job?: string;

  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
