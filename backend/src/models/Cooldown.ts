export interface Cooldown {
  id: string;
  userA: string;
  userB: string;
  cooldownTime: number; // max = 5 => 2^5 days
  expiresAt: FirebaseFirestore.Timestamp;
}