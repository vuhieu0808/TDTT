import { Request, Response } from "express";
import { db, rtdb } from "../config/firebase.js";
import { admin } from "../config/firebase.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";

export const sendDirectMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user?.uid;
    const { recipientId, content, conversationId } = req.body;
    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!recipientId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    let conversationRef;
    if (conversationId) {
      conversationRef = db.collection("conversations").doc(conversationId);
    }
    if (!conversationRef) {
      // Tạo conversation mới
      conversationRef = db.collection("conversations").doc();
      const newConversation: Conversation = {
        id: conversationRef.id,
        type: "direct",
        participants: [
          { uid: senderId, joinedAt: admin.firestore.Timestamp.now() },
          { uid: recipientId, joinedAt: admin.firestore.Timestamp.now() },
        ],
        lastMessageAt: admin.firestore.Timestamp.now(),
        unreadCount: { [recipientId]: 0, [senderId]: 0 },
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };
      await conversationRef.set(newConversation);
    }

    const messageRef = db.collection("messages").doc();
    const newMessage: Message = {
      id: messageRef.id,
      conversationId: conversationRef.id,
      senderId,
      content,
      createdAt: admin.firestore.Timestamp.now(),
    };
    await messageRef.set(newMessage);

    await updateConversationAfterCreateMessage(conversationRef, newMessage, senderId);

    res.status(201).json({ message: "Message sent successfully", data: newMessage });

  } catch (error) {
    console.error("Error sending direct message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendGroupMessage = (req: AuthRequest, res: Response) => {};
