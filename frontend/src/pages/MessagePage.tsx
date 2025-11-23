import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation, Message } from "@/types/chat";

import { useEffect, useState, useRef } from "react";

import Navbar from "@/components/Navbar";
import { useSocketStore } from "@/stores/useSocketStore";

import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";

import { Search, Info, Close, Circle } from "@mui/icons-material";

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
		updateConversation,
		markAsRead,
	} = useChatStore();

	const { onlineUsers } = useSocketStore();

	const [messageText, setMessageText] = useState("");
	const [searchText, setSearchText] = useState("");
	const [conversationsList, setConversationsList] =
		useState<Conversation[]>(conversations);
	const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [isSeen, setIsSeen] = useState<boolean>(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Fetch conversations on component mount
	useEffect(() => {
		fetchConversations();
	}, []);

	// Fetch messages when active conversation changes
	useEffect(() => {
		if (activeConversationId && !messages[activeConversationId]) {
			fetchMessages(activeConversationId);
		}
		// Mark as read when opening the conversation
		const conversation = conversations.find(
			(convo) => convo.id === activeConversationId
		);
		if (conversation && conversation.unreadCount?.[userProfile?.uid || ""] > 0) {
			markAsRead(activeConversationId || "");
			console.log("Marked as read:", activeConversationId);
		}
	}, [activeConversationId]);

	// Update conversationsList when conversations change
	useEffect(() => {
		setConversationsList(conversations);
	}, [conversations]);

	// Get the active conversation details
	const activeConversation = conversations.find(
		(conv) => conv.id === activeConversationId
	);

	// Get messages for active conversation
	const currentMessages = activeConversationId
		? messages[activeConversationId]?.items || []
		: [];

	// Scroll to last message sent
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [currentMessages]);

	// Update the "Time since last message" every minute
	useEffect(() => {
		const interval = setInterval(() => {
			setConversationsList([...conversations]);
		}, 60000);

		return () => clearInterval(interval);
	}, [conversations]);

	// Handle message sending
	const handleSendMessage = async () => {
		if (!messageText.trim() || !activeConversationId) return;

		const textToSend = messageText;

		setMessageText("");

		const temporaryLastMessage = {
			id: `temp-${Date.now()}`,
			content: textToSend,
			sender: {
				uid: userProfile?.uid || "",
				displayName: userProfile?.displayName || "",
				avatarUrl: userProfile?.avatarUrl || "",
			},
			createdAt: new Date().toISOString(),
		};

		const originalConversation = conversations.find(
			(convo) => convo.id === activeConversationId
		);

		if (originalConversation) {
			const updatedConversation: Conversation = {
				...originalConversation,
				lastMessage: temporaryLastMessage,
				updatedAt: new Date().toISOString(),
			};

			updateConversation(updatedConversation);
		}

		try {
			await sendMessage(activeConversationId, textToSend, []);
		} catch (error) {
			setMessageText(textToSend);
			if (originalConversation) {
				const { updateConversation } = useChatStore.getState();
				updateConversation(originalConversation);
			}
			console.log("Failed to send message:", error);
		}
	};

	// Handle chat searching
	const handleSearch = (searchGroupName: string) => {
		if (searchGroupName.trim() === "") {
			setConversationsList(conversations);
		} else {
			const filteredConversations = conversations.filter((conversation) =>
				conversation.groupName
					?.toLowerCase()
					.includes(searchGroupName.toLowerCase())
			);

			setConversationsList(filteredConversations);
		}
	};
	const handleAllClick = () => {
		setActiveFilter("all");
	};
	const handleUnreadClick = () => {
		setActiveFilter("unread");
	};

	const handleSeen = () => {};

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
							onChange={(e) => {
								setSearchText(e.target.value);
								handleSearch(e.target.value);
							}}
							onKeyDown={(e) => {
								if (e.key === "Escape") {
									e.preventDefault();
									setSearchText("");
									handleSearch("");
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
										handleSeen();
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
												(p) => p.uid !== userProfile?.uid
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
							<div className='flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3'>
								{currentMessages.map((message) => {
									const isOwnMessage =
										message?.sender?.uid === userProfile?.uid;
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
													isOwnMessage
														? "bg-purple-500 text-white"
														: "bg-gray-200 text-gray-900"
												}`}
											>
												{message.attachments &&
													message.attachments.length >
														0 && (
														<img
															src={
																message
																	.attachments[0]
																	.url
															}
															alt='attachment'
															className='rounded mb-2 max-w-full'
														/>
													)}
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
							<div className='p-4 border-t border-gray-200 bg-white flex-shrink-0'>
								<div className='flex gap-2'>
									<input
										type='text'
										value={messageText}
										onChange={(e) =>
											setMessageText(e.target.value)
										}
										onKeyDown={(e) => {
											if (
												e.key === "Enter" &&
												!e.shiftKey
											) {
												e.preventDefault();
												handleSendMessage();
											}
										}}
										placeholder='Type a message...'
										className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500'
									/>
									<button
										onClick={handleSendMessage}
										className='px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors'
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
												(p) => p.uid !== userProfile?.uid
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
