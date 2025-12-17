import { useState, useRef, useEffect, useLayoutEffect } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useSocketStore } from "@/stores/useSocketStore";
import type { Conversation, Message, Participant } from "@/types/chat";
import type { UserProfile } from "@/types/user";
import IconButton from "@mui/material/IconButton";
import { Info, Circle, Close } from "@mui/icons-material";
import { formatFileSize, isImageFile } from "@/lib/utils";
import ProfileModal from "@/components/ProfileModal";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";

interface ChatWindowProps {
	onToggleDetails: () => void;
}

function ChatWindow({ onToggleDetails }: ChatWindowProps) {
	const { userProfile } = useAuthStore();
	const {
		conversations,
		messages,
		activeConversationId,
		fetchMessages,
		sendMessage,
		markAsRead,
		loadingMessages,
	} = useChatStore();

	const { onlineUsers } = useSocketStore();
	const navigate = useNavigate();
	const location = useLocation();

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [messageText, setMessageText] = useState("");
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

	//for llm suggest
	const suggestTextArea = useRef<HTMLTextAreaElement>(null);
	const [suggestText, setSuggestText] = useState("");
	const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
	const [showSuggestBanner, setShowSuggestBanner] = useState(false);
	const [showHelpfulBanner, setShowHelpfulBanner] = useState(false);
	const [latestSuggestionId, setLatestSuggestionId] = useState<string>("");

	const [selectedProfile, setSelectedProfile] = useState<
		UserProfile | Participant | null
	>(null);
	const [selectedUserProfile, setSelectedUserProfile] =
		useState<UserProfile | null>(null);
	const [isLoadingProfile, setIsLoadingProfile] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const previousScrollHeightRef = useRef<number>(0);
	const isFetchingOldMessagesRef = useRef(false);
	const lastMessageIdRef = useRef<string | null>(null);

	// Fetch UserProfile when selectedProfile changes
	useEffect(() => {
		const fetchUserProfile = async () => {
			if (!selectedProfile?.uid) {
				setSelectedUserProfile(null);
				return;
			}

			setIsLoadingProfile(true);
			try {
				const res = await api.get(`/users/${selectedProfile.uid}`);
				const { data } = res.data;

				console.log("Fetched user profile:", data);
				console.log("Avatar URL:", data.avatarUrl);

				setSelectedUserProfile(data);
			} catch (error) {
				toast.error("Failed to fetch user profile.");
				console.error("Failed to fetch user profile:", error);
			} finally {
				setIsLoadingProfile(false);
			}
		};
		fetchUserProfile();
	}, [selectedProfile, activeConversationId]);

	// Get the active conversation details
	const activeConversation = conversations.find(
		(conv) => conv.id === activeConversationId
	);

	// Get messages for active conversation
	const conversationData = activeConversationId
		? messages[activeConversationId]
		: null;
	const currentMessages = conversationData ? conversationData.items : [];
	const hasMoreMessages = conversationData ? conversationData.hasMore : false;

	useEffect(() => {
		const userId = location.state?.userId;

		if (userId && conversations.length > 0) {
			// Find if there's an existing direct conversation with this user
			const conversation = conversations.find((convo) => {
				return convo.participants.some(
					(participant) => participant.uid === userId
				);
			});

			console.log("Found conversation from URL param:", conversation);

			if (conversation) {
				// Set this conversation as active
				useChatStore.getState().setActiveConversation(conversation.id);

				// Clear the state after using it to prevent issue on refresh
				navigate(location.pathname, { replace: true, state: {} });
			}
		}
	}, [conversations, location.state, navigate, location.pathname]);

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

	useLayoutEffect(() => {
		if (isFetchingOldMessagesRef.current && chatContainerRef.current) {
			const newScrollHeight = chatContainerRef.current.scrollHeight;
			const heightDifference =
				newScrollHeight - previousScrollHeightRef.current;

			chatContainerRef.current.scrollTop = heightDifference;
			isFetchingOldMessagesRef.current = false;
		}
	}, [currentMessages]);

	// Scroll to last message sent
	useEffect(() => {
		if (!messagesEndRef.current || currentMessages.length === 0) return;

		const lastMessage = currentMessages[currentMessages.length - 1];

		const isLastMessageChanged =
			lastMessage.id !== lastMessageIdRef.current;

		lastMessageIdRef.current = lastMessage.id;

		if (isLastMessageChanged && !isFetchingOldMessagesRef.current) {
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "end",
				});
			}, 100);
		}
	}, [currentMessages, activeConversationId]);

	const handleSuggestMessage = async () => {
		setIsLoadingSuggestion(true);
		try {
			const ret = await api.post("/llmSuggest/suggest", {
				conversationId: activeConversationId,
				userContext: suggestText.trim(),
			});
			const data = ret.data;
			if (data && data.response) {
				setLatestSuggestionId(data.llmSuggestId);
				setMessageText(data.response);
				setShowHelpfulBanner(true);
			} else {
				toast.error("Failed to get suggestion.");
			}
		} catch (error) {
			toast.error("Failed to get suggestion.");
			console.error("Failed to get suggestion:", error);
		} finally {
			setIsLoadingSuggestion(false);
		}
	};

	const handleSuggestTelemetry = async (helpful: boolean) => {
		try {
			await api.post("/llmSuggest/telemetry", {
				llmSuggestId: latestSuggestionId,
				isHelpful: helpful,
			});
			setLatestSuggestionId("");
		} catch (error) {
			console.error("Failed to send telemetry:", error);
		}
	};

	const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, scrollHeight } = e.currentTarget;

		if (scrollTop === 0 && hasMoreMessages && !loadingMessages) {
			console.log("Load more messages triggered...");

			previousScrollHeightRef.current = scrollHeight;
			isFetchingOldMessagesRef.current = true;

			if (activeConversationId) {
				await fetchMessages(activeConversationId);
			}
		}
	};

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

	const handleSendMessage = async () => {
		if (
			(!messageText.trim() && selectedFiles.length === 0) ||
			!activeConversationId
		)
			return;

		const textToSend = messageText.trim();
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

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${Math.min(
				textareaRef.current.scrollHeight,
				150
			)}px`;
		}
	}, [messageText]);

	if (!activeConversation) {
		return (
			<div className='flex items-center justify-center h-full text-gray-500'>
				<div className='text-center'>
					<p className='text-lg font-semibold mb-2'>
						Welcome, {userProfile?.displayName}!
					</p>
					<p className='text-sm'>Select a chat to start messaging</p>
				</div>
			</div>
		);
	}

	const otherUser = activeConversation.participants.find(
		(p) => p.uid !== userProfile?.uid
	);
	const isOnline = onlineUsers.includes(otherUser?.uid || "");

	const handleViewProfile = () => {
		if (otherUser) {
			setSelectedProfile(otherUser);
			setIsProfileModalOpen(true);
		}
	};

	const handleCloseModal = () => {
		setIsProfileModalOpen(false);
		setSelectedProfile(null);
	};

	const handleChat = () => {
		handleCloseModal();
	};

	return (
		<div className='flex flex-col border-r border-gray-200 h-full overflow-hidden'>
			{/* Chat Header */}
			<div className='flex flex-row justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0'>
				{/* Other User Data */}
				<div
					className='flex items-center gap-3 px-3 py-3 hover:cursor-pointer hover:bg-gray-50 rounded-lg transition-colors'
					onClick={handleViewProfile}
				>
					<img
						src={
							activeConversation?.groupAvatarUrl ||
							"/default-avatar.png"
						}
						alt={activeConversation?.groupName || "User"}
						className='w-10 h-10 rounded-full'
					/>
					<div>
						<p className='font-semibold'>
							{activeConversation?.groupName || "Unknown"}
						</p>
						<p
							className='text-xs flex items-center gap-1'
							style={{
								color: isOnline ? "#10b981" : "#6b7280",
							}}
						>
							<Circle
								sx={{
									fontSize: "0.8rem",
									color: isOnline ? "#10b981" : "#6b7280",
								}}
							/>
							{isOnline ? "Online" : "Offline"}
						</p>
					</div>
				</div>

				{/* Detail Tab Button */}
				<div className='flex items-center'>
					<IconButton onClick={onToggleDetails}>
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
				{loadingMessages && isFetchingOldMessagesRef.current && (
					<div className='flex justify-center w-full py-2'>
						<div className='w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin'></div>
					</div>
				)}
				{currentMessages.map((message) => {
					const isOwnMessage =
						message?.sender?.uid === userProfile?.uid;
					return (
						<div
							key={message.id}
							className={`flex ${
								isOwnMessage ? "justify-end" : "justify-start"
							}`}
						>
							<div
								className={`max-w-[70%] rounded-lg p-3 overflow-hidden ${
									message.isOwn
										? "bg-purple-500 text-white"
										: "bg-gray-200 text-gray-900"
								}`}
							>
								{/* Attachments */}
								{message.attachments &&
									message.attachments.length > 0 && (
										<div className='flex flex-col gap-2 mb-2'>
											{message.attachments.map((att) => {
												// CASE 1: Image
												if (
													isImageFile(
														att.originalName
													)
												) {
													return (
														<div
															key={att.id}
															className='relative group cursor-pointer'
														>
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
															<a
																href={
																	att.urlDownload
																}
																target='_blank'
																rel='noopener noreferrer'
																className='absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity'
																title='Download'
																onClick={(e) =>
																	e.stopPropagation()
																}
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

												// CASE 2: Other file types
												return (
													<a
														key={att.id}
														href={att.urlDownload}
														target='_blank'
														rel='noopener noreferrer'
														className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
															message.isOwn
																? "bg-purple-600 border-purple-400 hover:bg-purple-700"
																: "bg-white border-gray-300 hover:bg-gray-50"
														}`}
													>
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
											})}
										</div>
									)}

								<p
									className='text-sm whitespace-pre-wrap break-words'
									style={{
										overflowWrap: "anywhere",
									}}
								>
									{message.content}
								</p>
								<p className='text-xs opacity-70 mt-1'>
									{message.createdAt
										? `${new Date(
												message.createdAt
										  ).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
										  })} - ${new Date(
												message.createdAt
										  ).toLocaleDateString([], {
												day: "2-digit",
												month: "2-digit",
												year: "2-digit",
										  })}`
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
				{/* File Preview Area */}
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
									onClick={() => handleRemoveFile(index)}
									className='ml-2 text-gray-500 hover:text-red-500 focus:outline-none'
								>
									✕
								</button>
							</div>
						))}
					</div>
				)}

				{/* Helpful Banner */}
				{showHelpfulBanner && (
					<div className='border-t border-gray-200 bg-blue-50 px-4 py-3'>
						<div className='flex items-center justify-between'>
							<p className='text-sm text-gray-700'>
								Is the suggestion helpful?
							</p>
							<div className='flex gap-2'>
								<button
									onClick={() => {
										handleSuggestTelemetry(true);
										setShowHelpfulBanner(false);
									}}
									className='px-4 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
								>
									Yes
								</button>
								<button
									onClick={() => {
										handleSuggestTelemetry(false);
										setShowHelpfulBanner(false);
									}}
									className='px-4 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
								>
									No
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Suggest Banner */}
				{showSuggestBanner && (
					<div
						className={`border-t border-gray-200 bg-blue-50 px-3 py-2 ${
							isLoadingSuggestion
								? "opacity-50 pointer-events-none"
								: ""
						}`}
					>
						<div className='flex items-center justify-between gap-2'>
							<p className='text-sm text-gray-700'>
								AI Suggestion for next message
							</p>
							<textarea
								ref={suggestTextArea}
								value={suggestText}
								onChange={(e) => setSuggestText(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleSuggestMessage();
									}
								}}
								placeholder='(Optional) User context to help AI suggest...'
								rows={1}
								className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none overflow-y-auto min-h-[44px] max-h-[150px] no-scrollbar'
							/>
							<button
								onClick={handleSuggestMessage}
								className={`px-4 py-2 text-white rounded-lg transition-all duration-300 ${"bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/50"}`}
							>
								Suggest me!
							</button>
							<IconButton
								onClick={() => setShowSuggestBanner(false)}
								size='small'
								sx={{
									color: "#6b7280",
									"&:hover": {
										backgroundColor: "#f3f4f6",
									},
								}}
							>
								<Close fontSize='small' />
							</IconButton>
						</div>
					</div>
				)}

				{/* Message Input Area */}
				<div
					className={`p-4 flex gap-2 items-end ${
						isLoadingSuggestion
							? "opacity-50 pointer-events-none"
							: ""
					}`}
				>
					{/* Suggest Me Button*/}
					<button
						onClick={() => {
							if (showSuggestBanner) setShowSuggestBanner(false);
							else setShowSuggestBanner(true);
						}}
						disabled={isLoadingSuggestion}
						className={`p-2.5 rounded-lg transition-colors flex-shrink-0 self-end ${
							isLoadingSuggestion
								? "bg-blue-300 cursor-not-allowed"
								: "bg-blue-500 hover:bg-blue-600 text-white"
						}`}
						title='AI Suggest'
					>
						{isLoadingSuggestion ? (
							<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
						) : (
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
									strokeWidth={2}
									d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
								/>
							</svg>
						)}
					</button>
					{/* File Choosing Button */}
					<button
						onClick={() => fileInputRef.current?.click()}
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

					{/* Input File Hidden */}
					<input
						type='file'
						multiple
						ref={fileInputRef}
						className='hidden'
						onChange={handleFileSelect}
					/>

					{/* Text Input Area */}
					<textarea
						ref={textareaRef}
						value={messageText}
						onChange={(e) => setMessageText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSendMessage();
							}
						}}
						placeholder='Type a message...'
						rows={1}
						className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none overflow-y-auto min-h-[44px] max-h-[150px] no-scrollbar'
					/>

					{/* Send Message Button */}
					<button
						onClick={handleSendMessage}
						disabled={
							!messageText.trim() && selectedFiles.length === 0
						}
						className={`px-4 py-2 text-white rounded-lg transition-colors ${
							!messageText.trim() && selectedFiles.length === 0
								? "bg-purple-300 cursor-not-allowed"
								: "bg-purple-500 hover:bg-purple-600"
						}`}
					>
						Send
					</button>
				</div>
			</div>

			{/* Profile Modal */}
			<ProfileModal
				isOpen={isProfileModalOpen}
				onClose={handleCloseModal}
				userProfile={selectedUserProfile}
				onChat={handleChat}
				showActions={false}
			/>
		</div>
	);
}

export default ChatWindow;
