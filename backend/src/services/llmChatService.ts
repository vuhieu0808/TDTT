import { Chat, GoogleGenAI, Content } from "@google/genai";
import { llmChatDB } from "../models/db.js";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in environment variables.");
}
const ai = new GoogleGenAI({ apiKey: apiKey! });

async function chatHandlerImpl(history: Content[], model: string, message: string): Promise<[boolean, string, Content[]]> {
    let chatHandle: Chat = ai.chats.create({
        model: model,
        history: history,
    });
    try {
        const response = await chatHandle.sendMessage({
            message: message,
        });
        return [true, response.text || "", chatHandle.getHistory(true)];
    } catch (error) {
        return [false, `Error processing the message: ${error}`, history];
    }
}

//chat & auto update history to database
async function chatHandler(userId: string, conversationId: string, history: Content[], message: string): Promise<[boolean, string]> {
    let ret = await chatHandlerImpl(history, "gemma-3-27b-it", message);
    if(!ret[0]) {
        ret = await chatHandlerImpl(history, "gemma-3-12b-it", message);
        if(ret[0]) {
            await updateHistory(userId, conversationId, ret[2]);
        }
    } else {
        await updateHistory(userId, conversationId, ret[2]);
    }
    return [ret[0], ret[1]];
}

async function getHistory(userId: string, conversationId: string): Promise<Content[]> {
    const str = await getHistoryString(userId, conversationId);
    try {
        return JSON.parse(str) as Content[];
    } catch {
        return [];
    }
}

async function getHistoryString(userId: string, conversationId: string): Promise<string> {
    const docRef = await llmChatDB.doc(userId).get();
    if(docRef.exists) {
        const userData = docRef.data();
        const llmHistoryString = userData?.[conversationId] as string || "";
        return llmHistoryString;
    }
    return "";
}

async function updateHistory(userId: string, conversationId: string, history: Content[]): Promise<void> {
    const docRef = llmChatDB.doc(userId);
    const llmHistoryString = JSON.stringify(history);

    const docSnapshot = await docRef.get();
    await docRef.set({ [conversationId]: llmHistoryString }, { merge: true });
}

export const llmChatService = {
    chatHandler,
    getHistory,
    getHistoryString,
    updateHistory
};