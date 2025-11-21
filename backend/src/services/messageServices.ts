import { emit } from "process";
import { db, admin } from "../config/firebase.js";
import { Message } from "../models/Message.js";
import { emitNewMessage, updateConversationAfterCreateMessage } from "../utils/messageHelper.js";
import { io } from "../socket/index.js";

export const messageServices = {
  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    const conversationRef = db.collection("conversations").doc(conversationId);
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
    await emitNewMessage(io, newMessage, conversationId);

    return newMessage;
  }
}