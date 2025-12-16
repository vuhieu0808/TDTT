import { Chat, GoogleGenAI, Content } from "@google/genai";
import { llmChatDB } from "../models/db.js";
import * as llmChatHelper from "../utils/llmChatHelper.js";
import { db } from "../config/firebase.js";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in environment variables.");
}
const ai = new GoogleGenAI({ apiKey: apiKey! });

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

async function deleteHistory(userId: string, conversationId: string) {
    const limit = 400;
    const query = llmChatDB.where('userId', '==', userId).where('conversationId', '==', conversationId).limit(limit);

    while(true) {
        let batch = db.batch();
        const snapshot = await query.get();
        if(snapshot.empty) {
            break;
        }
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
}

async function queryHistory(userId: string, conversationId: string): Promise<LLMHistory[]> {
    const ret: LLMHistory[] = [];
    const query = llmChatDB.where('userId', '==', userId).where('conversationId', '==', conversationId);
    try {
        const snapshot = await query.get();
        snapshot.forEach((doc) => {
            ret.push(doc.data() as LLMHistory);
        });
    } catch (error) {

    }

    return ret;
}

async function addHistory(history: LLMHistory): Promise<void> {
    const docName = `${history.userId}_${history.conversationId}`;
    const docRef = llmChatDB.doc(docName);

    const docSnapshot = await docRef.get();
    await docRef.set(history);
}

async function emotionAnalysis(userId: string, conversationId: string, userContextInput?: string): Promise<[boolean, string, LLMHistory]> {
    let messageList = await llmChatHelper.fetchConversation(userId, conversationId);
    if(messageList.length === 0) {
        return [false, "No conversation history found.", emptyLLMHistory()];
    }

    const userContext = userContextInput || "";

    messageList = llmChatHelper.extractLatestMessagesBlock(4, messageList);
    let flatMessageList = llmChatHelper.flattenSimplifiedMessages(messageList);
    const ret = await emotionAnalysisImpl(flatMessageList, userContext, false);
    if(ret[0]) {
        const llmHistory: LLMHistory = {
            userId: userId,
            conversationId: conversationId,
            conversationSegment: flatMessageList,
            userContext: userContext,
            llmSuggestion: ret[1],
            timestamp: new Date(),
            isHelpful: false
        };

        return [true, ret[1], llmHistory];
    }
    return [false, ret[1], emptyLLMHistory()];
}

async function emotionAnalysisImpl(conversation: string[], userContext: string, enableDebug?: boolean): Promise<[boolean, string]> {
    const debug = enableDebug || false;
    let errorString = "";
    const highendPermit = ["gemma-3-27b-it", "gemma-3-12b-it"];
    const lowendPermit = ["gemma-3-4b-it", "gemma-3-2b-it", "gemma-3-1b-it"];

    console.log(`[emotionAnalysisImpl] Request received. Debug mode: ${debug}`);
    if(debug) console.log(conversation);

    //using Ekman's six basic emotions + neutral
    const emotionRecognitionPrompt = `
    SYSTEM:
    You are an emotion recognition module.
    Your task is to identify the dominant known emotion and its intensity
    for each speaker in a text-only conversation.

    Primary evidence is the conversation text.
    Optional user context may help disambiguate tone or intent,
    but must not override explicit dialogue content.
    In the Optional User Context, "you" is Person A and "the opponent" or "the other person" is Person B.

    You must NOT generate explanations.
    You must output valid JSON only.
    You must NOT include any Markdown formatting, only plain JSON.

    Emotion labels are restricted to:
    [joy, sadness, anger, fear, disgust, surprise, neutral]

    Intensity scale:
    0.0 (absent) to 1.0 (very strong)

    USER:
    Conversation:
    ${conversation}
    Optional User Context (may be empty):
    ${userContext}

    TASK:
    Extract the dominant emotion and intensity for both speakers.

    OUTPUT FORMAT (JSON ONLY):
    {
        "person_A": {
            "emotion": "...",
            "intensity": 0.00
        },
        "person_B": {
            "emotion": "...",
            "intensity": 0.00
        }
    }
    `;

    let emotionRecognitionResponse: string = "";
    for(const m of highendPermit) {
        try {
            const response = await ai.models.generateContent({
                model: m,
                config: {
                    temperature: 0.1,
                    topP: 0.85,
                    topK: 40,
                },
                contents: emotionRecognitionPrompt
            });
            console.log(`[emotionAnalysisImpl] emotionRecognition running on ${m} done.`);
            if(response.text) {
                emotionRecognitionResponse = llmChatHelper.trimMarkdownJson(response.text);
            }
            errorString = "";
            if(debug) console.log(emotionRecognitionResponse);
            break;
        } catch (error) {
            errorString = `[emotionAnalysisImpl] emotionRecognition running on ${m} Error: ${error}`; 
            console.log(errorString);
        }
    }
    if(errorString !== "") {
        return [false, errorString];
    }

    //Emotion-Cause Reasoning (ECR-Chain)
    const ecrPrompt = `
    SYSTEM:
    You are an emotion-cause reasoning engine following the ECR-Chain framework.
    Your task is to infer the causes of already-identified emotions.

    Stages (must be followed internally):
    1. Summarize the conversation topic in 1 sentence
    2. Appraisal Analysis: Apply Cognitive Appraisal Theory. Explain the internal psychological gap (e.g., "The speaker expected A, but occurred B, threatening their ego/goal").
    3. Stimulus Deduction: Identify the exact utterance or event (Cause) that triggered the Appraisal
    4. Rationalize the cause in ONE concise sentence.
    5. Remove any speculative or unsupported inferences.

    Use the conversation as primary evidence.
    Use optional user context only to:
    - disambiguate intent
    - clarify background relationships
    - resolve ambiguity
    In the Optional User Context, "you" is Person A and "the opponent" or "the other person" is Person B.

    Rules:
    Do NOT reclassify emotions
    Do NOT include speculative psychology.
    Do NOT suggest responses.
    Do output JSON ONLY.
    Do NOT include any Markdown formatting, only plain JSON.

    USER:
    Conversation:
    ${conversation}
    Optional User Context (may be empty):
    ${userContext}

    Known Emotions:
    ${emotionRecognitionResponse}

    OUTPUT FORMAT (JSON ONLY):
    {
        "person_A": {
            "theme": "...",
            "stimulus": "...",
            "appraisal": "...",
            "rationalization": ""
        },
        "person_B": {
            "theme": "...",
            "stimulus": "...",
            "appraisal": "...",
            "rationalization": ""
        }
    }
    `

    let ecrResponse: string = "";
    for(const m of highendPermit) {
        try {
            const response = await ai.models.generateContent({
                model: m,
                config: {
                    temperature: 0.1,
                    topP: 0.85,
                    topK: 40,
                },
                contents: ecrPrompt
            });
            console.log(`[emotionAnalysisImpl] ECR running on ${m} done.`);
            if(response.text) {
                ecrResponse = llmChatHelper.trimMarkdownJson(response.text);
            }
            errorString = "";
            if(debug) console.log(ecrResponse);
            break;
        } catch (error) {
            errorString = `[emotionAnalysisImpl] ECR running on ${m} Error: ${error}`; 
            console.log(errorString);
        }
    }
    if(errorString !== "") {
        return [false, errorString];
    }

    ///// Generation

    let lastMessageFromA = "";
    for (let i = conversation.length - 1; i >= 0; i--) {
        if (conversation[i]!.startsWith("A:")) {
            lastMessageFromA = conversation[i]!.trim().slice(2).trim();
            break;
        }
    }

    if(debug) console.log("[emotionAnalysisImpl] Last message from Person A:\n", lastMessageFromA);

    const generationPrompt = `
    SYSTEM:
    You generate the next chat message for Person A.
    
    Use the ECR-Chain insights to be deeply empathetic:
    1. Acknowledge the Theme
    2. Validate the Appraisal (Address their internal feeling/logic)
    3. Respond to the Stimulus

    Follow these rules:
    - Match emotional intensity appropriately (do not escalate).
    - Match the language and punctuation style of the conversation. Use similar wording, sentence length, and level of formality. Do not mimic content, only style.
    - Detect language using in conversation correctly and strictly avoid mixing-up.
    - Be concise (max 2 sentences).
    - Maintain a calm, supportive tone.
    - Do not mention emotions explicitly unless natural.

    USER:
    Conversation so far:
    ${conversation}

    Optional User Request or Intent:
    ${userContext}
    In the Optional User Request, "you" is Person A and "the opponent" or "the other person" is Person B.

    Emotion States:
    ${emotionRecognitionResponse}

    ECR-Chain Analysis:
    ${ecrResponse}

    Person A style reference (do not repeat):
    "${lastMessageFromA}"

    TASK:
    Write the next message that Person A should send. 
    Respect person A style reference and emotional state.
    Write plain text ONLY, no JSON, no Markdown, no curly braces wrapped like the input
    Do NOT mention user role (e.g.: Person A:, Person B:) in your response.
    `
    let generation: string = "";
    for(const m of lowendPermit) {
        try {
            const response = await ai.models.generateContent({
                model: m,
                config: {
                    temperature: 0.7,
                    // topP: 0.85,
                },
                contents: generationPrompt
            });
            console.log(`[emotionAnalysisImpl] generation running on ${m} done.`);
            if(response.text) {
                generation = llmChatHelper.trimMarkdownJson(response.text);
            }
            errorString = "";
            console.log(`[emotionAnalysisImpl] generated text: ${generation}`);
            break;
        } catch (error) {
            errorString = `[emotionAnalysisImpl] generation ruunin on ${m} Error: ${error}`; 
            console.log(errorString);
        }
    }

    if(errorString !== "") {
        return [false, errorString];
    }

    return [true, generation];
}

export type LLMHistory = {
    userId: string;
    conversationId: string;
    conversationSegment: string[];
    userContext: string;
    llmSuggestion: string;
    timestamp: Date
    isHelpful: boolean;
}

function emptyLLMHistory(): LLMHistory {
    return {
        userId: "",
        conversationId: "",
        conversationSegment: [],
        userContext: "",
        llmSuggestion: "",
        timestamp: new Date(),
        isHelpful: false
    };
}

export const llmChatService = {
    getHistory,
    getHistoryString,
    updateHistory,
    emotionAnalysis
};