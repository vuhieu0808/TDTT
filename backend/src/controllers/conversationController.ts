import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { conversationServices } from "../services/conversationServices.js";

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      console.log("User không hợp lệ");
      return res.status(401).json({ error: "Unauthorized" });
    }
    const conversations = await conversationServices.getConversations(userId);
    return res.status(200).json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      console.log("User không hợp lệ");
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { conversationId } = req.params;
    const limit = Number(req.query.limit) || 50;
    const cursor = req.query.cursor as string;
    if (!conversationId) {
      return res.status(400).json({ error: "Missing conversation ID" });
    }
    const { messages, nextCursor } = await conversationServices.getMessages(
      conversationId,
      limit,
      cursor
    );
    return res.status(200).json({ messages, nextCursor });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
