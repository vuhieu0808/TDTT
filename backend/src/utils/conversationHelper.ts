import { Server } from "socket.io";
import { admin } from "../config/firebase.js";
import { driveServices, WORKER_DOMAIN } from "../services/driveServices.js";

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

export const getLinkFileFromConversation = async (conversationId: string, currentFileUrl: string): Promise<string> => {
  if (!currentFileUrl || currentFileUrl.includes(WORKER_DOMAIN)) {
    return currentFileUrl;
  }
  try {
    const newFileData = await driveServices.uploadFileToConversationFolderFromUrl(currentFileUrl, conversationId);
    return newFileData.urlView;
  } catch (error) {
    console.error("Error ensuring internal File:", error);
    return currentFileUrl;
  }
}