import { admin, db } from "../config/firebase.js";
import { Cooldown } from "../models/Cooldown.js";
import { cooldownDB, friendDB, friendRequestDB } from "../models/db.js";
import { Friend } from "../models/Friend.js";
import { getFullUserProfile } from "../utils/friendHelper.js";
import { conversationServices } from "./conversationServices.js";
import { io } from "../socket/index.js";
import { emitFriendRequestNotification } from "../utils/friendHelper.js";

export const friendServices = {
  getMatchRequests: async (userId: string) => {
    const [sentRequestsSnapshot, receivedRequestsSnapshot] = await Promise.all([
      friendRequestDB.where("senderId", "==", userId).get(),
      friendRequestDB.where("receivedId", "==", userId).get(),
    ]);
    return { sentRequestsSnapshot, receivedRequestsSnapshot };
  },

  swipeRight: async (senderId: string, receiverId: string) => {
    const [userA, userB] = [senderId, receiverId].sort();
    const friendShipId = `${userA}_${userB}`;

    const cooldownDoc = await cooldownDB.doc(friendShipId).get();
    if (cooldownDoc.exists) {
      const cooldownData = cooldownDoc.data() as Cooldown;
      const now = admin.firestore.Timestamp.now();
      if (cooldownData.expiresAt.toMillis() > now.toMillis()) {
        return { type: "on_cooldown" };
      }
    }

    const [existingFriendship, myExistingSending, reverseSending] =
      await Promise.all([
        friendDB.doc(friendShipId).get(),
        db
          .collection("friendRequests")
          .where("senderId", "==", senderId)
          .where("receivedId", "==", receiverId)
          .get(),
        db
          .collection("friendRequests")
          .where("senderId", "==", receiverId)
          .where("receivedId", "==", senderId)
          .get(),
      ]);

    if (existingFriendship.exists) {
      return { type: "already_friends" };
    }
    if (!myExistingSending.empty) {
      return { type: "request_already_sent" };
    }
    if (!reverseSending.empty) {
      const friendData: Friend = {
        userA: userA!,
        userB: userB!,
        createdAt: admin.firestore.Timestamp.now(),
      };

      await db.runTransaction(async (transaction) => {
        const friendRef = friendDB.doc(friendShipId);
        transaction.set(friendRef, friendData);

        if (!reverseSending.empty) {
          const docs = reverseSending.docs;

          if (docs.length > 0) {
            const reverseRequestRef = docs[0]!.ref;
            transaction.delete(reverseRequestRef);
          }
        }
      });
      await conversationServices.createConversation([userA!, userB!], "direct");
      return { type: "MATCHED", data: friendData };
    }

    const friendRequestRef = friendRequestDB.doc();

    const friendRequest = {
      id: friendRequestRef.id,
      senderId,
      receivedId: receiverId,
      requestedAt: admin.firestore.Timestamp.now(),
    };
    await friendRequestRef.set(friendRequest);
    emitFriendRequestNotification(io, senderId, receiverId);
    return { type: "request_sent", data: friendRequest };
  },

  swipeLeft: async (userId: string, receiverId: string) => {
    const [userA, userB] = [userId, receiverId].sort();
    const friendShipId = `${userA}_${userB}`;
    const cooldownRef = cooldownDB.doc(friendShipId);
    // set cooldownTime ban đầu là 1 (2^1 = 2 days), sau đó thì bắt đầu tăng dần cooldownTime khi có các lần unmatch tiếp theo, max là 5 (2^5 = 32 days)
    const cooldownDoc = await cooldownRef.get();
    let cooldownTimes = 1;
    if (cooldownDoc.exists) {
      const cooldownData = cooldownDoc.data() as Cooldown;
      cooldownTimes = Math.min(cooldownData.cooldownTime + 1, 5);
    }
    const expiresAt = admin.firestore.Timestamp.fromMillis(
      Date.now() + Math.pow(2, cooldownTimes) * 24 * 60 * 60 * 1000
    );

    await db.runTransaction(async (transaction) => {
      console.log("userId:", userId, "receiverId:", receiverId);
      const query1 = friendRequestDB
        .where("senderId", "==", userId)
        .where("receivedId", "==", receiverId);
      const query2 = friendRequestDB
        .where("senderId", "==", receiverId)
        .where("receivedId", "==", userId);
      const [friendRequestSnapshot1, friendRequestSnapshot2] = await Promise.all([
        transaction.get(query1),
        transaction.get(query2),
      ]);
      friendRequestSnapshot1.docs.forEach((doc) => {
        transaction.delete(doc.ref);
      });
      friendRequestSnapshot2.docs.forEach((doc) => {
        transaction.delete(doc.ref);
      });
      transaction.set(cooldownRef, {
        id: friendShipId,
        userA,
        userB,
        cooldownTime: cooldownTimes,
        expiresAt,
      });
    });
    return true;
  },

  getAllMatches: async (userId: string) => {
    const [friendsAsUserASnapshot, friendsAsUserBSnapshot] = await Promise.all([
      friendDB.where("userA", "==", userId).get(),
      friendDB.where("userB", "==", userId).get(),
    ]);

    const allFriendsDocs = [
      ...friendsAsUserASnapshot.docs,
      ...friendsAsUserBSnapshot.docs,
    ];

    const matchedUserIds = allFriendsDocs.map((doc) => {
      const friendData = doc.data() as Friend;
      return friendData.userA === userId ? friendData.userB : friendData.userA;
    });

    return await getFullUserProfile(matchedUserIds);
  },

  unmatchUser: async (userId: string, unmatchUserId: string) => {
    // xoá bạn bè
    const [userA, userB] = [userId, unmatchUserId].sort();
    const friendShipId = `${userA}_${userB}`;
    const friendRef = friendDB.doc(friendShipId);
    const friendDoc = await friendRef.get();

    if (!friendDoc.exists) return false;
    const cooldownRef = cooldownDB.doc(friendShipId);
    const cooldownDoc = await cooldownRef.get();
    let cooldownTimes = 1;
    if (cooldownDoc.exists) {
      const cooldownData = cooldownDoc.data() as Cooldown;
      cooldownTimes = Math.min(cooldownData.cooldownTime + 1, 5);
    }
    const expiresAt = admin.firestore.Timestamp.fromMillis(
      Date.now() + Math.pow(2, cooldownTimes) * 24 * 60 * 60 * 1000
    );
    await db.runTransaction(async (transaction) => {
      transaction.delete(friendRef);
      transaction.set(cooldownRef, {
        id: friendShipId,
        userA,
        userB,
        cooldownTime: cooldownTimes,
        expiresAt,
      });
    });
    return true;
  },
};
