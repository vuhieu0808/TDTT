import { db, rtdb } from "../config/firebase.js";

export const getDetailsForUserIds = async (userIds: string[]) => {
  // Lấy id, displayName, avatarUrl của bạn bè
  const chunkSize = 10;
  const chunks = [];
  for (let i = 0; i < userIds.length; i += chunkSize) {
    chunks.push(userIds.slice(i, i + chunkSize));
  }

  const userSnapshots = await Promise.all(
    chunks.map((chunk) =>
      db.collection("users").where("uid", "in", chunk).get()
    )
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
