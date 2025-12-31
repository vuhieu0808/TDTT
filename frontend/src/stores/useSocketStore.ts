import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import type { SocketState } from "@/types/store";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";
import { userServices } from "@/services/userServices";
import type { LastMessage, Message, Conversation } from "@/types/chat";
import type { Friend, UserProfile } from "@/types/user";
import { useFriendStore } from "./useFriendStore";

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
    socket.on("new-conversation", (payload) => {
      console.log("New conversation received from socket:", payload);
      const { conversation, friends } = payload;
      console.log();
      const newConversation = conversation as Conversation;
      const newParticipantProfile = friends as Friend[];
      console.log("conversation:", newConversation);
      useChatStore.getState().addConversation(newConversation);
      // const newFriend
      const userId = useAuthStore.getState().userProfile?.uid;
      const newFriend: Friend | undefined = newParticipantProfile.find(
        (user) => user.user.uid !== userId
      );
      console.log("participantProfile:", newFriend);
      if (newFriend) {
        console.log("New friend added from socket:", newFriend);
        useFriendStore.getState().addNewFriend(newFriend);
      }
    });

    socket.on("friend-request", (payload) => {
      const { senderData } = payload;
      useFriendStore
        .getState()
        .addNewReceivedRequest(senderData as UserProfile);
      console.log("New friend request received from socket:", senderData);
    });

    socket.on("unmatch-notification", (payload) => {
      console.log("Unmatch notification received from socket:", payload);
      const { conversationId, userId } = payload;
      const { friends } = useFriendStore.getState();
      useFriendStore.setState({
        friends: friends.filter((friend) => friend.user.uid !== userId),
      });
      const { conversations } = useChatStore.getState();
      const conversation = conversations.find(
        (conv) => conv.id === conversationId
      );
      if (conversation) {
        useChatStore.setState({
          conversations: conversations.filter(
            (conv) => conv.id !== conversationId
          ),
        });
      }
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
