import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import * as llmSuggestService from "../services/llmSuggestService.js";

export const queryLLMHistory = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    const conversationId = req.body?.conversationId as string;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!conversationId) {
        return res.status(400).json({ error: "conversationId is required" });
    }
    const historyList = await llmSuggestService.queryHistory(userId, conversationId);

    if(historyList.length === 0) {
        return res.status(404).json({ error: "No history found" });
    } else {
        return res.status(200).json({ history: historyList });
    }
}

export const deleteLLMHistory = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    const conversationId = req.body?.conversationId as string;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!conversationId) {
        return res.status(400).json({ error: "conversationId is required" });
    }

    await llmSuggestService.deleteHistory(userId, conversationId);
    return res.status(200).json({ message: "History deleted successfully" });
}

export const emotionAnalysis = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    const conversationId = req.body?.conversationId as string;
    const userContext = req.body?.userContext as string | undefined;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!conversationId) {
        return res.status(400).json({ error: "conversationId is required" });
    }

    const result = await llmSuggestService.emotionAnalysis(userId, conversationId, userContext);
    if (result[0]) {
        return res.status(200).json({ response: result[1] , llmSuggestId: result[2]});
    } else {
        return res.status(500).json({ error: result[1] });
    }
}

export const helpfulTelemetry = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    const llmSuggestId = req.body?.llmSuggestId as string;
    const isHelpful = req.body?.isHelpful as boolean ?? false;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!llmSuggestId) {
        return res.status(400).json({ error: "llmSuggestId is required" });
    }
    
    const ret = await llmSuggestService.helpfulTelemetry(llmSuggestId, isHelpful); 
    if(ret) {
        return res.status(200).json({ message: "Telemetry recorded" });
    } else {
        return res.status(500).json({ error: "Failed to record telemetry" });
    }  
}