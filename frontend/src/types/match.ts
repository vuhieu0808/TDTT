import type { UserProfile } from "@/types/user";

export interface MatchScore {
  user: UserProfile;
  totalScore: number;
  compatibility: string; // "Excellent" | "Good" | "Fair" | "Poor"
  breakdown: {
    age: number;
    interests: number;
    availability: number;
    occupation: number;
    workDateRatio: number;
    location: number;
    workVibe: number;
    sessionGoals: number;
  };
}