import { userDB } from "../models/db.js";

export const getDetailsForUserIds = async (userIds: string[]) => {
  // Lấy id, displayName, avatarUrl của bạn bè
  const chunkSize = 10;
  const chunks = [];
  for (let i = 0; i < userIds.length; i += chunkSize) {
    chunks.push(userIds.slice(i, i + chunkSize));
  }

  const userSnapshots = await Promise.all(
    chunks.map((chunk) => userDB.where("uid", "in", chunk).get())
  );

  const userDetailsMap = new Map(
    userSnapshots
      .flatMap((snapshot) => snapshot.docs)
      .map((doc) => {
        const userData = doc.data();
        return [
          userData.uid,
          {
            _id: doc.id,
            displayName: userData.displayName,
            avatarUrl: userData.avatarUrl,
          },
        ];
      })
  );

  const friendsDetails = userIds
    .map((userId) => userDetailsMap.get(userId))
    .filter(Boolean);
  return friendsDetails;
};

export const getFullUserProfile = async (userIds: string[]) => {
  const chunkSize = 10;
  const chunks = [];
  for (let i = 0; i < userIds.length; i += chunkSize) {
    chunks.push(userIds.slice(i, i + chunkSize));
  }

  const userSnapshots = await Promise.all(
    chunks.map((chunk) => userDB.where("uid", "in", chunk).get())
  );

  const userDetailsMap = new Map(
    userSnapshots
      .flatMap((snapshot) => snapshot.docs)
      .map((doc) => {
        const userData = doc.data();
        return [
          userData.uid,
          {
            ...userData,
            lastActivity: userData.lastActivity.toDate().toISOString(),
            createdAt: userData.createdAt.toDate().toISOString(),
            updatedAt: userData.updatedAt.toDate().toISOString(),
          },
        ];
      })
  );
  const usersDetails = userIds
    .map((userId) => userDetailsMap.get(userId))
    .filter(Boolean);
  return usersDetails;
};
