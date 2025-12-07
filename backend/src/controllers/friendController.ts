import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { getDetailsForUserIds } from "../utils/friendHelper.js";
import { friendServices } from "../services/friendServices.js";
import { friendRequestDB, userDB } from "../models/db.js";

export const getFriendRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Lấy tất cả yêu cầu gửi và nhận của userId
    const [sentRequestsSnapshot, receivedRequestsSnapshot] = await Promise.all([
      friendRequestDB.where("senderId", "==", userId).get(),
      friendRequestDB.where("receivedId", "==", userId).get(),
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

export const swipeRight = async (req: AuthRequest, res: Response) => {
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
    const targetUserDoc = await userDB.doc(receiverId).get();
    if (!targetUserDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await friendServices.swipeRight(senderId, receiverId);
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

export const swipeLeft = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user?.uid;
    if (!senderId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const result = await friendServices.swipeLeft(senderId, receiverId);
    if (result) {
      return res.status(200).json({ message: "Swipe left successful" });
    } else {
      return res.status(400).json({ error: "Swipe left failed" });
    }
  } catch (error) {
    console.error("Error swiping left:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

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
    return res.status(200).json({ message: "Unmatched successfully and cooldown applied" });
  } catch (error) {
    console.error("Error unmatching user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
