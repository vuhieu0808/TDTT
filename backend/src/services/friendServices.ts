import { admin, db } from "../config/firebase.js";
import { Friend } from "../models/Friend.js";
import { getDetailsForUserIds } from "../utils/friendHelper.js";
import { conversationServices } from "./conversationServices.js";

export const friendServices = {
  sendMatch: async (senderId: string, receiverId: string) => {
    const [userA, userB] = [senderId, receiverId].sort();
    const friendShipId = `${userA}_${userB}`;
    const [existingFriendship, myExistingSending, reverseSending] =
      await Promise.all([
        db.collection("friends").doc(friendShipId).get(),
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
        const friendRef = db.collection("friends").doc(friendShipId);
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

    const friendRequestRef = db.collection("friendRequests").doc();

    const friendRequest = {
      id: friendRequestRef.id,
      senderId,
      receivedId: receiverId,
      requestedAt: admin.firestore.Timestamp.now(),
    };
    await friendRequestRef.set(friendRequest);
    return { type: "request_sent", data: friendRequest };
  },

  getAllMatches: async (userId: string) => {
    const [friendsAsUserASnapshot, friendsAsUserBSnapshot] = await Promise.all([
      db.collection("friends").where("userA", "==", userId).get(),
      db.collection("friends").where("userB", "==", userId).get(),
    ]);

    const allFriendsDocs = [
      ...friendsAsUserASnapshot.docs,
      ...friendsAsUserBSnapshot.docs,
    ];

    const matchedUserIds = allFriendsDocs.map((doc) => {
      const friendData = doc.data() as Friend;
      return friendData.userA === userId ? friendData.userB : friendData.userA;
    });

    return await getDetailsForUserIds(matchedUserIds);
  },

  unmatchUser: async (userId: string, unmatchUserId: string) => {
    const [userA, userB] = [userId, unmatchUserId].sort();
    const friendShipId = `${userA}_${userB}`;
    const friendRef = db.collection("friends").doc(friendShipId);
    const friendDoc = await friendRef.get();

    if (!friendDoc.exists) return false;
    await friendRef.delete();
    return true;
  }
};
