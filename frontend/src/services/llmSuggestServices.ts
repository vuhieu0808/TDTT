import api from "@/lib/axios";

export interface LLMHistory {
	llmChatId: string;
	userId: string;
	conversationId: string;
	conversationSegment: string[];
	userContext: string;
	llmSuggestion: string;
	timestamp: string;
	isHelpful: boolean;
}

export interface QueryLLMHistoryRequest {
	userId: string;
	conversationId: string;
}

export interface QueryLLMHistoryResponse {
	success: boolean;
	data?: LLMHistory[];
	message?: string;
}

export interface EmotionAnalysisRequest {
	userId: string;
	conversationId: string;
	userContext?: string;
}

export interface EmotionAnalysisResponse {
	success: boolean;
	suggestion?: string;
	llmChatId?: string;
	message?: string;
}

export interface DeleteLLMHistoryRequest {
	userId: string;
	conversationId: string;
}

export interface DeleteLLMHistoryResponse {
	success: boolean;
	message?: string;
}

export interface HelpfulTelemetryRequest {
	llmChatId: string;
	isHelpful: boolean;
}

export interface HelpfulTelemetryResponse {
	success: boolean;
	message?: string;
}

export const queryLLMHistory = async (
	userId: string,
	conversationId: string
): Promise<QueryLLMHistoryResponse> => {
	try {
		const response = await api.post<QueryLLMHistoryResponse>(
			`/llm-suggest/query`,
			{ userId, conversationId }
		);
		return response.data;
	} catch (error) {
		console.error("Error querying LLM history:", error);
		return {
			success: false,
			message: "Failed to query LLM history",
		};
	}
};

export const emotionAnalysis = async (
	userId: string,
	conversationId: string,
	userContext?: string
): Promise<EmotionAnalysisResponse> => {
	try {
		const response = await api.post<EmotionAnalysisResponse>(
			`/llm-suggest/suggest`,
			{ userId, conversationId, userContext }
		);
		return response.data;
	} catch (error) {
		console.error("Error performing emotion analysis:", error);
		return {
			success: false,
			message: "Failed to perform emotion analysis",
		};
	}
};

export const deleteLLMHistory = async (
	userId: string,
	conversationId: string
): Promise<DeleteLLMHistoryResponse> => {
	try {
		const response = await api.post<DeleteLLMHistoryResponse>(
			`/llm-suggest/delete`,
			{ userId, conversationId }
		);
		return response.data;
	} catch (error) {
		console.error("Error deleting LLM history:", error);
		return {
			success: false,
			message: "Failed to delete LLM history",
		};
	}
};

export const helpfulTelemetry = async (
	llmChatId: string,
	isHelpful: boolean
): Promise<HelpfulTelemetryResponse> => {
	try {
		const response = await api.post<HelpfulTelemetryResponse>(
			`/llm-suggest/telemetry`,
			{ llmChatId, isHelpful }
		);
		return response.data;
	} catch (error) {
		console.error("Error sending helpful telemetry:", error);
		return {
			success: false,
			message: "Failed to send telemetry",
		};
	}
};
