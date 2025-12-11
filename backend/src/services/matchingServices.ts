import { pipeline } from "@xenova/transformers";
import { User } from "../models/User.js";
import { friendDB, userDB, cooldownDB } from "../models/db.js";
import { Friend } from "../models/Friend.js";
import { Cooldown } from "../models/Cooldown.js";
import admin from "firebase-admin";

export interface MatchScore {
  user: User;
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
    // sessionGoals: number;
  };
}

class MatchingSystem {
  private embeddingModel: Awaited<ReturnType<typeof pipeline>> | null = null;
  private embeddingCache: Map<string, number[]> = new Map();

  private readonly WEIGHTS = {
    age: 0.1,
    interests: 0.15,
    availability: 0.15,
    occupation: 0.1,
    workDateRatio: 0.15,
    location: 0.15,
    workVibe: 0.2,
  };

  async initialize() {
    if (this.embeddingModel) return;
    console.log("Loading embedding model...");
    this.embeddingModel = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("Embedding model loaded.");
  }

  // Helpers

  private combineInterests(user: User): string {
    if (!user.interests || user.interests.length === 0) {
      return "";
    }
    return user.interests.join(", ");
  }

  private async getEmbedding(text: string): Promise<number[]> {
    if (!this.embeddingModel) {
      await this.initialize();
    }

    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }

    const cleanText = text.trim();
    if (!cleanText) return new Array(384).fill(0);

    const output = await (this.embeddingModel as any)(cleanText, {
      pooling: "mean",
      normalize: true,
    });

    const embedding = Array.from(output.data) as number[];
    this.embeddingCache.set(text, embedding);

    return embedding;
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += (vecA[i] || 0) * (vecB[i] || 0);
      normA += (vecA[i] || 0) * (vecA[i] || 0);
      normB += (vecB[i] || 0) * (vecB[i] || 0);
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    // Return similarity in range [0, 1]
    const similarity = dotProduct / (normA * normB);
    return Math.max(0, similarity);
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private calculateScore(valA: number, valB: number): number {
    let diff = Math.abs(valA - valB);
    return Math.exp(-Math.pow(diff / 25, 2));
  }

