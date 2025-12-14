import { Server } from "socket.io";
import { driveServices, WORKER_DOMAIN } from "../services/driveServices.js";
import { conversationDB } from "../models/db.js";
import { Conversation } from "../models/Conversation.js";
import { getFullUserProfile } from "./friendHelper.js";

export const emitMarkAsRead = async (io: Server, conversationId: string) => {
  const conversationRef = conversationDB.doc(conversationId);
  const conversationDoc = await conversationRef.get();
  io.to(conversationId).emit("mark-as-read", {
    conversationId,
    seenBy: conversationDoc.data()?.seenBy,
    unreadCount: conversationDoc.data()?.unreadCount,
  });
};

export const emitNewConversation = async (
  io: Server,
  conversation: Conversation
) => {
  const conversationData = {
    ...conversation,
    createdAt: conversation.createdAt.toDate().toISOString(),
    updatedAt: conversation.updatedAt.toDate().toISOString(),
    participants: conversation.participants.map((p) => ({
      ...p,
      joinedAt: p.joinedAt.toDate().toISOString(),
    })),
  };
  const participantData = await getFullUserProfile(conversation.participantIds);
  const payload = {
    conversation: conversationData,
    participantProfile: participantData,
  }
  for (const userId of conversation.participantIds) {
    io.to(userId).emit("new-conversation", payload);
    const userSockets = await io.in(userId).fetchSockets();
    if (userSockets.length > 0) {
      userSockets.forEach((socket) => {
        socket.join(conversation.id);
      });
    }
  }
};

export const getLinkFileFromConversation = async (
  conversationId: string,
  currentFileUrl: string
): Promise<string> => {
  if (!currentFileUrl || currentFileUrl.includes(WORKER_DOMAIN)) {
    return currentFileUrl;
  }
  try {
    const newFileData =
      await driveServices.uploadFileToConversationFolderFromUrl(
        currentFileUrl,
        conversationId
      );
    return newFileData.urlView;
  } catch (error) {
    console.error("Error ensuring internal File:", error);
    return currentFileUrl;
  }
};
