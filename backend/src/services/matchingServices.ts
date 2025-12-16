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
    location: number;
    workVibe: number;
  };
}

class MatchingSystem {
  private embeddingModel: Awaited<ReturnType<typeof pipeline>> | null = null;
  private embeddingCache: Map<string, number[]> = new Map();

  private readonly WEIGHTS = {
    age: 0.1,
    interests: 0.1,
    availability: 0.25,
    occupation: 0.2,
    location: 0.1,
    workVibe: 0.25,
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
    return similarity;
    // return Math.max(0, similarity);
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

  private HardFilter(userA: User, userB: User): boolean {
    if (!userA.availability || !userB.availability) {
      return false;
    }
    let avaiA = new Array<number>(42).fill(0);
    let avaiB = new Array<number>(42).fill(0);
    for (const val of userA.availability) {
      avaiA[val] = 1;
    }
    for (const val of userB.availability) {
      avaiB[val] = 1;
    }
    let intersection = 0;
    for (let i = 0; i < 42; i++) {
      const availA = avaiA[i] || 0;
      const availB = avaiB[i] || 0;
      if (availA > 0 && availB > 0) {
        intersection++;
      }
    }
    if (intersection === 0) return false;
    // if (userA.location && userB.location) {
    //   const distance = this.haversineDistance(
    //     userA.location.lat,
    //     userA.location.lng,
    //     userB.location.lat,
    //     userB.location.lng
    //   );
    //   const maxDist = Math.min(
    //     userA.maxDistanceKm || 50,
    //     userB.maxDistanceKm || 50
    //   );
    //   if (distance > maxDist) return false;
    // }
    return true;
  }

  // public methods

  async calculateMatchScore(userA: User, userB: User): Promise<MatchScore> {
    await this.initialize();

    if (!this.HardFilter(userA, userB)) {
      return {
        user: userB,
        totalScore: 0,
        compatibility: "Poor",
        breakdown: {
          age: 0,
          interests: 0,
          availability: 0,
          occupation: 0,
          location: 0,
          workVibe: 0,
        },
      };
    }

    const [interestsScore, occupationScore] = await Promise.all([
      this.scoreInterests(userA, userB),
      this.scoreOccupation(userA, userB),
    ]);

    const breakdown = {
      age: this.scoreAge(userA, userB),
      interests: interestsScore,
      availability: this.scoreAvailability(userA, userB),
      occupation: occupationScore,
      location: this.scoreLocation(userA, userB),
      workVibe: this.scoreWorkVibe(userA, userB),
    };

    // console.log(
    //   "Match breakdown between",
    //   userA.uid,
    //   "and",
    //   userB.uid,
    //   ":",
    //   breakdown
    // );

    const totalScore =
      breakdown.age * this.WEIGHTS.age +
      breakdown.interests * this.WEIGHTS.interests +
      breakdown.availability * this.WEIGHTS.availability +
      breakdown.occupation * this.WEIGHTS.occupation +
      breakdown.location * this.WEIGHTS.location +
      breakdown.workVibe * this.WEIGHTS.workVibe;

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
        // .slice(0, limit)
    );
  }

  // private methods

  private scoreAge(userA: User, userB: User): number {
    if (!userA.age || !userB.age) return 0.3;

    const diff = Math.abs(userA.age - userB.age);
    if (diff <= 5) return 0.8;
    if (diff <= 10) return 0.5;
    return 0.2;
  }

