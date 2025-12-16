import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { matchingSystem } from "../services/matchingServices.js";
import { userDB } from "../models/db.js";
import { User } from "../models/User.js";
import { getCandidateUsers } from "../services/matchingServices.js";
import * as matchingTelemetry from "../services/matchingTelemetry.js";

export const findMatches = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const limit = Number(req.query.limit) || 10;
    const currentUserDoc = await userDB.doc(userId).get();
    if (!currentUserDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    await matchingTelemetry.subscribe(userId);
    const currentUser = currentUserDoc.data() as User;
    const candidates = await getCandidateUsers(currentUser);
    const matchesFetched = await matchingSystem.findMatches(
      currentUser,
      candidates,
      limit
    );
    const matches = matchesFetched.map((match) => ({
      ...match,
      user: {
        ...match.user,
        lastActivity: match.user.lastActivity.toDate().toISOString(),
        createdAt: match.user.createdAt.toDate().toISOString(),
        updatedAt: match.user.updatedAt.toDate().toISOString(),
      },
    }));
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: "Failed to find matches" });
  }
};
