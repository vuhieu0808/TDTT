import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { messageServices } from "../services/messageServices.js";

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
    
    const newMessage = await messageServices.sendMessage(conversationId, senderId, content);

    res.status(201).json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error sending direct message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
