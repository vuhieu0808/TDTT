import express from 'express';
import { getConversations, getMessages } from '../controllers/conversationController.js';

const conversationRoute = express.Router();

conversationRoute.get("/", getConversations);
conversationRoute.get("/:conversationId/messages", getMessages);

export default conversationRoute;