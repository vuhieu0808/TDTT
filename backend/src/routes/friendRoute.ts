import express from "express";

import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getAllFriends,
  getFriendRequests,
  cancelFriendRequest,
} from "../controllers/friendController.js";

const friendRoute = express.Router();

friendRoute.post("/requests", sendFriendRequest);
friendRoute.post("/requests/:requestId/accept", acceptFriendRequest);
friendRoute.post("/requests/:requestId/decline", declineFriendRequest);
friendRoute.post("/requests/:requestId/cancel", cancelFriendRequest);
friendRoute.get("/", getAllFriends);
friendRoute.get("/requests", getFriendRequests);

export default friendRoute;