import { chatServices } from "@/services/chatServices";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import type { Message } from "@/types/chat";

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

			fetchSharedMessages: async (conversationId, cursor) => {
				try {
					const fetched = await chatServices.fetchMessages(conversationId, cursor, true);
					const res = { messages: fetched.messages, cursor: fetched.cursor ?? null };
					return res;
				} catch (error) {
					console.error("Failed to fetch shared messages:", error);
					return { messages: [], cursor: null };
				}
			},

			sendMessage: async (conversationId, content, attachments) => {
				const { activeConversationId } = get();
				const { userProfile } = useAuthStore.getState();

				const convoId = conversationId ?? activeConversationId;
				if (!convoId || !userProfile) return;

				// tạo tin nhắn tạm
				const tempId = `temp-${Date.now()}`;
				const tempMessage: Message = {
					id: tempId,
					conversationId: convoId,
					content: content,
					attachments: [],
					hasAttachments: false,
					sender: {
						uid: userProfile.uid,
						displayName: userProfile.displayName,
						avatarUrl: userProfile.avatarUrl || "",
					},
					createdAt: new Date().toISOString(),
					isOwn: true,
				};

				// Hiển thị tin tạm
				set((state) => {
					const prevItems = state.messages[convoId]?.items || [];
					return {
						messages: {
							...state.messages,
							[convoId]: {
								...state.messages[convoId],
								items: [...prevItems, tempMessage],
							},
						},
					};
				});

				try {
					// Gọi API gửi tin nhắn
					const realMessage = await chatServices.sendMessage(
						convoId,
						content,
						attachments
					);
					realMessage.isOwn = true;

					// XỬ LÝ ĐỒNG BỘ VỚI SOCKET (Quan trọng)
					set((state) => {
						const currentItems =
							state.messages[convoId]?.items || [];

						// Kiểm tra xem Socket (hàm addMessage) đã chèn tin nhắn thật này vào chưa?
						const isSocketAlreadyAdded = currentItems.some(
							(msg) => msg.id === realMessage.id
						);

						let updatedItems;

						if (isSocketAlreadyAdded) {
							// CASE A: Socket đã nhanh tay thêm tin thật rồi.
							// -> Nhiệm vụ bây giờ chỉ là XÓA tin nhắn tạm đi để tránh bị trùng (duplicate).
							updatedItems = currentItems.filter(
								(msg) => msg.id !== tempId
							);
						} else {
							// CASE B: API phản hồi trước hoặc Socket chưa kịp thêm.
							// -> Tìm tin nhắn tạm và THAY THẾ nó bằng tin nhắn thật.
							updatedItems = currentItems.map((msg) =>
								msg.id === tempId ? realMessage : msg
							);
						}

						return {
							messages: {
								...state.messages,
								[convoId]: {
									...state.messages[convoId],
									items: updatedItems,
								},
							},
							// Cập nhật lại danh sách cuộc hội thoại để đẩy lên đầu
							conversations: state.conversations.map((convo) => {
								return convo.id === convoId
									? { ...convo, seenBy: [] }
									: convo;
							}),
						};
					});
				} catch (error) {
					console.error("Failed to send message:", error);
					// ROLLBACK: Nếu lỗi, xóa tin nhắn tạm đi
					set((state) => {
						const currentItems =
							state.messages[convoId]?.items || [];
						return {
							messages: {
								...state.messages,
								[convoId]: {
									...state.messages[convoId],
									items: currentItems.filter(
										(msg) => msg.id !== tempId
									),
								},
							},
						};
					});
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
            convo.id === conversation.id ? { ...convo, ...conversation } : convo
          ),
        }));
      },
    }),
    {
      name: "chat-storage", // unique name
      partialize: (state) => ({
        conversations: state.conversations,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Hydration finished. Loaded conversations:', state?.conversations?.length);
      },
    }
  )
);
