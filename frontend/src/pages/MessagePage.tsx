import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation, Message } from "@/types/chat";

import { useEffect, useState, useRef, useLayoutEffect } from "react";

import Navbar from "@/components/Navbar";
import { useSocketStore } from "@/stores/useSocketStore";

import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";

import { Search, Info, Close, Circle } from "@mui/icons-material";
import { formatFileSize, isImageFile } from "@/lib/utils";

function getTimeSinceLastMessage(timestamp: any): string {
	if (!timestamp) return "";

	let messageTime: Date;

	if (timestamp && typeof timestamp === "object" && "_seconds" in timestamp) {
		messageTime = new Date(timestamp._seconds * 1000);
	} else if (typeof timestamp === "string") {
		messageTime = new Date(timestamp);
	} else {
		return "";
	}

	if (isNaN(messageTime.getTime())) return "";

	const now = new Date();
	const diffInMs = now.getTime() - messageTime.getTime();

	const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
	const diffInWeeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));

	if (diffInMinutes < 1) return "Just now";
	if (diffInMinutes < 60) return `${diffInMinutes}m`;
	if (diffInHours < 24) return `${diffInHours}h`;
	if (diffInDays < 7) return `${diffInDays}d`;
	return `${diffInWeeks}w`;
}

function MessagePage() {
	const { userProfile } = useAuthStore();
	const {
		conversations,
		messages,
		activeConversationId,
		setActiveConversation,
		fetchConversations,
		fetchMessages,
		sendMessage,
		markAsRead,
		loadingMessages,
		updateConversation,
	} = useChatStore();

	const { onlineUsers } = useSocketStore();

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [messageText, setMessageText] = useState("");
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [searchText, setSearchText] = useState("");
	const [conversationsList, setConversationsList] =
		useState<Conversation[]>(conversations);
	const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [isSeen, setIsSeen] = useState<boolean>(false);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const previousScrollHeightRef = useRef<number>(0);
	const isFetchingOldMessagesRef = useRef(false);
	const lastMessageIdRef = useRef<string | null>(null);

	// Fetch conversations on component mount
	useEffect(() => {
		fetchConversations();
	}, []);

	// Fetch messages when active conversation changes
	useEffect(() => {
		if (activeConversationId) {
			isFetchingOldMessagesRef.current = false;
			previousScrollHeightRef.current = 0;
			lastMessageIdRef.current = null;

			if (!messages[activeConversationId]) {
				fetchMessages(activeConversationId);
			}
		}
		// Mark as read when opening the conversation
		const conversation = conversations.find(
			(convo) => convo.id === activeConversationId
		);
		if (
			conversation &&
			conversation.unreadCount?.[userProfile?.uid || ""] > 0
		) {
			markAsRead(activeConversationId || "");
		}
	}, [activeConversationId]);

	// Update conversationsList when conversations change
	useEffect(() => {
		if (!userProfile) return;

		let result = [...conversations];

		// 1. Lọc theo Tab (All / Unread)
		if (activeFilter === "unread") {
			result = result.filter((c) => {
				const count = c.unreadCount?.[userProfile.uid] || 0;
				return count > 0;
			});
		}

		// 2. Lọc theo Search Text (kết hợp với kết quả trên)
		if (searchText.trim() !== "") {
			const lowerSearch = searchText.toLowerCase();
			result = result.filter((c) =>
				c.groupName?.toLowerCase().includes(lowerSearch)
			);
		}

		result.sort((a, b) => {
			// Lấy thời gian, ưu tiên lastMessageAt, nếu không có thì dùng createdAt
			const timeA = new Date(
				a.lastMessageAt || a.updatedAt || a.createdAt
			).getTime();
			const timeB = new Date(
				b.lastMessageAt || b.updatedAt || b.createdAt
			).getTime();

			// Sắp xếp giảm dần (Mới nhất lên đầu)
			return timeB - timeA;
		});

		// 3. Cập nhật danh sách hiển thị
		setConversationsList(result);
	}, [conversations, activeFilter, searchText, userProfile]);

	// Get the active conversation details
	const activeConversation = conversations.find(
		(conv) => conv.id === activeConversationId
	);

	// Get messages for active conversation
	const conversationData = activeConversationId
		? messages[activeConversationId]
		: null;
	const currentMessages = conversationData ? conversationData.items : [];
	const hasMoreMessages = conversationData ? conversationData.hasMore : false; // For infinite scroll

	useLayoutEffect(() => {
		if (isFetchingOldMessagesRef.current && chatContainerRef.current) {
			// Tính toán sự chênh lệch chiều cao
			const newScrollHeight = chatContainerRef.current.scrollHeight;
			const heightDifference =
				newScrollHeight - previousScrollHeightRef.current;

			// Nhảy tới vị trí cũ (tạo hiệu ứng đứng yên)
			chatContainerRef.current.scrollTop = heightDifference;

			// Reset cờ
			isFetchingOldMessagesRef.current = false;
		}
	}, [currentMessages]); // Chạy mỗi khi list tin nhắn thay đổi

	// Scroll to last message sent
	useEffect(() => {
		if (!messagesEndRef.current || currentMessages.length === 0) return;

		const lastMessage = currentMessages[currentMessages.length - 1];

		// Kiểm tra xem tin nhắn cuối cùng có thay đổi không
		const isLastMessageChanged =
			lastMessage.id !== lastMessageIdRef.current;

		// Cập nhật ref để dùng cho lần render sau
		lastMessageIdRef.current = lastMessage.id;

		// CHỈ CUỘN XUỐNG ĐÁY KHI:
		// 1. Tin nhắn cuối cùng bị thay đổi (tức là có tin nhắn MỚI đến hoặc mình vừa gửi)
		// 2. HOẶC là lần đầu tiên load cuộc hội thoại (khi đó previousScrollHeightRef.current = 0)
		if (isLastMessageChanged && !isFetchingOldMessagesRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [currentMessages, activeConversationId]);

	const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, scrollHeight } = e.currentTarget;

		// Nếu cuộn lên đỉnh (scrollTop = 0) VÀ có tin cũ (hasMoreMessages) VÀ không đang loading
		if (scrollTop === 0 && hasMoreMessages && !loadingMessages) {
			console.log("Load more messages triggered...");

			// Lưu chiều cao hiện tại và đánh dấu đang fetch
			previousScrollHeightRef.current = scrollHeight;
			isFetchingOldMessagesRef.current = true;

			if (activeConversationId) {
				await fetchMessages(activeConversationId);
			}
		}
	};

	// Update the "Time since last message" every minute
	useEffect(() => {
		const interval = setInterval(() => {
			setConversationsList([...conversations]);
		}, 60000);

		return () => clearInterval(interval);
	}, [conversations]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const filesArray = Array.from(e.target.files);
			setSelectedFiles((prev) => [...prev, ...filesArray]);
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleRemoveFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	// Handle message sending
	const handleSendMessage = async () => {
		if (
			(!messageText.trim() && selectedFiles.length === 0) ||
			!activeConversationId
		)
			return;

		const textToSend = messageText;
		const filesToSend = selectedFiles;

		setMessageText("");
		setSelectedFiles([]);

		try {
			await sendMessage(activeConversationId, textToSend, filesToSend);
		} catch (error) {
			setMessageText(textToSend);
			setSelectedFiles(filesToSend);
			console.log("Failed to send message:", error);
		}
	};

	// Thêm đoạn này vào bên trong component MessagePage
	useEffect(() => {
		if (textareaRef.current) {
			// Reset chiều cao về auto để tính toán chính xác scrollHeight khi xóa bớt text
			textareaRef.current.style.height = "auto";
			// Đặt chiều cao mới bằng scrollHeight (tối đa ví dụ 150px)
			textareaRef.current.style.height = `${Math.min(
				textareaRef.current.scrollHeight,
				150
			)}px`;
		}
	}, [messageText]);

	// Handle chat searching
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	const handleAllClick = () => {
		setActiveFilter("all");
	};
	const handleUnreadClick = () => {
		setActiveFilter("unread");
	};

	return (
		<>
			<Navbar />
			{/* Main Layout */}
			<div
				className={`grid h-[calc(100vh-80px)] transition-all duration-300 ${
					isDetailOpen
						? "grid-cols-[0.5fr_1.5fr_0.5fr]" // 3 columns when detail is open
						: "grid-cols-[0.5fr_2fr]" // 2 columns when detail is closed
				}`}
			>
				{/* Left Side - Conversations List */}
				<div className='text-left px-3 overflow-y-auto border-r border-gray-200 min-w-[300px]'>
					<h1 className='text-xl font-bold mb-4 sticky top-0 py-2'>
						Chats
					</h1>

					{/* Conversation Search Bar */}
					<div>
						<Input
							placeholder='Find in chat...'
							startDecorator={<Search />}
							value={searchText}
							onChange={handleSearch}
							onKeyDown={(e) => {
								if (e.key === "Escape") {
									e.preventDefault();
									setSearchText("");
									e.currentTarget.blur();
								}
							}}
							sx={{
								borderRadius: "8px",
								height: "3rem",
							}}
						></Input>
					</div>

					{/* Navigation Buttons */}
					<div className='flex flex-row justify-center p-3 gap-5'>
						<Button
							onClick={handleAllClick}
							variant='plain'
							sx={{
								width: "50%",
								fontWeight: "bold",
								fontSize: "1.2rem",
								borderRadius: "20px",
								color:
									activeFilter === "all" ? "white" : "black",
								backgroundColor:
									activeFilter === "all"
										? "#c084fc"
										: "transparent",
								"&:hover": {
									backgroundColor:
										activeFilter === "all"
											? "#a855f7"
											: "#f3f4f6",
								},
								"&:active": {
									transform: "scale(0.95)",
								},
							}}
						>
							All
						</Button>
						<Button
							onClick={handleUnreadClick}
							variant='plain'
							sx={{
								width: "50%",
								fontWeight: "bold",
								color:
									activeFilter === "unread"
										? "white"
										: "black",
								fontSize: "1.2rem",
								borderRadius: "20px",
								backgroundColor:
									activeFilter === "unread"
										? "#c084fc"
										: "transparent",
								"&:hover": {
									backgroundColor:
										activeFilter === "unread"
											? "#a855f7"
											: "#f3f4f6",
								},
								"&:active": {
									transform: "scale(0.95)",
								},
							}}
						>
							Unread
						</Button>
					</div>

					{/* Conversations List */}
					<div className='space-y-2'>
						{conversationsList.map((conversation) => {
							const unreadCount =
								conversation.unreadCount?.[
									userProfile?.uid || ""
								] || 0;

							const unreadCountLabel =
								unreadCount > 0 && unreadCount <= 9
									? unreadCount
									: "9+";

							return (
								<div
									key={conversation.id}
									onClick={() => {
										setActiveConversation(conversation.id);
									}}
									className={`flex flex-row justify-between p-3 rounded-lg cursor-pointer transition-colors ${
										activeConversationId === conversation.id
											? "bg-purple-100 border-2 border-purple-500"
											: "bg-gray-50 hover:bg-gray-100"
									}`}
								>
									<div className='flex items-center gap-3'>
										{/* User Avatar */}
										<img
											src={
												conversation?.groupAvatarUrl ||
												"/default-avatar.png"
											}
											alt={
												conversation?.groupName ||
												"User"
											}
											className='w-10 h-10 rounded-full'
										/>

										<div className='flex-1 min-w-0'>
											{/* User Name */}
											<p
												className={`ext-sm truncate font-semibold`}
											>
												{conversation?.groupName ||
													"Unknown"}
											</p>

											{/* Last Message Sent */}
											<div className='flex items-center gap-1 text-xs text-gray-500'>
												<p
													className={`truncate max-w-[210px] ${
														unreadCount > 0
															? "font-bold"
															: "font-normal"
													}`}
												>
													{conversation?.lastMessage
														? conversation
																?.lastMessage
																?.sender
																?.uid ===
														  userProfile?.uid
															? `You: ${conversation.lastMessage?.content}`
															: `${conversation.lastMessage?.content}`
														: "No message yet!"}
												</p>
												<Circle
													sx={{
														fontSize: "0.1rem",
													}}
												/>
												<p className='whitespace-nowrap'>
													{conversation.lastMessage
														?.createdAt
														? getTimeSinceLastMessage(
																conversation
																	?.lastMessage
																	?.createdAt
														  )
														: ""}
												</p>
											</div>
										</div>
									</div>
									<p>
										{/* Unread Count Label */}
										{unreadCount > 0
											? unreadCountLabel
											: ""}
									</p>
								</div>
							);
						})}
					</div>
				</div>

				{/* Middle - Main Chat Display */}
				<div className='flex flex-col border-r border-gray-200 h-full overflow-hidden'>
					{activeConversation ? (
						<>
							{/* Chat Header */}
							<div className='flex flex-row justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0'>
								{/* Other User Data */}
								<div className='flex items-center gap-3'>
									{(() => {
										const otherUser =
											activeConversation.participants.find(
												(p) =>
													p.uid !== userProfile?.uid
											);
										const isOnline = onlineUsers.includes(
											otherUser?.uid || ""
										);
										return (
											<>
												<img
													src={
														activeConversation?.groupAvatarUrl ||
														"/default-avatar.png"
													}
													alt={
														activeConversation?.groupName ||
														"User"
													}
													className='w-10 h-10 rounded-full'
												/>
												<div>
													<p className='font-semibold'>
														{activeConversation?.groupName ||
															"Unknown"}
													</p>
													<p
														className='text-xs flex items-center gap-1'
														style={{
															color: isOnline
																? "#10b981"
																: "#6b7280",
														}}
													>
														<Circle
															sx={{
																fontSize:
																	"0.8rem",
																color: isOnline
																	? "#10b981"
																	: "#6b7280",
															}}
														/>
														{isOnline
															? "Online"
															: "Offline"}
													</p>
												</div>
											</>
										);
									})()}
								</div>

								{/* Detail Tab Button */}
								<div className='flex items-center'>
									<IconButton
										onClick={() =>
											setIsDetailOpen(!isDetailOpen)
										}
									>
										<Info
											sx={{
												color: "#AD46FF",
												fontSize: "2rem",
											}}
										/>
									</IconButton>
								</div>
							</div>

							{/* Messages Area */}
							<div
								ref={chatContainerRef}
								onScroll={handleScroll}
								className='flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3'
							>
								{loadingMessages &&
									isFetchingOldMessagesRef.current && (
										<div className='flex justify-center w-full py-2'>
											<div className='w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin'></div>
										</div>
									)}
								{currentMessages.map((message) => {
									const isOwnMessage =
										message?.sender?.uid ===
										userProfile?.uid;
									return (
										<div
											key={message.id}
											className={`flex ${
												isOwnMessage
													? "justify-end"
													: "justify-start"
											}`}
										>
											<div
												className={`max-w-[70%] rounded-lg p-3 overflow-hidden ${
													message.isOwn
														? "bg-purple-500 text-white"
														: "bg-gray-200 text-gray-900"
												}`}
											>
												{/* --- PHẦN XỬ LÝ ATTACHMENTS MỚI --- */}
												{message.attachments &&
													message.attachments.length >
														0 && (
														<div className='flex flex-col gap-2 mb-2'>
															{message.attachments.map(
																(att) => {
																	// CASE 1: NẾU LÀ ẢNH
																	if (
																		isImageFile(
																			att.originalName
																		)
																	) {
																		return (
																			<div
																				key={
																					att.id
																				}
																				className='relative group cursor-pointer'
																			>
																				{/* Bấm vào ảnh mở tab mới để xem full (Preview) */}
																				<img
																					src={
																						att.urlView
																					}
																					alt={
																						att.originalName
																					}
																					referrerPolicy='no-referrer'
																					onClick={() =>
																						window.open(
																							att.urlView,
																							"_blank"
																						)
																					}
																					className='rounded-lg max-w-full max-h-[300px] object-cover hover:opacity-90 transition-opacity'
																				/>
																				{/* Nút tải xuống nhỏ hiện khi hover vào ảnh (Tùy chọn) */}
																				<a
																					href={
																						att.urlDownload
																					}
																					target='_blank'
																					rel='noopener noreferrer'
																					className='absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity'
																					title='Download'
																					onClick={(
																						e
																					) =>
																						e.stopPropagation()
																					} // Ngăn click ảnh
																				>
																					<svg
																						xmlns='http://www.w3.org/2000/svg'
																						className='w-4 h-4'
																						fill='none'
																						viewBox='0 0 24 24'
																						stroke='currentColor'
																					>
																						<path
																							strokeLinecap='round'
																							strokeLinejoin='round'
																							strokeWidth={
																								2
																							}
																							d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
																						/>
																					</svg>
																				</a>
																			</div>
																		);
																	}

																	// CASE 2: NẾU LÀ FILE KHÁC (PDF, DOC, ZIP...)
																	return (
																		<a
																			key={
																				att.id
																			}
																			href={
																				att.urlDownload
																			} // Link tải xuống trực tiếp
																			target='_blank' // Mở tab mới để tải (tránh block luồng chat)
																			rel='noopener noreferrer'
																			className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
																				message.isOwn
																					? "bg-purple-600 border-purple-400 hover:bg-purple-700"
																					: "bg-white border-gray-300 hover:bg-gray-50"
																			}`}
																		>
																			{/* Icon File generic */}
																			<div
																				className={`p-2 rounded-full ${
																					message.isOwn
																						? "bg-purple-500"
																						: "bg-gray-100"
																				}`}
																			>
																				<svg
																					xmlns='http://www.w3.org/2000/svg'
																					className={`w-6 h-6 ${
																						message.isOwn
																							? "text-white"
																							: "text-gray-500"
																					}`}
																					fill='none'
																					viewBox='0 0 24 24'
																					stroke='currentColor'
																				>
																					<path
																						strokeLinecap='round'
																						strokeLinejoin='round'
																						strokeWidth={
																							2
																						}
																						d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
																					/>
																				</svg>
																			</div>

																			<div className='flex-1 min-w-0'>
																				<p
																					className={`text-sm font-medium truncate ${
																						message.isOwn
																							? "text-white"
																							: "text-gray-900"
																					}`}
																				>
																					{
																						att.originalName
																					}
																				</p>
																				<p
																					className={`text-xs ${
																						message.isOwn
																							? "text-purple-200"
																							: "text-gray-500"
																					}`}
																				>
																					{formatFileSize(
																						att.size
																					)}
																				</p>
																			</div>

																			{/* Icon Download */}
																			<div
																				className={
																					message.isOwn
																						? "text-purple-200"
																						: "text-gray-400"
																				}
																			>
																				<svg
																					xmlns='http://www.w3.org/2000/svg'
																					className='w-5 h-5'
																					fill='none'
																					viewBox='0 0 24 24'
																					stroke='currentColor'
																				>
																					<path
																						strokeLinecap='round'
																						strokeLinejoin='round'
																						strokeWidth={
																							2
																						}
																						d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
																					/>
																				</svg>
																			</div>
																		</a>
																	);
																}
															)}
														</div>
													)}
												{/* ------------------------------------- */}

												<p
													className='text-sm whitespace-pre-wrap break-words'
													style={{
														overflowWrap:
															"anywhere",
													}}
												>
													{message.content}
												</p>
												<p className='text-xs opacity-70 mt-1'>
													{message.createdAt
														? new Date(
																message.createdAt
														  ).toLocaleTimeString(
																[],
																{
																	hour: "2-digit",
																	minute: "2-digit",
																}
														  )
														: ""}
												</p>
											</div>
										</div>
									);
								})}
								<div ref={messagesEndRef} />
							</div>

							{/* Message Input */}
							<div className='flex-shrink-0 bg-white border-t border-gray-200'>
								{/* KHU VỰC PREVIEW FILE (Hiển thị khi có file được chọn) */}
								{selectedFiles.length > 0 && (
									<div className='flex gap-2 px-4 py-2 overflow-x-auto border-b border-gray-100 scrollbar-thin'>
										{selectedFiles.map((file, index) => (
											<div
												key={index}
												className='relative flex items-center px-3 py-1 text-sm bg-gray-100 rounded-full group flex-shrink-0'
											>
												<span className='max-w-[150px] truncate text-xs'>
													{file.name}
												</span>
												<button
													onClick={() =>
														handleRemoveFile(index)
													}
													className='ml-2 text-gray-500 hover:text-red-500 focus:outline-none'
												>
													✕
												</button>
											</div>
										))}
									</div>
								)}

								{/* KHU VỰC NHẬP LIỆU */}
								<div className='p-4 flex gap-2 items-end'>
									{/* Nút Ghim (Chọn file) */}
									<button
										onClick={() =>
											fileInputRef.current?.click()
										}
										className='p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 hover:text-purple-500'
										title='Attach file'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='w-6 h-6'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'
											/>
										</svg>
									</button>

									{/* Input File Ẩn */}
									<input
										type='file'
										multiple
										ref={fileInputRef}
										className='hidden'
										onChange={handleFileSelect}
									/>

									{/* Input Text */}
									{/* Thay thế đoạn Input Text cũ bằng đoạn này */}
									<textarea
										ref={textareaRef}
										value={messageText}
										onChange={(e) =>
											setMessageText(e.target.value)
										}
										onKeyDown={(e) => {
											// Logic: Nếu bấm Enter mà KHÔNG giữ Shift -> Gửi tin nhắn
											if (
												e.key === "Enter" &&
												!e.shiftKey
											) {
												e.preventDefault(); // Chặn xuống dòng mặc định
												handleSendMessage();
											}
											// Nếu bấm Shift + Enter -> Để mặc định (sẽ xuống dòng)
										}}
										placeholder='Type a message...'
										rows={1} // Mặc định hiển thị 1 dòng
										className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none overflow-y-auto min-h-[44px] max-h-[150px] no-scrollbar'
									/>

									{/* Nút Gửi */}
									<button
										onClick={handleSendMessage}
										disabled={
											!messageText.trim() &&
											selectedFiles.length === 0
										}
										className={`px-4 py-2 text-white rounded-lg transition-colors ${
											!messageText.trim() &&
											selectedFiles.length === 0
												? "bg-purple-300 cursor-not-allowed"
												: "bg-purple-500 hover:bg-purple-600"
										}`}
									>
										Send
									</button>
								</div>
							</div>
						</>
					) : (
						<div className='flex items-center justify-center h-full text-gray-500'>
							<div className='text-center'>
								<p className='text-lg font-semibold mb-2'>
									Welcome, {userProfile?.displayName}!
								</p>
								<p className='text-sm'>
									Select a chat to start messaging
								</p>
							</div>
						</div>
					)}
				</div>

				{/* Right Side - Chat's Detail */}
				{isDetailOpen && (
					<div className='border-l border-gray-200 bg-white overflow-hidden'>
						{activeConversation ? (
							<div className='flex flex-col h-full px-5'>
								{/* Header with Close Button */}
								<div className='flex justify-between items-center py-4 border-b border-gray-200'>
									<h1 className='text-xl font-bold'>
										Chat Details
									</h1>
									<IconButton
										onClick={() => setIsDetailOpen(false)}
									>
										<Close sx={{ color: "#6b7280" }} />
									</IconButton>
								</div>

								{/* Scrollable Content */}
								<div className='space-y-4 overflow-y-auto flex-1 py-4'>
									{(() => {
										const otherUser =
											activeConversation.participants.find(
												(p) =>
													p.uid !== userProfile?.uid
											);
										return (
											<>
												<div className='text-center'>
													<img
														src={
															otherUser?.avatarUrl ||
															"/default-avatar.png"
														}
														alt={
															otherUser?.displayName ||
															"User"
														}
														className='w-24 h-24 rounded-full mx-auto mb-2'
													/>
													<p className='font-semibold text-lg'>
														{otherUser?.displayName ||
															"Unknown"}
													</p>
												</div>
												<div className='border-t pt-4'>
													<p className='text-sm font-semibold mb-2'>
														About
													</p>
													<p className='text-sm text-gray-600'>
														Conversation started on{" "}
														{new Date(
															activeConversation.createdAt
														).toLocaleDateString()}
													</p>
												</div>
											</>
										);
									})()}
								</div>
							</div>
						) : null}
					</div>
				)}
			</div>
		</>
	);
}

export default MessagePage;