  private async scoreInterests(userA: User, userB: User): Promise<number> {
    const text1 = this.combineInterests(userA);
    const text2 = this.combineInterests(userB);

    if (!text1 && !text2) return 0.3;
    if (!text1 || !text2) return 0.3;

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
    let avaiA = new Array<number>(42).fill(0);
    let avaiB = new Array<number>(42).fill(0);
    for (const val of userA.availability) {
      avaiA[val] = 1;
    }
    for (const val of userB.availability) {
      avaiB[val] = 1;
    }

    let intersection = 0;
    let union = 0;
    for (let i = 0; i < 42; i++) {
      const availA = avaiA[i] || 0;
      const availB = avaiB[i] || 0;
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
    const occA = (userA.occupation || "").toLowerCase();
    const occB = (userB.occupation || "").toLowerCase();
    if (!occA || !occB) {
      return 0.3;
    }
    const descriptionA = (userA.occupationDescription || "").toLowerCase();
    const descriptionB = (userB.occupationDescription || "").toLowerCase();
    const collab = "This profession typically works with other professionals to complete projects and deliver outcomes.";
    const occAPrompt = `Profession: ${occA}.`;
    const occBPrompt = `Profession: ${occB}.`;
    const resA = `Main responsibilities: ${descriptionA || occA}`;
    const resB = `Main responsibilities: ${descriptionB || occB}`;
    const [roleA, roleB, respA, respB, collabEmb] = await Promise.all([
      this.getEmbedding(occAPrompt),
      this.getEmbedding(occBPrompt),
      this.getEmbedding(resA),
      this.getEmbedding(resB),
      this.getEmbedding(collab),
    ]);
    const roleSim = this.cosineSimilarity(roleA, roleB);
    const respSim = this.cosineSimilarity(respA, respB);
    const collabSimA = this.cosineSimilarity(respA, collabEmb);
    const collabSimB = this.cosineSimilarity(respB, collabEmb);
    const collabSim = (collabSimA + collabSimB) / 2;
    const finalScore =
      0.45 * roleSim + 0.4 * respSim + 0.15 * collabSim;
    return Math.min(1, Math.max(0, finalScore));
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
      const ratio = distance / maxDist;
      return Math.max(0, Math.exp(-3 * ratio * ratio));
    }
    return 0.3;
  }

  private scoreWorkVibe(userA: User, userB: User): number {
    const vibeA = userA.workVibe || "balanced";
    const vibeB = userB.workVibe || "balanced";

    const vibeMap: Record<string, Record<string, number>> = {
      "quiet-focus": {
        "quiet-focus": 1.0,
        balanced: 0.7, // Giảm nhẹ
        "creative-chat": 0.1, // Giảm mạnh: 2 người này ngồi cạnh nhau là thảm họa
        "deep-work": 0.9, // Tăng lên: 2 người này rất hợp nhau
      },
      "deep-work": {
        "deep-work": 1.0,
        balanced: 0.5,
        "quiet-focus": 0.9,
        "creative-chat": 0.0, // Deep work rất kỵ chat
      },
      balanced: {
        balanced: 1.0,
        "quiet-focus": 0.7,
        "creative-chat": 0.7,
        "deep-work": 0.5,
      },
      "creative-chat": {
        "creative-chat": 1.0,
        balanced: 0.7,
        "quiet-focus": 0.1,
        "deep-work": 0.0,
      },
    };

    return vibeMap[vibeA]?.[vibeB] || 0.5;
  }

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
    isReadyToMatch: true,
    //
    age: 25,
    // agePreference: { min: 22, max: 30 },
    interests: ["hiking", "reading", "coding"],
    availability: new Array(42).fill(0).map((_, i) => {
      const day = Math.floor(i / 24);
      const hour = i % 24;
      // Available Mon-Fri 9am-5pm
      return day < 5 && hour >= 9 && hour < 17 ? 1 : 0;
    }),
    occupation: "Software Engineer",
    occupationDescription: "Works on web applications",
    location: { lat: 37.7749, lng: -122.4194 },
    maxDistanceKm: 20,
    workVibe: "quiet-focus",
  };

  const userB: User = {
    uid: "userB",
    displayName: "User B",
    email: "userB@example.com",
    status: "online",
    lastActivity: admin.firestore.Timestamp.now(),
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    isReadyToMatch: true,
    //
    age: 27,
    // agePreference: { min: 24, max: 32 },
    interests: ["coding", "gaming", "traveling"],
    availability: new Array(42).fill(0).map((_, i) => {
      const day = Math.floor(i / 24);
      const hour = i % 24;
      // Available Mon-Fri 10am-6pm
      return day < 5 && hour >= 10 && hour < 18 ? 1 : 0;
    }),
    occupation: "Backend Developer",
    occupationDescription: "Builds server-side applications",
    location: { lat: 37.8044, lng: -122.2711 },
    maxDistanceKm: 30,
    workVibe: "deep-work",
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
      if (!candidate.isReadyToMatch) return;
      candidates.push(candidate);
    });
    return candidates;
  } catch (error) {
    console.error("Error fetching candidate users:", error);
    return [];
  }
};

export { matchingSystem };
