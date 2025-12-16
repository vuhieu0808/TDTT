import express from 'express';
import * as llmSuggestController from '../controllers/llmSuggestController.js';

const llmSuggestRoute = express.Router();

llmSuggestRoute.post('/query', llmSuggestController.queryLLMHistory);
llmSuggestRoute.post('/suggest', llmSuggestController.emotionAnalysis);
llmSuggestRoute.post('/delete', llmSuggestController.deleteLLMHistory);
llmSuggestRoute.post("/telemetry", llmSuggestController.helpfulTelemetry);

export default llmSuggestRoute;