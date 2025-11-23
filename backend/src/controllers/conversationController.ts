import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { conversationServices } from "../services/conversationServices.js";
import { Message } from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      console.log("User không hợp lệ");
      return res.status(401).json({ error: "Unauthorized" });
    }
    const conversationsFetched = await conversationServices.getConversations(
      userId
    );
    const conversations = conversationsFetched.map((doc: Conversation) => {
      return {
        ...doc,
        createdAt: doc.createdAt.toDate().toISOString(),
        updatedAt: doc.updatedAt.toDate().toISOString(),
        lastMessage: doc.lastMessage
          ? {
              ...doc.lastMessage,
              createdAt: doc.lastMessage.createdAt.toDate().toISOString(),
            }
          : null,
        lastMessageAt: doc.lastMessageAt?.toDate().toISOString(),
        participants: doc.participants.map((participant) => ({
          ...participant,
          joinedAt: participant.joinedAt.toDate().toISOString(),
        })),
      };
    });
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
    const { messages: messagesFetched, nextCursor } =
      await conversationServices.getMessages(conversationId, limit, cursor);
    const messages = messagesFetched.map((msg: Message) => ({
      ...msg,
      createdAt: msg.createdAt.toDate().toISOString(),
    }));

    return res.status(200).json({ messages, nextCursor });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
