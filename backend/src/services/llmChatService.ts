import { Chat, GoogleGenAI, Content } from "@google/genai";
import { llmChatDB } from "../models/db.js";
import * as llmChatHelper from "../utils/llmChatHelper.js";

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
    const modelList = ["gemma-3-12b-it", "gemma-3-4b-it", "gemma-3-2b-it"];
    let ret: [boolean, string, Content[]] = [false, "", []];
    for (const m of modelList) {
        ret = await chatHandlerImpl(history, m, message);
        if(ret[0]) {
            await updateHistory(userId, conversationId, ret[2]);
            break;
        }
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

async function emotionAnalysis(userId: string, conversationId: string): Promise<[boolean, string]> {
    let messageList = await llmChatHelper.fetchConversation(userId, conversationId);
    if(messageList.length === 0) {
        return [false, "No conversation history found."];
    }

    messageList = llmChatHelper.extractLatestMessagesBlock(5, messageList);
    let flatMessageList = llmChatHelper.flattenSimplifiedMessages(messageList);
    return await emotionAnalysisImpl(flatMessageList);
    // return await emotionAnalysisImpl(flatMessageList, true);
}

async function emotionAnalysisImpl(conversation: string[], enableDebug?: boolean): Promise<[boolean, string]> {
    const debug = enableDebug || false;
    console.log(`[emotionAnalysisImpl] Request received. Debug mode: ${debug}`);
    if(debug) console.log(conversation);

    //using Ekman's six basic emotions + neutral
    const emotionRecognitionPrompt = `
    SYSTEM:
    You are an emotion recognition module.
    Your task is to identify the dominant known emotion and its intensity
    for each speaker in a text-only conversation.

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
    try {
        const response = await ai.models.generateContent({
            model: "gemma-3-27b-it",
            config: {
                temperature: 0.1,
                topP: 0.85,
                topK: 40,
            },
            contents: emotionRecognitionPrompt
        });
        console.log("[emotionAnalysisImpl] emotionRecognition done.");
        if(response.text) {
            emotionRecognitionResponse = llmChatHelper.trimMarkdownJson(response.text);
        }
        if(debug) console.log(emotionRecognitionResponse)
    } catch (error) {
        let errorString = `[emotionAnalysisImpl] emotionRecognition Error: ${error}`; 
        console.log(errorString);
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

    Rules:
    Do NOT reclassify emotions
    Do NOT include speculative psychology.
    Do NOT suggest responses.
    Do output JSON ONLY.
    Do NOT include any Markdown formatting, only plain JSON.

    USER:
    Conversation:
    ${conversation}

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
    try {
        const response = await ai.models.generateContent({
            model: "gemma-3-27b-it",
            config: {
                temperature: 0.1,
                topP: 0.85,
                topK: 40,
            },
            contents: ecrPrompt
        });
        console.log("[emotionAnalysisImpl] ECR done.");
        if(response.text) {
            ecrResponse = llmChatHelper.trimMarkdownJson(response.text);
        }
        if(debug) console.log(ecrResponse)
    } catch (error) {
        let errorString = `[emotionAnalysisImpl] ECR Error: ${error}`; 
        console.log(errorString);
        return [false, errorString];
    }

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
    try {
        const response = await ai.models.generateContent({
            model: "gemma-3-4b-it",
            config: {
                temperature: 0.7,
                // topP: 0.85,
            },
            contents: generationPrompt
        });
        console.log("[emotionAnalysisImpl] generation done.");
        if(response.text) {
            generation = llmChatHelper.trimMarkdownJson(response.text);
        }
        console.log("[emotionAnalysisImpl] generated text: ", generation);
    } catch (error) {
        let errorString = `[emotionAnalysisImpl] generation Error: ${error}`; 
        console.log(errorString);
        return [false, errorString];
    }

    return [true, generation];
}

export const llmChatService = {
    chatHandler,
    getHistory,
    getHistoryString,
    updateHistory,
    emotionAnalysis
};