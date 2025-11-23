import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { messageServices } from "../services/messageServices.js";
import { SendUser } from "../models/Message.js";

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user?.uid;
    const { conversationId } = req.params;
    const { content } = req.body;
    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!conversationId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const sender: SendUser = {
      uid: senderId,
      displayName: req.user?.name || "Unknown",
      avatarUrl: req.user?.picture || null,
    }

    const newMessageFetched = await messageServices.sendMessage(conversationId, sender, content);
    const newMessage = {
      ...newMessageFetched,
      createdAt: newMessageFetched.createdAt.toDate().toISOString(),
    }
    res.status(201).json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error sending direct message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
