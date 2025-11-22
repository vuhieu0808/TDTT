import { db, rtdb } from "../config/firebase.js";
import { admin } from "../config/firebase.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";

export const conversationServices = {
  async createConversation(participantIds: string[], type: "direct" | "group") {
    const now = admin.firestore.Timestamp.now();
    const conversationRef = db.collection("conversations").doc();
    // Lấy avatarUrl và displayName của các participantIds
    const participantDataPromises = participantIds.map(async (uid) => {
      const userDoc = await db.collection("users").doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        return {  
          uid,
          displayName: userData?.displayName || "",
          avatarUrl: userData?.avatarUrl || "",
        };
      } else {
        return {
          uid,
          displayName: "",
          avatarUrl: "",
        };
      }
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
  },
  async getConversations(userId: string) {
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
  },
  async getMessages(conversationId: string, limit: number, cursor?: string) {
    let query = db
      .collection("messages")
      .where("conversationId", "==", conversationId)
      .orderBy("createdAt", "desc");
    if (cursor) {
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
  },
};
