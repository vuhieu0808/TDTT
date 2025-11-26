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
    cursor?: string,
    onlyMedia: boolean = false
  ): Promise<FetchMessagesResponse> {
    const res = await api.get(
      `/conversations/${conversationId}/messages?limit=${pageLimit}&cursor=${cursor}&onlyMedia=${onlyMedia}`
    );
    return { messages: res.data.messages, cursor: res.data.nextCursor };
  },

  async sendMessage(
    conversationId: string,
    content: string = "",
    attachments?: File[]
  ): Promise<Message> {
    const formData = new FormData();
    formData.append("content", content);
    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => {
        formData.append("attachments", file);
        console.log(`Appending file: ${file.name}, size: ${file.size} bytes`);
      });
    }
    const res = await api.post(`/messages/send/${conversationId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.data as Message;
  },
  async markAsRead(conversationId: string): Promise<void> {
    await api.put(`/conversations/${conversationId}/mark-as-read`);
  },
};
