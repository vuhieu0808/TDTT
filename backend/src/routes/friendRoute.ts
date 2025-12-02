import express from "express";

import {
  getMatches,
  sendMatch,
  unmatch,
} from "../controllers/friendController.js";

const friendRoute = express.Router();

friendRoute.post("/requests", sendMatch);
friendRoute.post("/requests/:targetUserId/unmatch", unmatch);
friendRoute.get("/requests", getMatches);

export default friendRoute;