import express from 'express';
import * as llmChatController from '../controllers/llmChatController.js';

const llmChatRoute = express.Router();

llmChatRoute.post('/query', llmChatController.queryLLMHistory);
llmChatRoute.post('/chat', llmChatController.emotionAnalysis);
llmChatRoute.post('/delete', llmChatController.deleteLLMHistory);
llmChatRoute.post("/telemetry", llmChatController.helpfulTelemetry);

export default llmChatRoute;