  private getCompatibilityLabel(score: number): string {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 55) return "Fair";
    return "Poor";
  }

  // public methods

  async calculateMatchScore(userA: User, userB: User): Promise<MatchScore> {
    await this.initialize();

    const [interestsScore, occupationScore] = await Promise.all([
      this.scoreInterests(userA, userB),
      this.scoreOccupation(userA, userB),
    ]);

    const breakdown = {
      age: this.scoreAge(userA, userB),
      interests: interestsScore,
      availability: this.scoreAvailability(userA, userB),
      occupation: occupationScore,
      workDateRatio: this.scoreWorkDateRatio(userA, userB),
      location: this.scoreLocation(userA, userB),
      workVibe: this.scoreWorkVibe(userA, userB),
      // sessionGoals: this.scoreSessionGoals(userA, userB),
    };

    // console.log(
    //   "Match breakdown between",
    //   userA.uid,
    //   "and",
    //   userB.uid,
    //   ":",
    //   breakdown
    // );

    const totalScore = Object.entries(this.WEIGHTS).reduce(
      (sum, [key, weight]) => {
        return sum + (breakdown[key as keyof typeof breakdown] || 0) * weight;
      },
      0
    );

    const score = Math.round(totalScore * 100);

    return {
      user: userB,
      totalScore: score,
      compatibility: this.getCompatibilityLabel(score),
      breakdown,
    };
  }

  async findMatches(
    currentUser: User,
    candidates: User[],
    limit: number = 10
  ): Promise<MatchScore[]> {
    const scores = await Promise.all(
      candidates
        .filter((c) => c.uid !== currentUser.uid)
        .map((c) => this.calculateMatchScore(currentUser, c))
    );

    return (
      scores
        // .filter((s) => s.totalScore >= 50) // Chỉ lấy Fair trở lên
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit)
    );
  }

  // private methods

  private scoreAge(userA: User, userB: User): number {
    if (!userA.age || !userB.age) return 0.3;

    const minA = userA.agePreference?.min ?? userA.age - 5;
    const maxA = userA.agePreference?.max ?? userA.age + 5;

    const minB = userB.agePreference?.min ?? userB.age - 5;
    const maxB = userB.agePreference?.max ?? userB.age + 5;

    const isB_fit_A = userB.age >= minA && userB.age <= maxA;
    const isA_fit_B = userA.age >= minB && userA.age <= maxB;

    if (isB_fit_A && isA_fit_B) return 1.0;
    if (isB_fit_A || isA_fit_B) return 0.7;

    const diff = Math.abs(userA.age - userB.age);
    if (diff <= 5) return 0.8;
    if (diff <= 10) return 0.5;
    return 0.2;
  }

  private async scoreInterests(userA: User, userB: User): Promise<number> {
    const text1 = this.combineInterests(userA);
    const text2 = this.combineInterests(userB);

    if (!text1 && !text2) return 0.5;
    if (!text1 || !text2) return 0.2;

    const [embeddingA, embeddingB] = await Promise.all([
      this.getEmbedding(text1),
      this.getEmbedding(text2),
    ]);

    if (embeddingA.length !== embeddingB.length) {
      console.error("Embedding dimensions mismatch!");
      return 0;
    }

    const similarity = this.cosineSimilarity(embeddingA, embeddingB);

    if (similarity > 0.7) return 1.0;
    if (similarity > 0.5) return 0.85;
    if (similarity > 0.3) return 0.7;
    if (similarity > 0.15) return 0.55;
    return Math.max(0.3, similarity);
  }

  private scoreAvailability(userA: User, userB: User): number {
    if (!userA.availability || !userB.availability) {
      return 0;
    }
    if (
      userA.availability.length !== 168 ||
      userB.availability.length !== 168
    ) {
      return 0;
    }

    let intersection = 0;
    let union = 0;
    for (let i = 0; i < 168; i++) {
      const availA = userA.availability[i] || 0;
      const availB = userB.availability[i] || 0;
      if (availA > 0 || availB > 0) {
        union++;
        if (availA > 0 && availB > 0) {
          intersection++;
        }
      }
    }

    if (union === 0) return 0;
    let jaccardIndex = intersection / union;
    if (intersection < 3) jaccardIndex *= 0.5;
    return jaccardIndex;
  }

  private async scoreOccupation(userA: User, userB: User): Promise<number> {
    const textA = `${userA.occupation || ""} ${
      userA.occupationDescription || ""
    }`.toLowerCase();

    const textB = `${userB.occupation || ""} ${
      userB.occupationDescription || ""
    }`.toLowerCase();

    if (!textA.trim() || !textB.trim()) {
      return 0.5;
    }

    const [embeddingA, embeddingB] = await Promise.all([
      this.getEmbedding(textA),
      this.getEmbedding(textB),
    ]);

    if (embeddingA.length !== embeddingB.length) {
      return 0;
    }

    const similarity = this.cosineSimilarity(embeddingA, embeddingB);

    if (similarity > 0.6) return 1.0;
    if (similarity > 0.4) return 0.8;
    if (similarity > 0.2) return 0.6;
    return 0.3;
  }

  private scoreWorkDateRatio(userA: User, userB: User): number {
    const ratioA = userA.workDateRatio || 50;
    const ratioB = userB.workDateRatio || 50;
    return this.calculateScore(ratioA, ratioB);
  }

  private scoreLocation(userA: User, userB: User): number {
    if (
      userA.location?.lat !== undefined &&
      userA.location?.lng !== undefined &&
      userB.location?.lat !== undefined &&
      userB.location?.lng !== undefined
    ) {
      const distance = this.haversineDistance(
        userA.location.lat,
        userA.location.lng,
        userB.location.lat,
        userB.location.lng
      );
      const maxDist = Math.min(
        userA.maxDistanceKm || 50,
        userB.maxDistanceKm || 50
      );

      // console.log(
      //   "Distance between",
      //   userA.uid,
      //   "and",
      //   userB.uid,
      //   ":",
      //   distance,
      //   "km"
      // );
      // console.log("Max acceptable distance:", maxDist, "km");

      if (distance > maxDist) return 0;
      const ratio = distance / maxDist;
      return Math.max(0, Math.exp(-3 * ratio * ratio));
    }
    return 0.3;
  }

  private scoreWorkVibe(userA: User, userB: User): number {
    if (!userA.workVibe || !userB.workVibe) return 0.5;
    const chatA = userA.workVibe.workChatRatio || 50;
    const chatB = userB.workVibe.workChatRatio || 50;
    let chatScore = this.calculateScore(chatA, chatB);

    const interactionA = userA.workVibe.interactionLevel || 50;
    const interactionB = userB.workVibe.interactionLevel || 50;
    let interactionScore = this.calculateScore(interactionA, interactionB);

    return chatScore * 0.6 + interactionScore * 0.4;
  }

  // private scoreSessionGoals(userA: User, userB: User): number {
  //   const goalsA = userA.sessionGoals;
  //   const goalsB = userB.sessionGoals;

  //   if (!goalsA || !goalsB) return 0.5;

  //   const maxWorkDiff = 180;
  //   const workDiff = Math.abs(
  //     (goalsA.workMinutes || 0) - (goalsB.workMinutes || 0)
  //   );
  //   const workScore = Math.max(0, 1 - workDiff / maxWorkDiff);

  //   const maxBreakDiff = 60;
  //   const breakDiff = Math.abs(
  //     (goalsA.breakMinutes || 0) - (goalsB.breakMinutes || 0)
  //   );
  //   const breakScore = Math.max(0, 1 - breakDiff / maxBreakDiff);

  //   const chatLevels: Record<string, number> = { low: 0, medium: 1, high: 2 };
  //   const chatA = goalsA.chatDesire || "medium";
  //   const chatB = goalsB.chatDesire || "medium";

  //   const chatDiff = Math.abs(
  //     (chatLevels[chatA] || 1) - (chatLevels[chatB] || 1)
  //   );

  //   const chatScoreArray = [1.0, 0.7, 0.3];
  //   const chatScore =
  //     (chatDiff < chatScoreArray.length ? chatScoreArray[chatDiff] : 0.3) ??
  //     0.3;

  //   return workScore * 0.4 + breakScore * 0.3 + chatScore * 0.3;
  // }

  clearCache() {
    this.embeddingCache.clear();
  }
}

