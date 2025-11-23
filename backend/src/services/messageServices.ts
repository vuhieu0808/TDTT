import { emit } from "process";
import { db, admin } from "../config/firebase.js";
import { Message, SendUser } from "../models/Message.js";
import { emitNewMessage, updateConversationAfterCreateMessage } from "../utils/messageHelper.js";
import { io } from "../socket/index.js";

export const messageServices = {
  async sendMessage(conversationId: string, sender: SendUser, content: string): Promise<Message> {
    const conversationRef = db.collection("conversations").doc(conversationId);
    const messageRef = db.collection("messages").doc();
    const newMessage: Message = {
      id: messageRef.id,
      conversationId: conversationRef.id,
      sender,
      content,
      createdAt: admin.firestore.Timestamp.now(),
    };
    await messageRef.set(newMessage);

    await updateConversationAfterCreateMessage(conversationRef, newMessage, sender);
    await emitNewMessage(io, newMessage, conversationId);

    return newMessage;
  }
}