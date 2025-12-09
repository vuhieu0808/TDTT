import { Attachment } from "./Message.js";

export interface UserGallery {
  uid: string;
  img: Attachment;
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
  dateOfBirth?: string; // YYYY-MM-DD
  photoGallery?: UserGallery[];

  status: "online" | "offline" | "working" | "break";
  lastActivity: FirebaseFirestore.Timestamp;

  // Thông tin dùng để matching
  age?: number;
  agePreference?: { min: number; max: number }; // [minAge, maxAge]

  gender?: "male" | "female" | "other";

  interests?: string[]; // sở thích

  availability?: number[]; // [0,0,0,]

  occupation?: string;
  occupationDescription?: string;

  workDateRatio?: number; // tỷ lệ làm việc (0-100) (0=all date, 100 = all work)

  location?: {
    lat: number; // vĩ độ
    lng: number; // kinh độ
  };
  maxDistanceKm?: number; // khoảng cách tối đa (km)

  // workVibe?: "quiet-focus" | "creative-chat" | "deep-work" | "balanced";

  // sessionGoals?: {
  //   workMinutes: number;
  //   breakMinutes: number;
  //   chatDesire: "low" | "medium" | "high"; // mong muốn trò chuyện
  // };

  workVibe?: {
    type: string; // quiet-focus, creative-chat, deep-work, balanced, custom
    workChatRatio: number; // tỷ lệ làm việc và trò chuyện (0-100) (0=all work, 100=all chat)
    interactionLevel: number; // mức độ tương tác (0-100) (0=low, 100=high)
  };

  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