async function testMatchingSystem() {
  const matcher = new MatchingSystem();
  await matcher.initialize();
  // tính thời gian từ đây đến khi xong
  const startTime = Date.now();
  const userA: User = {
    uid: "userA",
    displayName: "User A",
    email: "userA@example.com",
    status: "online",
    lastActivity: admin.firestore.Timestamp.now(),
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    //
    age: 25,
    agePreference: { min: 22, max: 30 },
    interests: ["hiking", "reading", "coding"],
    availability: new Array(168).fill(0).map((_, i) => {
      const day = Math.floor(i / 24);
      const hour = i % 24;
      // Available Mon-Fri 9am-5pm
      return day < 5 && hour >= 9 && hour < 17 ? 1 : 0;
    }),
    occupation: "Software Engineer",
    occupationDescription: "Works on web applications",
    workDateRatio: 70,
    location: { lat: 37.7749, lng: -122.4194 },
    maxDistanceKm: 20,
    workVibe: { type: "custom", workChatRatio: 30, interactionLevel: 40 },
    // sessionGoals: { workMinutes: 90, breakMinutes: 15, chatDesire: "medium" },
  };

  const userB: User = {
    uid: "userB",
    displayName: "User B",
    email: "userB@example.com",
    status: "online",
    lastActivity: admin.firestore.Timestamp.now(),
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    //
    age: 27,
    agePreference: { min: 24, max: 32 },
    interests: ["coding", "gaming", "traveling"],
    availability: new Array(168).fill(0).map((_, i) => {
      const day = Math.floor(i / 24);
      const hour = i % 24;
      // Available Mon-Fri 10am-6pm
      return day < 5 && hour >= 10 && hour < 18 ? 1 : 0;
    }),
    occupation: "Backend Developer",
    occupationDescription: "Builds server-side applications",
    workDateRatio: 65,
    location: { lat: 37.8044, lng: -122.2711 },
    maxDistanceKm: 30,
    workVibe: { type: "custom", workChatRatio: 40, interactionLevel: 50 },
    // sessionGoals: { workMinutes: 80, breakMinutes: 20, chatDesire: "high" },
  };
  // let users: User[] = [];
  // for (let i = 0; i < 100; i++) {
  //   users.push({ ...userB, uid: `userB_${i}` });
  // }
  // await matcher.calculateMatchScore(userA, userB);
  const matchScore = await matcher.calculateMatchScore(userA, userB);
  console.log("Match Score between User A and User B:", matchScore);
  // const matchScores = await matcher.findMatches(userA, users, 20);
  // console.log("Top Match Scores:", matchScores);
  const endTime = Date.now();
  console.log(`Time taken: ${(endTime - startTime) / 1000} seconds`);
}
// await testMatchingSystem();

const matchingSystem = new MatchingSystem();
await matchingSystem.initialize();

export const getCandidateUsers = async (user: User): Promise<User[]> => {
  try {
    const userSnapshot = await userDB.get();
    let candidates: User[] = [];
    const [friendA, friendB] = await Promise.all([
      friendDB.where("userA", "==", user.uid).get(),
      friendDB.where("userB", "==", user.uid).get(),
    ]);
    const [cooldownA, cooldownB] = await Promise.all([
      cooldownDB.where("userA", "==", user.uid).get(),
      cooldownDB.where("userB", "==", user.uid).get(),
    ]);
    const friendIds: string[] = [...friendA.docs, ...friendB.docs].map(
      (doc) => {
        const data = doc.data() as Friend;
        return data.userA === user.uid ? data.userB : data.userA;
      }
    );
    const cooldown: Cooldown[] = [...cooldownA.docs, ...cooldownB.docs].map(
      (doc) => {
        return doc.data() as Cooldown;
      }
    );
    userSnapshot.docs.forEach((doc) => {
      const candidate = doc.data() as User;
      if (candidate.uid === user.uid) return;
      if (friendIds.includes(candidate.uid)) return;
      const cd = cooldown.find(
        (c) =>
          (c.userA === user.uid && c.userB === candidate.uid) ||
          (c.userB === user.uid && c.userA === candidate.uid)
      );
      if (cd && cd.expiresAt.toMillis() > Date.now()) return;
      candidates.push(candidate);
    });
    return candidates;
  } catch (error) {
    console.error("Error fetching candidate users:", error);
    return [];
  }
};

export { matchingSystem };
