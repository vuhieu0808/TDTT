import { db, rtdb } from "../config/firebase.js";
import { admin } from "../config/firebase.js";
import { Conversation, SeenUser } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { io } from "../socket/index.js";
import { emitMarkAsRead } from "../utils/conversationHelper.js";

export const conversationServices = {
  async createConversation(participantIds: string[], type: "direct" | "group") {
    try {
      const now = admin.firestore.Timestamp.now();
      const conversationRef = db.collection("conversations").doc();
      // Lấy avatarUrl và displayName của các participantIds
      const participantDataPromises = participantIds.map(async (uid) => {
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
          throw new Error(`User with ID ${uid} does not exist`);
        }
        const userData = userDoc.data();
        return {
          uid,
          displayName: userData?.displayName || "",
          avatarUrl: userData?.avatarUrl || "",
        };
      });
      const participantsDoc = await Promise.all(participantDataPromises);
      const participants = participantsDoc.map((data) => ({
        uid: data.uid,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        joinedAt: now,
      }));

      const newConversation: Conversation = {
        id: conversationRef.id,
        type,
        participants,
        participantIds,
        unreadCount: {
          ...participantIds.reduce((acc, uid) => {
            acc[uid] = 0;
            return acc;
          }, {} as { [uid: string]: number }),
        },
        createdAt: now,
        updatedAt: now,
      };
      await conversationRef.set(newConversation);
      return newConversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  },
  async getConversations(userId: string) {
    try {
      console.log("Fetching conversations for user:", userId);
      const snapshot = await db
        .collection("conversations")
        .where("participantIds", "array-contains", userId)
        .orderBy("updatedAt", "desc")
        .get();

      const conversations: Conversation[] = [];
      snapshot.forEach((doc) => {
        conversations.push(doc.data() as Conversation);
      });
      console.log("Conversations fetched:", conversations.length);
      return conversations;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  },

  async getMessages(conversationId: string, limit: number, cursor?: string, onlyMedia?: boolean) {
    try {
      let query = db
        .collection("messages")
        .where("conversationId", "==", conversationId);
      if (onlyMedia) {
        query = query.where("hasAttachments", "==", true);
      }
      query = query.orderBy("createdAt", "desc");
      if (cursor && cursor !== "null" && cursor !== "undefined") {
        const cursorDate = admin.firestore.Timestamp.fromDate(new Date(cursor));
        query = query.startAfter(cursorDate);
      }
      query = query.limit(limit + 1);
      const snapshot = await query.get();

      let messages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Message;
        messages.push(data);
      });

      let nextCursor: string | null = null;
      if (messages.length > limit) {
        const nextMessage = messages[messages.length - 1];
        nextCursor = nextMessage!.createdAt.toDate().toISOString();
        messages.pop();
      }
      messages = messages.reverse();
      return { messages, nextCursor };
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },

  async markAsRead(conversationId: string, seenUser: SeenUser) {
    try {
      const conversationRef = db
        .collection("conversations")
        .doc(conversationId);
      await db.runTransaction(async (transaction) => {
        const conversationDoc = await transaction.get(conversationRef);
        if (!conversationDoc.exists) {
          throw new Error("Conversation does not exist");
        }
        const conversationData = conversationDoc.data() as Conversation;
        // unreadCount
        const updatedUnreadCount = {
          ...conversationData.unreadCount,
          [seenUser.uid]: 0,
        };
        // seenBy
        const updatedSeenBy = conversationData.seenBy
          ? [...conversationData.seenBy]
          : [];
        const existingIndex = updatedSeenBy.findIndex(
          (user) => user.uid === seenUser.uid
        );
        if (existingIndex !== -1) {
          updatedSeenBy[existingIndex] = seenUser;
        } else {
          updatedSeenBy.push(seenUser);
        }
        transaction.update(conversationRef, {
          unreadCount: updatedUnreadCount,
          seenBy: updatedSeenBy,
          updatedAt: admin.firestore.Timestamp.now(),
        });
      });
      await emitMarkAsRead(io, conversationId);
      
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      throw error;
    }
  },
};
