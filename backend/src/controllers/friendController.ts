import { Request, Response } from "express";
import { db, rtdb } from "../config/firebase.js";
import { admin } from "../config/firebase.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { FriendRequest } from "../models/FriendRequest.js";
import { Friend } from "../models/Friend.js";
import { getDetailsForUserIds } from "../utils/friendHelper.js";
import { Conversation } from "../models/Conversation.js";
import { conversationServices } from "../services/conversationServices.js";

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { receivedId, requestMessage } = req.body;
    const senderId = req.user?.uid;
    if (!senderId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (senderId === receivedId) {
      return res
        .status(400)
        .json({ error: "Cannot send friend request to yourself" });
    }
    console.log("Sender ID:", senderId);
    console.log("Received ID:", receivedId);
    // Kiểm tra rêcivedId có tồn tại không
    const receivedUserDoc = await db.collection("users").doc(receivedId).get();
    if (!receivedUserDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const [userA, userB] = [senderId, receivedId].sort();
    const friendShipId = `${userA}_${userB}`;

    // Kiểm tra xem đã là bạn bè chưa hoặc có yêu cầu kết bạn đang chờ xử lý không
    // Kiểm tra friendRequests theo cả 2 chiều
    const [
      alreadyFriendsSnapshot,
      existingFriendRequestSentSnapshot,
      existingFriendRequestReceivedSnapshot,
    ] = await Promise.all([
      db.collection("friends").doc(friendShipId).get(),
      db
        .collection("friendRequests")
        .where("senderId", "==", senderId)
        .where("receivedId", "==", receivedId)
        .get(),
      db
        .collection("friendRequests")
        .where("senderId", "==", receivedId)
        .where("receivedId", "==", senderId)
        .get(),
    ]);

    if (alreadyFriendsSnapshot.exists) {
      return res.status(400).json({ error: "You are already friends" });
    }
    if (
      !existingFriendRequestSentSnapshot.empty ||
      !existingFriendRequestReceivedSnapshot.empty
    ) {
      return res
        .status(400)
        .json({ error: "There is already a pending friend request" });
    }

    // Thêm yêu cầu kết bạn mới

    const friendRequestRef = db.collection("friendRequests").doc();

    const friendRequest: FriendRequest = {
      id: friendRequestRef.id,
      senderId,
      receivedId,
      requestMessage,
      requestedAt: admin.firestore.Timestamp.now(),
    };

    await friendRequestRef.set(friendRequest);

    return res.status(200).json({
      message: "Friend request sent successfully",
      requestId: friendRequestRef.id,
      request: friendRequest,
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    if (!requestId) {
      return res.status(400).json({ error: "Missing request ID" });
    }
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const request = await db.collection("friendRequests").doc(requestId).get();
    if (!request.exists) {
      return res.status(404).json({ error: "Friend request not found" });
    }
    if (request.data()?.receivedId !== userId) {
      return res.status(403).json({
        error: "You dont have permission to accept this friend request",
      });
    }

    const [userA, userB] = [
      request.data()?.senderId,
      request.data()?.receivedId,
    ].sort();

    const friend: Friend = {
      userA,
      userB,
      createdAt: admin.firestore.Timestamp.now(),
    };
    const friendShipId = `${userA}_${userB}`;

    const friendRequest = db
      .collection("friends")
      .doc(friendShipId)
      .set(friend);
    await db.collection("friendRequests").doc(requestId).delete();

    // Tạo cuộc trò chuyện trực tiếp giữa hai người bạn
    await conversationServices.createConversation(
      [request.data()?.senderId, request.data()?.receivedId],
      "direct"
    );

    return res
      .status(200)
      .json({ message: "Friend request accepted successfully", friendRequest });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const declineFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    if (!requestId) {
      return res.status(400).json({ error: "Missing request ID" });
    }
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const request = await db.collection("friendRequests").doc(requestId).get();
    if (!request.exists) {
      return res.status(404).json({ error: "Friend request not found" });
    }
    if (request.data()?.receivedId !== userId) {
      return res.status(403).json({
        error: "You dont have permission to decline this friend request",
      });
    }
    await db.collection("friendRequests").doc(requestId).delete();

    return res
      .status(200)
      .json({ message: "Friend request declined successfully" });
  } catch (error) {
    console.error("Error declining friend request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    if (!requestId) {
      return res.status(400).json({ error: "Missing request ID" });
    }
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const request = await db.collection("friendRequests").doc(requestId).get();
    if (!request.exists) {
      return res.status(404).json({ error: "Friend request not found" });
    }
    if (request.data()?.senderId !== userId) {
      return res.status(403).json({
        error: "You dont have permission to cancel this friend request",
      });
    }
    await db.collection("friendRequests").doc(requestId).delete();

    return res
      .status(200)
      .json({ message: "Friend request cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling friend request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const getAllFriends = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // Lấy tất cả bạn bè của userId, lưu ý user có thể là userA hoặc userB trong bảng friends
    const [friendsAsUserASnapshot, friendsAsUserBSnapshot] = await Promise.all([
      db.collection("friends").where("userA", "==", userId).get(),
      db.collection("friends").where("userB", "==", userId).get(),
    ]);
    const allFriendsDocs = [
      ...friendsAsUserASnapshot.docs,
      ...friendsAsUserBSnapshot.docs,
    ];
    const friendIds = allFriendsDocs.map((doc) => {
      const friendData = doc.data();
      return friendData.userA === userId ? friendData.userB : friendData.userA;
    });
    console.log("All friends for user", userId, ":", friendIds);
    const friendsDetails = await getDetailsForUserIds(friendIds);

    return res.status(200).json({ friends: friendsDetails });
  } catch (error) {
    console.error("Error getting all friends:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getFriendRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  
    // Lấy tất cả yêu cầu gửi và nhận của userId
    const [sentRequestsSnapshot, receivedRequestsSnapshot] = await Promise.all([
      db.collection("friendRequests").where("senderId", "==", userId).get(),
      db.collection("friendRequests").where("receivedId", "==", userId).get(),
    ]);
    const sendRequestIds = sentRequestsSnapshot.docs.map((doc) => {
      const requestData = doc.data();
      return requestData.receivedId;
    });
    const receivedRequestIds = receivedRequestsSnapshot.docs.map((doc) => {
      const requestData = doc.data();
      return requestData.senderId;
    });
    const [sentRequests, receivedRequests] = await Promise.all([
      getDetailsForUserIds(sendRequestIds),
      getDetailsForUserIds(receivedRequestIds),
    ]);

    return res.status(200).json({ sentRequests, receivedRequests });
  } catch (error) {
    console.error("Error getting friend requests:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
