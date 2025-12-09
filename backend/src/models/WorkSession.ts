import { Participant } from "./Conversation.js";

export interface SessionGoal {
  uid: string;
  content: string[];
}

export interface WorkSession {
  id: string;
  participants: Participant[];
  participantIds: string[];

  status: "pending" | "confirmed" | "active" | "completed" | "canceled";
  scheduledAt: Date;

  location?: {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
  }

  goals?: SessionGoal[];

  createdAt: FirebaseFirestore.Timestamp;
}