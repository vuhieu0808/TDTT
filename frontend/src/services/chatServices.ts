import api from "@/lib/axios";
import type { Attachment, ConversationResponse, Message } from "@/types/chat";

const pageLimit = 50;

interface FetchMessagesResponse {
  messages: Message[];
  cursor?: string | null;
}

export const chatServices = {
  async fetchConversations(): Promise<ConversationResponse> {
    const res = await api.get("/conversations");
    return res.data;
  },

  async fetchMessages(
    conversationId: string,
    cursor?: string
  ): Promise<FetchMessagesResponse> {
    const res = await api.get(
      `/conversations/${conversationId}/messages?limit=${pageLimit}&cursor=${cursor}`
    );
    return { messages: res.data.messages, cursor: res.data.nextCursor };
  },

  async sendMessage(conversationId: string, content: string = "", attachments?: Attachment[]): Promise<Message> {
    const res = await api.post(`/conversations/${conversationId}/messages`, {
      content,
      attachments,
    });
    return res.data.data as Message;
  }
};
