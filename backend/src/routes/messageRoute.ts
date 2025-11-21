import express from "express";
import { sendMessage } from "../controllers/messageControllers.js";
import { verifyUserInConversation } from "../middlewares/friendMiddleware.js";

const messageRouter = express.Router();

messageRouter.post("/send/:conversationId", verifyUserInConversation, sendMessage);

export default messageRouter;