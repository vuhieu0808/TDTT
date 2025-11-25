import type { User as FirebaseuserProfile } from "firebase/auth";
import type { UserProfile } from "../types/user";
import type { Attachment, Conversation, Message } from "./chat";
import type { Socket } from "node_modules/socket.io-client/build/esm/socket";

export interface AuthState {
	authUser: FirebaseuserProfile | null; // Người dùng hiện tại hoặc null nếu chưa đăng nhập (dùng cho đăng nhập)
	userProfile: UserProfile | null; // Hồ sơ người dùng hoặc null nếu chưa có (dùng cho thông tin người dùng)
	token: string | null; // Token xác thực của người dùng
	loading: boolean; // Trạng thái tải

	clearState: () => void; // Hàm xóa trạng thái xác thực
	signInWithGoogle: () => Promise<void>; // Hàm đăng nhập với Google
	logout: () => Promise<void>; // Hàm đăng xuất
	fetchMe: () => Promise<void>; // Hàm lấy thông tin hồ sơ người dùng
}

export interface ChatState {
	conversations: Conversation[]; // Danh sách các cuộc trò chuyện
	messages: Record<
		string,
		{
			items: Message[];
			hasMore: boolean;
			nextCursor?: string | null;
		}
	>; // Bản ghi tin nhắn theo ID cuộc trò chuyện (conversationId -> Message[])
	activeConversationId: string | null; // ID cuộc trò chuyện đang hoạt động hoặc null nếu không có
	loadingConversations: boolean; // Trạng thái tải cuộc trò chuyện
	loadingMessages: boolean; // Trạng thái tải tin nhắn

	reset: () => void; // Hàm đặt lại trạng thái cửa hàng chat
	setActiveConversation: (conversationId: string | null) => void; // Hàm đặt cuộc trò chuyện hoạt động
	fetchConversations: () => Promise<void>; // Hàm lấy danh sách cuộc trò chuyện
	fetchMessages: (conversationId: string) => Promise<void>; // Hàm lấy tin nhắn của cuộc trò chuyện
	sendMessage: (
		conversationId: string,
		content: string,
		attachments?: File[]
	) => Promise<void>; // Hàm gửi tin nhắn trong cuộc trò chuyện
	markAsRead: (conversationId: string) => Promise<void>; // Hàm đánh dấu cuộc trò chuyện là đã đọc

	addMessage: (message: Message) => Promise<void>;
	updateConversation: (conversation: Partial<Conversation> & { id: string }) => void; // Hàm cập nhật cuộc trò chuyện trong danh sách
}

export interface SocketState {
	socket: Socket | null; // Kết nối socket.io hoặc null nếu chưa kết nối
	onlineUsers: string[]; // Danh sách người dùng đang trực tuyến
	connectSocket: () => void; // Hàm kết nối socket.io
	disconnectSocket: () => void; // Hàm ngắt kết nối socket.io
}
