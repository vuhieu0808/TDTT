import express from 'express';
import * as llmChatController from '../controllers/llmChatController.js';

const llmChatRoute = express.Router();

llmChatRoute.post('/get', llmChatController.getLLMHistory);
llmChatRoute.post('/chat', llmChatController.chatController);
llmChatRoute.post('/delete', llmChatController.deleteLLMHistory);
llmChatRoute.post('/emotionAnalysis', llmChatController.emotionAnalysis);

export default llmChatRoute;