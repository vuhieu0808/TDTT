import { pipeline } from "@xenova/transformers";
import { User } from "../models/User.js";
import { friendDB, userDB, cooldownDB } from "../models/db.js";
import { Friend } from "../models/Friend.js";
import { Cooldown } from "../models/Cooldown.js";

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
    sessionGoals: number;
  };
}

class MatchingSystem {
  private embeddingModel: Awaited<ReturnType<typeof pipeline>> | null = null;
  private embeddingCache: Map<string, number[]> = new Map();

  private readonly WEIGHTS = {
    age: 0.1,
    interests: 0.2,
    availability: 0.25,
    occupation: 0.1,
    workDateRatio: 0.1,
    location: 0.1,
    workVibe: 0.1,
    sessionGoals: 0.05,
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

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    const length = Math.min(vec1.length, vec2.length);

    for (let i = 0; i < length; i++) {
      const v1 = vec1[i] || 0;
      const v2 = vec2[i] || 0;
      dotProduct += v1 * v2;
      norm1 += v1 ** 2;
      norm2 += v2 ** 2;
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
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
      sessionGoals: this.scoreSessionGoals(userA, userB),
    };

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

    return scores
      // .filter((s) => s.totalScore >= 50) // Chỉ lấy Fair trở lên
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }

  // private methods

  private scoreAge(userA: User, userB: User): number {
    if (
      !userA.agePreference ||
      !userB.agePreference ||
      userA.age === undefined ||
      userB.age === undefined
    ) {
      return 0;
    }

    const inRangeA =
      userA.agePreference.min <= userB.age &&
      userB.age <= userA.agePreference.max;
    const inRangeB =
      userB.agePreference.min <= userA.age &&
      userA.age <= userB.agePreference.max;

    if (!inRangeA && !inRangeB) return 0;
    const ageDiff = Math.abs(userA.age - userB.age);
    if (ageDiff <= 2) return 1.0;
    if (ageDiff <= 5) return 0.8;
    if (ageDiff <= 10) return 0.6;
    return 0.5;
  }

  private async scoreInterests(userA: User, userB: User): Promise<number> {
    const text1 = this.combineInterests(userA);
    const text2 = this.combineInterests(userB);

    if (!text1 && !text2) return 0.5;

    const [embeddingA, embeddingB] = await Promise.all([
      this.getEmbedding(text1),
      this.getEmbedding(text2),
    ]);

    if (embeddingA.length !== embeddingB.length) {
      const minLength = Math.min(embeddingA.length, embeddingB.length);
      const truncatedA = embeddingA.slice(0, minLength);
      const truncatedB = embeddingB.slice(0, minLength);
      return this.cosineSimilarity(truncatedA, truncatedB);
    }

    return this.cosineSimilarity(embeddingA, embeddingB);
  }

  private scoreAvailability(userA: User, userB: User): number {
    if (!userA.availability || !userB.availability) {
      return 0.5;
    }
    if (
      userA.availability.length !== 168 ||
      userB.availability.length !== 168
    ) {
      return 0.5;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < userA.availability.length; i++) {
      const a = userA.availability[i] || 0;
      const b = userB.availability[i] || 0;
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

    if (similarity > 0.7) return 1.0;
    if (similarity > 0.5) return 0.8;
    if (similarity > 0.3) return 0.6;
    return similarity;
  }

  private async scoreOccupation(userA: User, userB: User): Promise<number> {
    // Sửa typo: occupationDescription thay vì occupationDecription
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

    const similarity = this.cosineSimilarity(embeddingA, embeddingB);

    if (similarity > 0.6) return 1.0;
    if (similarity > 0.4) return 0.8;
    if (similarity > 0.2) return 0.6;
    return 0.4;
  }

  private scoreWorkDateRatio(userA: User, userB: User): number {
    const ratioA = (userA.workDateRatio || 50) / 100;
    const ratioB = (userB.workDateRatio || 50) / 100;
    const distance = Math.abs(ratioA - ratioB);

    if (distance < 0.2) return 1.0;
    if (distance < 0.4) return 0.8;
    return 1 - distance;
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

      if (distance > maxDist) return 0;
      if (distance < 2) return 1;
      if (distance < 5) return 0.8;
      if (distance < 10) return 0.6;
      return Math.max(0, 1 - (distance - 10) / (maxDist - 10)) * 0.6;
    }
    return 0;
  }

  private scoreWorkVibe(userA: User, userB: User): number {
    const matrix: Record<string, Record<string, number>> = {
      "quiet-focus": {
        "quiet-focus": 1.0,
        "deep-work": 0.9,
        balanced: 0.6,
        "creative-chat": 0.2,
      },
      "deep-work": {
        "quiet-focus": 0.9,
        "deep-work": 1.0,
        balanced: 0.7,
        "creative-chat": 0.3,
      },
      balanced: {
        "quiet-focus": 0.6,
        "deep-work": 0.7,
        balanced: 1.0,
        "creative-chat": 0.7,
      },
      "creative-chat": {
        "quiet-focus": 0.2,
        "deep-work": 0.3,
        balanced: 0.7,
        "creative-chat": 1.0,
      },
    };

    return (
      matrix[userA.workVibe || "balanced"]?.[userB.workVibe || "balanced"] ??
      0.5
    );
  }

