import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware.js";
import admin from "firebase-admin";
import { db, rtdb } from "../config/firebase.js";
import { Conversation } from "../models/Conversation.js";
import { conversationDB } from "../models/db.js";

export const checkFriendShip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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
    const friendDoc = await admin
      .firestore()
      .collection("friends")
      .doc(friendShipId)
      .get();
    if (!friendDoc.exists) {
      return res
        .status(403)
        .json({ message: "You are not friends with this user" });
    }
    next();
  } catch (error) {
    console.error("Error checking friendship:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyUserInConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.uid;
    const { conversationId } = req.params;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!conversationId) {
      return res.status(400).json({ message: "Missing conversationId" });
    }
    const conversationDoc = await conversationDB.doc(conversationId).get();
    if (!conversationDoc.exists) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    const conversationData = conversationDoc.data() as Conversation;
    const isParticipant = conversationData.participants.some(participant => participant.uid === userId);
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant of this conversation" });
    }
    next();
  } catch (error) {
    console.error("Error checking user in conversation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
