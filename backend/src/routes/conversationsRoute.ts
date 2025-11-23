import express from 'express';
import { getConversations, getMessages, markAsRead } from '../controllers/conversationController.js';
import { verifyUserInConversation } from '../middlewares/friendMiddleware.js';

const conversationRoute = express.Router();

conversationRoute.get("/", getConversations);
conversationRoute.get("/:conversationId/messages", verifyUserInConversation, getMessages);
conversationRoute.put("/:conversationId/mark-as-read", verifyUserInConversation, markAsRead);

export default conversationRoute;