import { Participant } from "./Conversation.js";

export interface SessionGoal {
  uid: string;
  content: string[];
}

export interface ScheduleSession {
  startTime: Date;
  endTime: Date;
}

export interface WorkSession {
  id: string;
  title?: string;
  
  participants: Participant[];
  participantIds: string[];

  status: "pending" | "confirmed" | "active" | "completed" | "canceled";
  schedule: ScheduleSession;

  location?: {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
  }

  goals?: SessionGoal[];

  createdAt: FirebaseFirestore.Timestamp;
}