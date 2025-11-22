import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";

import { useEffect, useState } from "react";

import Layout from "@/components/Layout";

function MessagePage() {
	const { authUser } = useAuthStore();
	const {
		conversations,
		messages,
		activeConversationId,
		setActiveConversation,
		fetchConversations,
		fetchMessages,
		sendMessage,
	} = useChatStore();

	const [messageText, setMessageText] = useState("");

	// Fetch conversations on component mount
	useEffect(() => {
		fetchConversations();
	}, []);

	// Fetch messages when active conversation changes
	useEffect(() => {
		if (activeConversationId) {
			fetchMessages(activeConversationId);
		}
	}, [activeConversationId]);

	// Get the active conversation details
	const activeConversation = conversations.find(
		(conv) => conv.id === activeConversationId
	);

	// Get messages for active conversation
	const currentMessages = activeConversationId
		? messages[activeConversationId]?.items || []
		: [];

	const handleSendMessage = async () => {
		if (!messageText.trim() || !activeConversationId) return;

		await sendMessage(activeConversationId, messageText, []);
		setMessageText("");
	};

	return (
		<>
			<Layout>
				{/* Main Layout */}
				<div className='grid grid-cols-[1fr_2fr_1fr] gap-5 h-[calc(100vh-80px)]'>
					{/* Left Side - Conversations List */}
					<div className='text-left pl-5 overflow-y-auto border-r border-gray-200'>
						<h1 className='text-xl font-bold mb-4 sticky top-0 bg-white py-2'>
							Chats
						</h1>
						<div className='space-y-2'>
							{conversations.map((conversation) => {
								const otherUser =
									conversation.participants.find(
										(p) => p.uid !== authUser?.uid
									);
								return (
									<div
										key={conversation.id}
										onClick={() =>
											setActiveConversation(
												conversation.id
											)
										}
										className={`p-3 rounded-lg cursor-pointer transition-colors ${
											activeConversationId ===
											conversation.id
												? "bg-purple-100 border-2 border-purple-500"
												: "bg-gray-50 hover:bg-gray-100"
										}`}
									>
										<div className='flex items-center gap-3'>
											<img
												src={
													otherUser?.avatarUrl ||
													"/default-avatar.png"
												}
												alt={
													otherUser?.displayName ||
													"User"
												}
												className='w-10 h-10 rounded-full'
											/>
											<div className='flex-1 min-w-0'>
												<p className='font-semibold text-sm truncate'>
													{otherUser?.displayName ||
														"Unknown"}
												</p>
												<p className='text-xs text-gray-500 truncate'>
													{conversation.lastMessage
														?.content ||
														"No messages yet"}
												</p>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Middle - Main Chat Display */}
					<div className='flex flex-col border-r border-gray-200'>
						{activeConversation ? (
							<>
								{/* Chat Header */}
								<div className='p-4 border-b border-gray-200 bg-white'>
									<div className='flex items-center gap-3'>
										{(() => {
											const otherUser =
												activeConversation.participants.find(
													(p) =>
														p.uid !== authUser?.uid
												);
											return (
												<>
													<img
														src={
															otherUser?.avatarUrl ||
															"/default-avatar.png"
														}
														alt={
															otherUser?.displayName ||
															"User"
														}
														className='w-10 h-10 rounded-full'
													/>
													<div>
														<p className='font-semibold'>
															{otherUser?.displayName ||
																"Unknown"}
														</p>
														<p className='text-xs text-gray-500'>
															Online
														</p>
													</div>
												</>
											);
										})()}
									</div>
								</div>

								{/* Messages Area */}
								<div className='flex-1 overflow-y-auto p-4 space-y-3'>
									{currentMessages.map((message) => (
										<div
											key={message.id}
											className={`flex ${
												message.isOwn
													? "justify-end"
													: "justify-start"
											}`}
										>
											<div
												className={`max-w-[70%] rounded-lg p-3 ${
													message.isOwn
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
												<p className='text-sm'>
													{message.content}
												</p>
												<p className='text-xs opacity-70 mt-1'>
													{
														/* {new Date(
														message.createdAt
													).toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})} */
														message.createdAt
													}
												</p>
											</div>
										</div>
									))}
								</div>

								{/* Message Input */}
								<div className='p-4 border-t border-gray-200 bg-white'>
									<div className='flex gap-2'>
										<input
											type='text'
											value={messageText}
											onChange={(e) =>
												setMessageText(e.target.value)
											}
											onKeyPress={(e) => {
												if (e.key === "Enter") {
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
										Welcome, {authUser?.displayName}!
									</p>
									<p className='text-sm'>
										Select a chat to start messaging
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Right Side - Chat's Detail */}
					<div className='text-left pr-5 overflow-y-auto'>
						{activeConversation ? (
							<>
								<h1 className='text-xl font-bold mb-4'>
									Chat Details
								</h1>
								<div className='space-y-4'>
									{(() => {
										const otherUser =
											activeConversation.participants.find(
												(p) => p.uid !== authUser?.uid
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
							</>
						) : (
							<div className='text-center text-gray-500 mt-8'>
								<p className='text-sm'>No chat selected</p>
							</div>
						)}
					</div>
				</div>
			</Layout>
		</>
	);
}

export default MessagePage;
