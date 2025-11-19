import express from "express";
import { sendDirectMessage, sendGroupMessage } from "../controllers/messageControllers.js";
import { checkFriendShip } from "../middlewares/friendMiddleware.js";

const messageRouter = express.Router();

messageRouter.post("/direct", checkFriendShip, sendDirectMessage);
messageRouter.post("/group", sendGroupMessage);

export default messageRouter;