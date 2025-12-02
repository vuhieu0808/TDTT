import { Response } from "express";
import { db } from "../config/firebase.js";
import { admin } from "../config/firebase.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { FriendRequest } from "../models/FriendRequest.js";
import { Friend } from "../models/Friend.js";
import { getDetailsForUserIds } from "../utils/friendHelper.js";
import { conversationServices } from "../services/conversationServices.js";
import { friendServices } from "../services/friendServices.js";

export const getFriendRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Lấy tất cả yêu cầu gửi và nhận của userId
    const [sentRequestsSnapshot, receivedRequestsSnapshot] = await Promise.all([
      db.collection("friendRequests").where("senderId", "==", userId).get(),
      db.collection("friendRequests").where("receivedId", "==", userId).get(),
    ]);
    const sendRequestIds = sentRequestsSnapshot.docs.map((doc) => {
      const requestData = doc.data();
      return requestData.receivedId;
    });
    const receivedRequestIds = receivedRequestsSnapshot.docs.map((doc) => {
      const requestData = doc.data();
      return requestData.senderId;
    });
    const [sentRequests, receivedRequests] = await Promise.all([
      getDetailsForUserIds(sendRequestIds),
      getDetailsForUserIds(receivedRequestIds),
    ]);

    return res.status(200).json({ sentRequests, receivedRequests });
  } catch (error) {
    console.error("Error getting friend requests:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMatch = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user?.uid;
    if (!senderId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ error: "Cannot send match request to yourself" });
    }
    const targetUserDoc = await db.collection("users").doc(receiverId).get();
    if (!targetUserDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await friendServices.sendMatch(senderId, receiverId);
    switch (result.type) {
      case "already_friends":
        return res.status(400).json({ error: "You are already friends" });
      case "request_already_sent":
        return res
          .status(400)
          .json({ error: "There is already a pending match request" });
      case "MATCHED":
        return res.status(200).json({
          message: "You have matched successfully",
          friendData: result.data,
        });
      case "request_sent":
        return res.status(200).json({
          message: "Match request sent successfully",
          request: result.data,
        });
      default:
        return res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error sending match request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMatches = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const matches = await friendServices.getAllMatches(userId);
    return res.status(200).json({ matches });
  } catch (error) {
    console.error("Error getting matches:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const unmatch = async (req: AuthRequest, res: Response) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user?.uid;
    if (!userId || !targetUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const success = await friendServices.unmatchUser(userId, targetUserId);
    if (!success) {
      return res.status(400).json({ error: "You are not friends" });
    }
    return res.status(200).json({ message: "Unmatched successfully" });
  } catch (error) {
    console.error("Error unmatching user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
