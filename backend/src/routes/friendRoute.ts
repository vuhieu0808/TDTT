import express from "express";

import {
  getMatchRequests,
  getMatches,
  swipeRight,
  swipeLeft,
  unmatch,
} from "../controllers/friendController.js";

const friendRoute = express.Router();

friendRoute.get("/match-requests", getMatchRequests); // lấy yêu cầu kết bạn
friendRoute.post("/swipe-right", swipeRight); // match/like
friendRoute.post("/swipe-left", swipeLeft); // pass/dislike
friendRoute.post("/requests/:targetUserId/unmatch", unmatch); // xóa bạn bè
friendRoute.get("/requests", getMatches); // lấy danh sách bạn bè

export default friendRoute;