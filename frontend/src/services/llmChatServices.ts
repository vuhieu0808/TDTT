import api from "@/lib/axios";

interface LLMChatResponse {
	response: string;
	error?: string;
}

export const llmChatServices = {
	async chat(
		message: string,
		conversationId: string = "default"
	): Promise<LLMChatResponse> {
		const res = await api.post("/llmChat/chat", {
			message,
			conversationId,
		});
		return res.data as LLMChatResponse;
	},

	async getHistory(conversationId: string = "default"): Promise<string> {
		const res = await api.post("/llmChat/get", {
			conversationId,
		});
		return res.data.history || "";
	},

	async deleteHistory(conversationId: string = "default"): Promise<void> {
		await api.post("/llmChat/delete", { conversationId });
	},
};
