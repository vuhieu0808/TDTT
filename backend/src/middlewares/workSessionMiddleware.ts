import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware.js";
import { workSessionDB } from "../models/db.js";
import { WorkSession } from "../models/WorkSession.js";

export const verifyUserInSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.uid;
    const { workSessionId } = req.params;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!workSessionId) {
      return res.status(400).json({ message: "Missing workSessionId" });
    }
    const workSessionDoc = await workSessionDB.doc(workSessionId).get();
    if (!workSessionDoc.exists) {
      return res.status(404).json({ message: "Work session not found" });
    }
    const workSessionData = workSessionDoc.data() as WorkSession;
    const isParticipant = workSessionData.participants.some(participant => participant.uid === userId);
    if (!isParticipant) {
      return res.status(403).json({ message: "User is not a participant of this work session" });
    }
    next();
  } catch (error) {
    console.error("Error verifying user in work session:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
