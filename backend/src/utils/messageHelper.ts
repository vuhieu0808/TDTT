import { DocumentData } from "firebase-admin/firestore";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { admin } from "../config/firebase.js";

export const updateConversationAfterCreateMessage = async (
  conversationRef: admin.firestore.DocumentReference<DocumentData>,
  message: Message,
  senderId: string
) => {
  // update lại conversation theo lastMessage = message, updatedAt = now
  try {
    await conversationRef.firestore.runTransaction(async (transaction) => {
      const conversationDoc = await transaction.get(conversationRef);
      if (!conversationDoc.exists) {
        throw new Error("Conversation does not exist");
      }
      
      const conversationData = conversationDoc.data() as Conversation;
      const currentUnreadCount = conversationData.unreadCount;

      // Tăng unreadCount của tất cả participant trừ senderId
      conversationData.participants.forEach((participant) => {
        const memberId = participant.uid;
        const isSender = memberId === senderId;
        const prevCount = currentUnreadCount[memberId] || 0;
        currentUnreadCount[memberId] = isSender ? 0 : prevCount + 1;
      });

      const updateData: Partial<Conversation> = {
        seenBy: [senderId],
        lastMessageAt: message.createdAt,
        lastMessage: {
          content: message.content,
          senderId: message.senderId,
          createdAt: message.createdAt,
        },
        unreadCount: currentUnreadCount,
        updatedAt: admin.firestore.Timestamp.now(),
      };
      transaction.update(conversationRef, updateData);
      console.log("Conversation updated after creating message");
    });
  } catch (error) {
    console.error("Error updating conversation after creating message:", error);
    throw error;
  }
};