  private scoreSessionGoals(userA: User, userB: User): number {
    const goalsA = userA.sessionGoals;
    const goalsB = userB.sessionGoals;

    if (!goalsA || !goalsB) return 0.5;

    const maxWorkDiff = 180;
    const workDiff = Math.abs(
      (goalsA.workMinutes || 0) - (goalsB.workMinutes || 0)
    );
    const workScore = Math.max(0, 1 - workDiff / maxWorkDiff);

    const maxBreakDiff = 60;
    const breakDiff = Math.abs(
      (goalsA.breakMinutes || 0) - (goalsB.breakMinutes || 0)
    );
    const breakScore = Math.max(0, 1 - breakDiff / maxBreakDiff);

    const chatLevels: Record<string, number> = { low: 0, medium: 1, high: 2 };
    const chatA = goalsA.chatDesire || "medium";
    const chatB = goalsB.chatDesire || "medium";

    const chatDiff = Math.abs(
      (chatLevels[chatA] || 1) - (chatLevels[chatB] || 1)
    );

    const chatScoreArray = [1.0, 0.7, 0.3];
    const chatScore =
      (chatDiff < chatScoreArray.length ? chatScoreArray[chatDiff] : 0.3) ??
      0.3;

    return workScore * 0.4 + breakScore * 0.3 + chatScore * 0.3;
  }

  clearCache() {
    this.embeddingCache.clear();
  }
}

// async function testMatchingSystem() {
//   const matcher = new MatchingSystem();
//   await matcher.initialize();
//   // tính thời gian từ đây đến khi xong
//   const startTime = Date.now();
//   const userA: User = {
//     uid: "userA",
//     displayName: "User A",
//     email: "userA@example.com",
//     status: "online",
//     lastActivity: admin.firestore.Timestamp.now(),
//     createdAt: admin.firestore.Timestamp.now(),
//     updatedAt: admin.firestore.Timestamp.now(),
//     //
//     age: 25,
//     agePreference: { min: 22, max: 30 },
//     interests: ["hiking", "reading", "coding"],
//     availability: new Array(168).fill(0).map((_, i) => {
//       const day = Math.floor(i / 24);
//       const hour = i % 24;
//       // Available Mon-Fri 9am-5pm
//       return day < 5 && hour >= 9 && hour < 17 ? 1 : 0;
//     }),
//     occupation: "Software Engineer",
//     occupationDescription: "Works on web applications",
//     workDateRatio: 70,
//     location: { lat: 37.7749, lng: -122.4194 },
//     maxDistanceKm: 20,
//     workVibe: "deep-work",
//     sessionGoals: { workMinutes: 90, breakMinutes: 15, chatDesire: "medium" },
//   };

//   const userB: User = {
//     uid: "userB",
//     displayName: "User B",
//     email: "userB@example.com",
//     status: "online",
//     lastActivity: admin.firestore.Timestamp.now(),
//     createdAt: admin.firestore.Timestamp.now(),
//     updatedAt: admin.firestore.Timestamp.now(),
//     //
//     age: 27,
//     agePreference: { min: 24, max: 32 },
//     interests: ["coding", "gaming", "traveling"],
//     availability: new Array(168).fill(0).map((_, i) => {
//       const day = Math.floor(i / 24);
//       const hour = i % 24;
//       // Available Mon-Fri 10am-6pm
//       return day < 5 && hour >= 10 && hour < 18 ? 1 : 0;
//     }),
//     occupation: "Backend Developer",
//     occupationDescription: "Builds server-side applications",
//     workDateRatio: 65,
//     location: { lat: 37.8044, lng: -122.2711 },
//     maxDistanceKm: 30,
//     workVibe: "deep-work",
//     sessionGoals: { workMinutes: 80, breakMinutes: 20, chatDesire: "high" },
//   };
//   // let users: User[] = [];
//   // for (let i = 0; i < 100; i++) {
//   //   users.push({ ...userB, uid: `userB_${i}` });
//   // }
//   // await matcher.calculateMatchScore(userA, userB);
//   const matchScore = await matcher.calculateMatchScore(userA, userB);
//   console.log("Match Score between User A and User B:", matchScore);
//   // const matchScores = await matcher.findMatches(userA, users, 20);
//   // console.log("Top Match Scores:", matchScores);
//   const endTime = Date.now();
//   console.log(`Time taken: ${(endTime - startTime) / 1000} seconds`);
// }
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
