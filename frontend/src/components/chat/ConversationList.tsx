import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import { Search, Circle } from "@mui/icons-material";

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

function ConversationList() {
	const { userProfile } = useAuthStore();
	const { conversations, activeConversationId, setActiveConversation } =
		useChatStore();

	const [searchText, setSearchText] = useState("");
	const [conversationsList, setConversationsList] =
		useState<Conversation[]>(conversations);
	const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

	// Update conversationsList when conversations change
	useEffect(() => {
		if (!userProfile) return;

		let result = [...conversations];

		// 1. Filter by Tab (All / Unread)
		if (activeFilter === "unread") {
			result = result.filter((c) => {
				const count = c.unreadCount?.[userProfile.uid] || 0;
				return count > 0;
			});
		}

		// 2. Filter by Search Text
		if (searchText.trim() !== "") {
			const lowerSearch = searchText.toLowerCase();
			result = result.filter((c) =>
				c.groupName?.toLowerCase().includes(lowerSearch)
			);
		}

		// Sort conversations in order of lastMessage.createdAt
		result.sort((a, b) => {
			const timeA = new Date(
				a.lastMessageAt || a.updatedAt || a.createdAt
			).getTime();
			const timeB = new Date(
				b.lastMessageAt || b.updatedAt || b.createdAt
			).getTime();

			return timeB - timeA;
		});

		setConversationsList(result);
	}, [conversations, activeFilter, searchText, userProfile]);

	// Update the "Time since last message" every minute
	useEffect(() => {
		const interval = setInterval(() => {
			setConversationsList([...conversations]);
		}, 60000);

		return () => clearInterval(interval);
	}, [conversations]);

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
		<div className='text-left px-3 overflow-y-auto border-r border-gray-200 min-w-[300px]'>
			<h1 className='text-xl font-bold mb-4 sticky top-0 py-2'>Chats</h1>

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
						"&::before": {
							display: "none",
						},
						"&:focus-within": {
							outline: "solid #a855f7",
						},
					}}
				/>
			</div>

			{/* Navigation Buttons */}
			<div className='flex flex-row justify-center p-3 gap-5'>
				{/* View All Conversations */}
				<Button
					onClick={handleAllClick}
					variant='plain'
					sx={{
						width: "50%",
						fontWeight: "bold",
						fontSize: "1.2rem",
						borderRadius: "20px",
						color: activeFilter === "all" ? "white" : "black",
						backgroundColor:
							activeFilter === "all" ? "#c084fc" : "transparent",
						"&:hover": {
							backgroundColor:
								activeFilter === "all" ? "#a855f7" : "#f3f4f6",
						},
						"&:active": {
							transform: "scale(0.95)",
						},
					}}
				>
					All
				</Button>

				{/* View Unread Conversations */}
				<Button
					onClick={handleUnreadClick}
					variant='plain'
					sx={{
						width: "50%",
						fontWeight: "bold",
						color: activeFilter === "unread" ? "white" : "black",
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
						conversation.unreadCount?.[userProfile?.uid || ""] || 0;

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
									alt={conversation?.groupName || "User"}
									className='w-10 h-10 rounded-full'
								/>

								<div className='flex-1 min-w-0'>
									{/* User Name */}
									<p className='ext-sm truncate font-semibold'>
										{conversation?.groupName || "Unknown"}
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
												? conversation?.lastMessage
														?.sender?.uid ===
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
											{conversation.lastMessage?.createdAt
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
								{unreadCount > 0 ? unreadCountLabel : ""}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default ConversationList;
