import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation, Message } from "@/types/chat";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/joy/Button";
import { Close, PhotoLibrary, TextSnippet } from "@mui/icons-material";
import { formatFileSize, isImageFile } from "@/lib/utils";

interface ChatDetailsProps {
	onClose: () => void;
}

function ChatDetails({ onClose }: ChatDetailsProps) {
	const { userProfile } = useAuthStore();
	const {
		conversations,
		activeConversationId,
		messages,
		fetchSharedMessages,
	} = useChatStore();

	const [detailView, setDetailView] = useState<"media" | "file">("media");
	const [sharedMessages, setSharedMessages] = useState<Message[]>([]);
	const [sharedCursor, setSharedCursor] = useState<string | null>(null);
	const [loadingShared, setLoadingShared] = useState(false);
	const [hasMoreShared, setHasMoreShared] = useState(true);

	// Get the active conversation details
	const activeConversation = conversations.find(
		(conv) => conv.id === activeConversationId
	);

	// Get messages for active conversation
	const conversationData = activeConversationId
		? messages[activeConversationId]
		: null;
	const currentMessages = conversationData ? conversationData.items : [];

	// Add new messages to shared list
	useEffect(() => {
		if (!currentMessages || currentMessages.length === 0) return;

		const newestMessage = currentMessages[currentMessages.length - 1];

		if (newestMessage.attachments && newestMessage.attachments.length > 0) {
			setSharedMessages((prev) => {
				if (prev.some((msg) => msg.id === newestMessage.id)) {
					return prev;
				}

				const processedMsg = {
					...newestMessage,
					isOwn: newestMessage.sender?.uid === userProfile?.uid,
				};

				return [processedMsg, ...prev];
			});
		}
	}, [currentMessages]);

	const loadMoreSharedMessages = async (isInitial = false) => {
		if (!activeConversationId || !userProfile) return;

		if (loadingShared || (!isInitial && !hasMoreShared)) return;

		setLoadingShared(true);
		try {
			const cursorToUse = isInitial ? null : sharedCursor;

			const { messages: fetchedMsgs, cursor: nextCursor } =
				await fetchSharedMessages(
					activeConversationId,
					cursorToUse ?? undefined
				);

			const processed = fetchedMsgs
				.map((msg) => ({
					...msg,
					isOwn: msg?.sender?.uid === userProfile.uid,
				}))
				.reverse();

			setSharedMessages((prev) =>
				isInitial ? processed : [...prev, ...processed]
			);

			setSharedCursor(nextCursor);
			setHasMoreShared(!!nextCursor);
		} catch (error) {
			console.error("Error loading shared messages:", error);
		} finally {
			setLoadingShared(false);
		}
	};

	// Reset and load when detail opens or conversation changes
	useEffect(() => {
		if (activeConversationId) {
			setSharedMessages([]);
			setSharedCursor(null);
			setHasMoreShared(true);
			loadMoreSharedMessages(true);
		}
	}, [activeConversationId]);

	const handleDetailScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
		if (
			scrollHeight - scrollTop - clientHeight <= 2 &&
			hasMoreShared &&
			!loadingShared
		) {
			console.log("Load more shared messages triggered...");
			loadMoreSharedMessages();
		}
	};

	if (!activeConversation) return null;

	const otherUser = activeConversation.participants.find(
		(p) => p.uid !== userProfile?.uid
	);

	return (
		<div className='border-l border-gray-200 bg-white overflow-hidden'>
			<div className='flex flex-col h-full px-3'>
				{/* Header with Close Button */}
				<div className='flex justify-between items-center py-4 border-b border-gray-200'>
					<h1 className='font-bold !text-4xl'>Chat Details</h1>
					<IconButton onClick={onClose}>
						<Close sx={{ color: "#6b7280" }} />
					</IconButton>
				</div>

				{/* Scrollable Content */}
				<div
					className='space-y-4 overflow-y-auto flex-1 py-4'
					onScroll={handleDetailScroll}
				>
					{/* Other User's Details */}
					<div className='text-center'>
						<img
							src={otherUser?.avatarUrl || "/default-avatar.png"}
							alt={otherUser?.displayName || "User"}
							className='w-24 h-24 rounded-full mx-auto mb-2'
						/>
						<p className='font-semibold text-lg'>
							{otherUser?.displayName || "Unknown"}
						</p>
					</div>

					{/* Chat Information */}
					<div className='border-t py-5'>
						<p className='text-sm font-semibold mb-2'>About</p>
						<p className='text-sm text-gray-600'>
							Conversation started on{" "}
							{new Date(
								activeConversation.createdAt
							).toLocaleDateString()}
						</p>
					</div>

					{/* Navigation Buttons */}
					<div className='flex flex-row border-b border-gray-200'>
						{/* Media Button */}
						<Button
							onClick={() => setDetailView("media")}
							variant='plain'
							sx={{
								fontWeight:
									detailView === "media"
										? "bold"
										: "semibold",
								color: "black",
								width: "100%",
								textAlign: "center",
								padding: "12px 0",
								justifyContent: "center",
								borderBottom:
									detailView === "media"
										? "3px solid #a855f7"
										: "3px solid transparent",
								borderRadius: 0,
								"&:hover": {
									backgroundColor: "#f3f4f6",
								},
							}}
						>
							<PhotoLibrary
								sx={{
									marginRight: "5px",
								}}
							/>
							Media
						</Button>

						{/* File Button */}
						<Button
							onClick={() => setDetailView("file")}
							variant='plain'
							sx={{
								fontWeight:
									detailView === "file" ? "bold" : "semibold",
								color: "black",
								width: "100%",
								textAlign: "center",
								padding: "12px 0",
								justifyContent: "center",
								borderBottom:
									detailView === "file"
										? "3px solid #a855f7"
										: "3px solid transparent",
								borderRadius: 0,
								"&:hover": {
									backgroundColor: "#f3f4f6",
								},
							}}
						>
							<TextSnippet
								sx={{
									marginRight: "5px",
								}}
							/>
							File
						</Button>
					</div>

					{/* Media/File Display Area */}
					<div className='py-4 overflow-y-auto flex-1 custom-scrollbar'>
						{/* Loading State */}
						{loadingShared && sharedMessages.length === 0 ? (
							<div className='flex justify-center py-8'>
								<div className='w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin'></div>
							</div>
						) : detailView === "media" ? (
							// --- MEDIA TAB ---
							<div className='grid grid-cols-3 gap-2'>
								{sharedMessages
									.filter((msg) =>
										msg.attachments?.some((att) =>
											isImageFile(att.originalName)
										)
									)
									.flatMap(
										(msg) =>
											msg.attachments?.filter((att) =>
												isImageFile(att.originalName)
											) || []
									)
									.map((attachment) => (
										<div
											key={attachment.id}
											className='aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-100'
											onClick={() =>
												window.open(
													attachment.urlView,
													"_blank"
												)
											}
										>
											<img
												src={attachment.urlView}
												alt={attachment.originalName}
												loading='lazy'
												className='w-full h-full object-cover'
											/>
										</div>
									))}

								{/* Empty State Media */}
								{!loadingShared &&
									sharedMessages.every(
										(msg) =>
											!msg.attachments?.some((att) =>
												isImageFile(att.originalName)
											)
									) && (
										<div className='col-span-3 text-center py-8 text-gray-500'>
											<PhotoLibrary
												sx={{
													fontSize: "3rem",
													opacity: 0.3,
												}}
											/>
											<p className='text-sm mt-2'>
												No media shared
											</p>
										</div>
									)}
							</div>
						) : (
							// --- FILE TAB ---
							<div className='space-y-2'>
								{sharedMessages
									.filter((msg) =>
										msg.attachments?.some(
											(att) =>
												!isImageFile(att.originalName)
										)
									)
									.flatMap(
										(msg) =>
											msg.attachments?.filter(
												(att) =>
													!isImageFile(
														att.originalName
													)
											) || []
									)
									.map((attachment) => (
										<a
											key={attachment.id}
											href={attachment.urlDownload}
											target='_blank'
											rel='noopener noreferrer'
											className='flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors'
										>
											<div className='p-2 rounded-full bg-gray-100'>
												<TextSnippet className='w-6 h-6 text-gray-500' />
											</div>
											<div className='flex-1 min-w-0'>
												<p className='text-sm font-medium truncate text-gray-900'>
													{attachment.originalName}
												</p>
												<p className='text-xs text-gray-500'>
													{formatFileSize(
														attachment.size
													)}
												</p>
											</div>
										</a>
									))}

								{/* Empty State File */}
								{!loadingShared &&
									sharedMessages.every(
										(msg) =>
											!msg.attachments?.some(
												(att) =>
													!isImageFile(
														att.originalName
													)
											)
									) && (
										<div className='text-center py-8 text-gray-500'>
											<TextSnippet
												sx={{
													fontSize: "3rem",
													opacity: 0.3,
												}}
											/>
											<p className='text-sm mt-2'>
												No files shared
											</p>
										</div>
									)}
							</div>
						)}

						{/* Loading spinner at bottom */}
						{loadingShared && sharedMessages.length > 0 && (
							<div className='flex justify-center py-4 w-full'>
								<div className='w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin'></div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default ChatDetails;
