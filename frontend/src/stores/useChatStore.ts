import { chatServices } from "@/services/chatServices";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create<ChatState>()(
	persist(
		(set, get) => ({
			conversations: [],
			messages: {},
			activeConversationId: null,
			loadingConversations: false,
			loadingMessages: false,

			reset: () => {
				set({
					conversations: [],
					messages: {},
					activeConversationId: null,
					loadingConversations: false,
				});
			},

			setActiveConversation: (conversationId) =>
				set({ activeConversationId: conversationId }),

			fetchConversations: async () => {
				try {
					const userProfile = useAuthStore.getState().userProfile;
					set({ loadingConversations: true });
					const { conversations: conversationFetched } =
						await chatServices.fetchConversations();
					const conversations = conversationFetched.map((convo) => {
						// đặt groupName cho cuộc trò chuyện nhóm là tên nhóm hoặc tên hiển thị của người dùng khác
						return {
							...convo,
							groupName:
								convo.type === "group"
									? convo.groupName || "Nhóm chat"
									: convo.participants.find(
											(p) => p.uid !== userProfile?.uid
									  )?.displayName || "Người dùng",
							groupAvatarUrl:
								convo.type === "group"
									? convo.groupAvatarUrl || null
									: convo.participants.find(
											(p) => p.uid !== userProfile?.uid
									  )?.avatarUrl || null,
						};
					});
					console.log("Fetched conversations:", conversations);
					set({ conversations });
				} catch (error) {
					console.error("Failed to fetch conversations:", error);
				} finally {
					set({ loadingConversations: false });
				}
			},

			fetchMessages: async (conversationId) => {
				const { activeConversationId, messages } = get();
				const { userProfile } = useAuthStore.getState();

				const convoId = conversationId ?? activeConversationId;
				if (!convoId || !userProfile) return;

				const current = messages?.[convoId];
				const nextCursor =
					current?.nextCursor === undefined
						? ""
						: current?.nextCursor;
				if (nextCursor === null) return; // No more messages to load
				try {
					set({ loadingMessages: true });
					const { messages: fetched, cursor } =
						await chatServices.fetchMessages(convoId, nextCursor);

					const processed = fetched.map((msg) => ({
						...msg,
						isOwn: msg?.sender?.uid === userProfile.uid,
					}));

					set((state) => {
						const prev = state.messages[convoId]?.items || [];
						const merged =
							prev.length > 0
								? [...processed, ...prev]
								: processed;
						return {
							messages: {
								...state.messages,
								[convoId]: {
									items: merged,
									hasMore: !!cursor,
									nextCursor: cursor ?? null,
								},
							},
						};
					});
				} catch (error) {
					console.error("Failed to fetch messages:", error);
				} finally {
					set({ loadingMessages: false });
				}
			},

			sendMessage: async (conversationId, content, attachments) => {
				try {
					const { activeConversationId } = get();
					// const { userProfile } = useAuthStore.getState();
					// if (!userProfile) return;
					const convoId = conversationId ?? activeConversationId;
					if (!convoId) return;
					await chatServices.sendMessage(
						convoId,
						content,
						attachments
					);

					set((state) => ({
						conversations: state.conversations.map((convo) => {
							return convo.id === convoId
								? { ...convo, seenBy: [] }
								: convo;
						}),
					}));
				} catch (error) {
					console.error("Failed to send message:", error);
				}
			},

			markAsRead: async (conversationId) => {
				try {
					const { activeConversationId } = get();
					const convoId = conversationId ?? activeConversationId;
					if (!convoId) return;
					await chatServices.markAsRead(convoId);
				} catch (error) {
					console.error("Failed to mark as read:", error);
				}
			},

			addMessage: async (message) => {
				try {
					const { userProfile } = useAuthStore.getState();
					const { fetchMessages } = get();
					message.isOwn = message?.sender?.uid === userProfile?.uid;
					const convoId = message.conversationId;
					let prevItems = get().messages[convoId]?.items || [];
					if (prevItems.length === 0) {
						await fetchMessages(convoId);
						prevItems = get().messages[convoId]?.items || [];
					}
					set((state) => {
						if (prevItems.some((msg) => msg.id === message.id)) {
							return state; // message already exists
						}
						return {
							messages: {
								...state.messages,
								[convoId]: {
									items: [...prevItems, message],
									hasMore: state.messages[convoId].hasMore,
									nextCursor:
										state.messages[convoId].nextCursor ??
										undefined,
								},
							},
						};
					});
				} catch (error) {
					console.error("Failed to add message:", error);
				}
			},

			updateConversation: (conversation) => {
				set((state) => ({
					conversations: state.conversations.map((convo) =>
						convo.id === conversation.id
							? { ...convo, ...conversation }
							: convo
					),
				}));
			},
		}),
		{
			name: "chat-storage", // unique name
			partialize: (state) => ({
				conversations: state.conversations,
			}),
		}
	)
);
