import { DocumentData } from "firebase-admin/firestore";
import { Conversation } from "../models/Conversation.js";
import { Message, SendUser } from "../models/Message.js";
import { admin } from "../config/firebase.js";
import { Server } from "socket.io";

export const updateConversationAfterCreateMessage = async (
  conversationRef: admin.firestore.DocumentReference<DocumentData>,
  message: Message,
  sender: SendUser
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
        const isSender = memberId === sender.uid;
        const prevCount = currentUnreadCount[memberId] || 0;
        currentUnreadCount[memberId] = isSender ? 0 : prevCount + 1;
      });

      const updateData: Partial<Conversation> = {
        seenBy: [sender],
        lastMessageAt: message.createdAt,
        lastMessage: {
          content: message.content,
          sender: message.sender,
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

export const emitNewMessage = async (io: Server, message: Message, conversationId: string) => {
  // Lấy conversation để gửi kèm
  const conversationRef = admin.firestore().collection("conversations").doc(conversationId);
  const conversationDoc = await conversationRef.get();
  io.to(conversationId).emit("new-message", {
    message,
    conversation: {
      id: conversationId,
      lastMessage: conversationDoc.data()?.lastMessage,
      lastMessageAt: conversationDoc.data()?.lastMessageAt,
    },
    unreadCount: conversationDoc.data()?.unreadCount,
  });
}