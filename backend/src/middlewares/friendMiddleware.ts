import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware.js";
import admin from "firebase-admin";

export const checkFriendShip = async(req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const senderId = req.user?.uid;
    const { recipientId } = req.body;
    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!recipientId) {
      return res.status(400).json({ message: "Missing recipientId" });
    }
    const [userA, userB] = [senderId, recipientId].sort();
    const friendShipId = `${userA}_${userB}`;
    const friendDoc = await admin.firestore().collection("friends").doc(friendShipId).get();
    if (!friendDoc.exists) {
      return res.status(403).json({ message: "You are not friends with this user" });
    }
    next(); 
  } catch (error) {
    console.error("Error checking friendship:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}