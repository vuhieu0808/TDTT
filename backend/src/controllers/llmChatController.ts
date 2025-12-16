import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { llmChatService } from "../services/llmChatService.js";

export const getLLMHistory = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    const conversationId = req.body?.conversationId as string;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!conversationId) {
        return res.status(400).json({ error: "conversationId is required" });
    }
    const historyString = await llmChatService.getHistoryString(userId, conversationId);

    if(!historyString) {
        return res.status(404).json({ error: "No history found" });
    } else {
        return res.status(200).json({ history: historyString });
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

    await llmChatService.updateHistory(userId, conversationId, []);
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

    const result = await llmChatService.emotionAnalysis(userId, conversationId, userContext);
    if (result[0]) {
        return res.status(200).json({ response: result[1] });
    } else {
        return res.status(500).json({ error: result[1] });
    }
}

export const helpfulTelemetry = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    const llmChatId = req.body?.llmChatId as string;
    const isHelpful = req.body?.isHelpful as boolean ?? false;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!llmChatId) {
        return res.status(400).json({ error: "llmChatId is required" });
    }
    
    await llmChatService.recordHelpfulTelemetry(userId, llmChatId, isHelpful);
}