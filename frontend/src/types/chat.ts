export interface Participant {
	// Người tham gia cuộc trò chuyện
	uid: string; // ID của người tham gia
	displayName: string; // Tên hiển thị của người tham gia
	avatarUrl: string; // URL ảnh đại diện của người tham gia
	joinedAt: string; // Thời gian tham gia cuộc trò chuyện (dưới dạng timestamp)
}

export interface SeenUser {
	// Người đã xem tin nhắn
	uid: string; // ID của người đã xem tin nhắn
	displayName: string; // Tên hiển thị của người đã xem tin nhắn
	avatarUrl: string; // URL ảnh đại diện của người đã xem tin nhắn
}

export interface SendUser {
	// Người gửi tin nhắn
	uid: string; // ID của người gửi tin nhắn
	displayName: string; // Tên hiển thị của người gửi tin nhắn
	avatarUrl: string | null; // URL ảnh đại diện của người gửi tin nhắn
}

export interface LastMessage {
	// Tin nhắn cuối cùng trong cuộc trò chuyện
	id: string; // ID của tin nhắn cuối cùng
	content: string; // Nội dung tin nhắn cuối cùng
	sender: SendUser; // Thông tin người gửi tin nhắn cuối cùng
	createdAt: string; // Thời gian tạo tin nhắn cuối cùng (dưới dạng timestamp)
}

export interface Conversation {
	// Cuộc trò chuyện
	id: string; // ID của cuộc trò chuyện
	type: "direct" | "group"; // Loại cuộc trò chuyện: trực tiếp hoặc nhóm
	participants: Participant[]; // Danh sách người tham gia cuộc trò chuyện
	lastMessage: LastMessage | null; // Tin nhắn cuối cùng trong cuộc trò chuyện
	lastMessageAt: string; // Thời gian tin nhắn cuối cùng (dưới dạng timestamp)

	groupName?: string | null; // Tên nhóm (nếu là cuộc trò chuyện nhóm)
	groupAvatarUrl?: string | null; // URL ảnh đại diện nhóm (nếu là cuộc trò chuyện nhóm)

	seenBy: SeenUser[]; // Danh sách người đã xem tin nhắn
	unreadCount: { [uid: string]: number }; // Số tin nhắn chưa đọc cho mỗi người dùng (uid -> count)

	createdAt: string; // Thời gian tạo cuộc trò chuyện (dưới dạng timestamp)
	updatedAt: string; // Thời gian cập nhật cuộc trò chuyện gần nhất (dưới dạng timestamp)
}

export interface ConversationResponse {
	// Danh sách các cuộc trò chuyện
	conversations: Conversation[]; // Mảng các cuộc trò chuyện
}

export interface Attachment {
	// Tệp đính kèm trong tin nhắn
	id: string; // ID của tệp đính kèm
	urlView: string; // URL để xem tệp đính kèm
	urlDownload: string; // URL để tải xuống tệp đính kèm
	size: number; // Kích thước của tệp đính kèm (tính bằng byte)
	originalName: string; // Tên gốc của tệp đính kèm
	storedName: string; // Tên lưu trữ của tệp đính kèm trên server
}

export interface Message {
	// Tin nhắn trong cuộc trò chuyện
	id: string; // ID của tin nhắn
	conversationId: string; // ID của cuộc trò chuyện mà tin nhắn thuộc về
	content: string | null; // Nội dung tin nhắn
	attachments?: Attachment[]; // Các tệp đính kèm trong tin nhắn (nếu có)
	hasAttachments: boolean; // Tin nhắn có tệp đính kèm hay không
	createdAt?: string; // Thời gian tạo tin nhắn (dưới dạng timestamp)
	isOwn?: boolean; // Tin nhắn có phải của người dùng hiện tại không
	sender: SendUser; // Thông tin người gửi tin nhắn
}
