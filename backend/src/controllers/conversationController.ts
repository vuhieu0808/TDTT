import { Request, Response } from "express";
import { db, rtdb } from "../config/firebase.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { Conversation } from "../models/Conversation.js";
import { admin } from "../config/firebase.js";

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      console.log("User không hợp lệ");
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log("Fetching conversations for user:", userId);
    const snapshot = await db
      .collection("conversations")
      .where("participants", "array-contains", userId)
      .orderBy("updatedAt", "desc")
      .get();

    const conversations: Conversation[] = [];
    snapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() } as Conversation);
    });
    console.log("Conversations fetched:", conversations.length);
    return res.status(200).json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      console.log("User không hợp lệ");
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { type, participants, groupName } = req.body;
    if (
      !type ||
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      return res.status(400).json({ error: "Invalid conversation data" });
    }
    console.log("Creating conversation of type:", type, "for user:", userId);

    if (type === "direct") {
      const participantId = participants[0];
      if (participantId === userId) {
        return res
          .status(400)
          .json({ error: "Cannot create direct conversation with yourself" });
      }
      // Kiểm tra xem cuộc trò chuyện trực tiếp đã tồn tại chưa
      const existingConvSnapshot = await db
        .collection("conversations")
        .where("type", "==", "direct")
        .where("participants", "array-contains", userId)
        .get();

      existingConvSnapshot.forEach((doc) => {
        const data = doc.data() as Conversation;
        if (data.participants.includes(participantId)) {
          return res
            .status(400)
            .json({ error: "Direct conversation already exists" });
        }
      });
    }

    const now = new Date();
    const newConversation: Omit<Conversation, "id"> = {
      type,
      participants,
      ...(type === "group" && { groupName }),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    const convRef = await db.collection("conversations").add(newConversation);
    console.log("Conversation created with ID:", convRef.id);
    return res.status(201).json({
      message: "Conversation created successfully",
      conversation: { id: convRef.id, ...newConversation },
    });

  } catch (error) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const {conversationId} = req.params;
    const userId = req.user?.uid;
    if (!userId) {
      console.log("User không hợp lệ");
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!conversationId) {
      return res.status(400).json({ error: "Missing conversation ID" });
    }
    const convDoc = await db.collection("conversations").doc(conversationId).get();
    if (!convDoc.exists) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const conversation = { id: convDoc.id, ...convDoc.data() } as Conversation;
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ error: "Forbidden. You are not a participant of this conversation." });
    }
    return res.status(200).json({ conversation });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    const {conversationId} = req.params;
    const userId = req.user?.uid;
    if (!userId) {
      console.log("User không hợp lệ");
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!conversationId) {
      return res.status(400).json({ error: "Missing conversation ID" });
    }
    const convDoc = await db.collection("conversations").doc(conversationId).get();
    if (!convDoc.exists) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const conversation = { id: convDoc.id, ...convDoc.data() } as Conversation;
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ error: "Forbidden. You are not a participant of this conversation." });
    }
    await db.collection("conversations").doc(conversationId).delete();
    return res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}