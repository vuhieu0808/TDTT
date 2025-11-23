import { Server } from "socket.io";
import { admin } from "../config/firebase.js";
export const emitMarkAsRead = async (io: Server, conversationId: string) => {
  const conversationRef = admin
    .firestore()
    .collection("conversations")
    .doc(conversationId);
  const conversationDoc = await conversationRef.get();
  io.to(conversationId).emit("mark-as-read", {
    conversationId,
    seenBy: conversationDoc.data()?.seenBy,
    unreadCount: conversationDoc.data()?.unreadCount,
  });
};
