import { db } from "../config/firebase.js";

export const friendDB = db.collection("friends");
export const friendRequestDB = db.collection("friendRequests");
export const userDB = db.collection("users");
export const conversationDB = db.collection("conversations");
export const messageDB = db.collection("messages");
export const cooldownDB = db.collection("cooldowns");
export const llmChatDB = db.collection("llmChat");
export const workSessionDB = db.collection("workSessions");
export const venueDB = db.collection("venues");