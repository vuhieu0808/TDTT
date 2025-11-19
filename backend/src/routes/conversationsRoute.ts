import express from 'express';
import { createConversation, deleteConversation, getConversation, getConversations } from '../controllers/conversationController.js';

const conversationRoute = express.Router();

conversationRoute.post("/", createConversation);
conversationRoute.get("/", getConversations);
conversationRoute.get("/:conversationId", getConversation);
conversationRoute.delete("/:conversationId", deleteConversation);

export default conversationRoute;