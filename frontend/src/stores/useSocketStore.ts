import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import type { SocketState } from "@/types/store";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";
import type { LastMessage, Message } from "@/types/chat";

const baseURL = import.meta.env.VITE_SOCKET_URL as string;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: () => {
    const token = useAuthStore.getState().token;
    const existingSocket = get().socket;
    if (existingSocket) {
      return;
    }
    const socket: Socket = io(baseURL, {
      auth: { token },
      transports: ["websocket"],
    });
    set({ socket });

    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    // online users
    socket.on("online-users", (users: string[]) => {
      set({ onlineUsers: users });
      console.log("Online users updated:", users);
    });

    // new message
    socket.on("new-message", ({ message, conversation, unreadCount }) => {
      useChatStore.getState().addMessage(message as Message);
      const lastMessage: LastMessage = {
        id: message.id,
        ...conversation.lastMessage,
      };

      const updatedConversation = {
        ...conversation,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount,
      };

      if (useChatStore.getState().activeConversationId === conversation.id) {
        /// Đang ở trong cuộc trò chuyện này, đánh dấu đã xem
        useChatStore.getState().markAsRead(conversation.id);
      }
      useChatStore.getState().updateConversation(updatedConversation);
    });

    // mark as read
    socket.on("mark-as-read", ({ conversationId, seenBy, unreadCount }) => {
      const updatedConversation = {
        id: conversationId,
        seenBy,
        unreadCount,
      };
      useChatStore.getState().updateConversation(updatedConversation);
    });

    // new conversation
    socket.on("new-conversation", (conversation) => {
      useChatStore.getState().addConversation(conversation);
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
      console.log("Disconnected from socket server");
    }
  },
}));
