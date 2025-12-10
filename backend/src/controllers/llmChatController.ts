import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { llmChatService } from "../services/llmChatService.js";

export const getLLMHistory = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    const conversationId = req.body.conversationId as string;
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

export const chatController = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    const conversationId = req.body.conversationId as string;
    const message = req.body.message as string;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!conversationId) {
        return res.status(400).json({ error: "conversationId is required" });
    }
    if (!message) {
        return res.status(400).json({ error: "message is required" });
    }

    const history = await llmChatService.getHistory(userId, conversationId);
    let ret = await llmChatService.chatHandler(userId, conversationId, history, message);
    if(ret[0]) {
        return res.status(200).json({ response: ret[1] });
    } else {
        return res.status(500).json({ error: ret[1] });
    }
}

export const deleteLLMHistory = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    const conversationId = req.body.conversationId as string;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!conversationId) {
        return res.status(400).json({ error: "conversationId is required" });
    }

    await llmChatService.updateHistory(userId, conversationId, []);
    return res.status(200).json({ message: "History deleted successfully" });
}