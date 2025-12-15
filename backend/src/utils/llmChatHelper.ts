import { Conversation } from "../models/Conversation.js";
import { conversationServices } from "../services/conversationServices.js";

export type SimplifiedMessage = {
    role: "A" | "B";
    content: string;
}

export function flattenSimplifiedMessages(messages: SimplifiedMessage[]): string[] {
    let retList: string[] = [];
    messages.forEach(msg => {
        retList.push(`Person ${msg.role}: ${msg.content}`);
    });
    return retList
}

export async function fetchConversation(userId: string, conversationId: string): Promise<SimplifiedMessage[]> {
    const limit = 50;
    const conversationQuery = await conversationServices.getMessages(conversationId, limit);
    const retList: SimplifiedMessage[] = [];
    conversationQuery.messages.forEach((msg) => {
        if (msg.sender.uid === userId) {
            retList.push({ role: "A", content: msg.content });
        } else {
            retList.push({ role: "B", content: msg.content });
        }
    });

    //query put newest messages go first
    // retList.reverse();

    return retList;
}

export function trimMarkdownJson(input: string): string {
    if (!input) return "";
    // If there's a fenced code block with optional "json" label, capture it.
    const fenced = input.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) {
        return fenced[1].trim();
    }
    // Fallback: extract first JSON object/array-looking span
    const firstIdx = input.search(/[{[]/);
    if (firstIdx === -1) return input.trim();
    const lastObjIdx = input.lastIndexOf('}');
    const lastArrIdx = input.lastIndexOf(']');
    const lastIdx = Math.max(lastObjIdx, lastArrIdx);
    if (lastIdx === -1 || lastIdx <= firstIdx) return input.trim();
    return input.slice(firstIdx, lastIdx + 1).trim();
}

export function extractLatestMessagesBlock(maxBlockSize: number, messages: SimplifiedMessage[]): SimplifiedMessage[] {

    let counter = 0;
    let currentRole = "";
    const retList: SimplifiedMessage[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
        if (currentRole !== messages[i]!.role) {
            currentRole = messages[i]!.role;
            counter++;
        }
        if (counter > maxBlockSize) {
            break;
        }
        retList.push(messages[i]!);
    }

    retList.reverse();
    return retList;
}