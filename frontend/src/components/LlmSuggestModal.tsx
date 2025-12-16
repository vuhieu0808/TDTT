import { useState, useRef, useEffect } from "react";
import { llmChatServices } from "@/services/chatServices";
import { Send, SmartToy, Person, DeleteOutline } from "@mui/icons-material";
import { toast } from "sonner";
import { formatMarkdownToHTML } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

import {
	ModalClose,
	Sheet,
	Modal,
	dividerClasses,
	Textarea,
	Button,
	IconButton,
	CircularProgress,
} from "@mui/joy";

interface Message {
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

interface llmChatModalProps {
	isOpen: boolean;
	onClose: () => void;
	conversationId?: string;
}

function llmSuggestModal({
	isOpen,
	onClose,
	conversationId = "default",
}: llmChatModalProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			role: "assistant",
			content:
				"Hi! I'm your AI assistant. Ask me anything about finding study partners, choosing cafes, or planning your work sessions!",
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSend = async () => {
		if (!input.trim() || isLoading) return;

		const userMessage: Message = {
			role: "user",
			content: input,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		const userInput = input;
		setInput("");
		setIsLoading(true);

		try {
			console.log("Sending message to AI:", userInput);
			const response = await llmChatServices.chat(
				userInput,
				conversationId
			);
			console.log("AI Response received:", response);

			const aiMessage: Message = {
				role: "assistant",
				content:
					response.response ||
					"Sorry, I couldn't process that request.",
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, aiMessage]);
		} catch (error) {
			console.error("Failed to get AI response:", error);
			toast.error("Failed to get response from AI");

			const errorMessage: Message = {
				role: "assistant",
				content:
					"Sorry, I'm having trouble connecting right now. Please try again.",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
			console.log("Loading state set to false");
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleClearChat = async () => {
		try {
			await llmChatServices.deleteHistory(conversationId);
			setMessages([
				{
					role: "assistant",
					content: "Chat cleared! How can I help you today?",
					timestamp: new Date(),
				},
			]);
			toast.success("Chat history cleared");
		} catch (error) {
			console.error("Failed to clear chat:", error);
			toast.error("Failed to clear chat history");
		}
	};

	return (
		<>
			<Modal
				open={isOpen}
				onClose={onClose}
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Sheet
					variant='outlined'
					sx={{
						display: "flex",
						flexDirection: "column",
						maxWidth: "900px",
						width: "90vw",
						height: "85vh",
						borderRadius: "16px",
						boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
						overflow: "hidden",
						backgroundColor: "#ffffff",
					}}
				>
					{/* Modal Header */}
					<div className='flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white'>
						<div className='flex items-center gap-3'>
							<SmartToy sx={{ fontSize: "32px" }} />
							<div>
								<h2 className='text-xl font-bold'>
									AI Assistant
								</h2>
								<p className='text-sm opacity-90'>
									Powered by Gemma
								</p>
							</div>
						</div>
						<div className='flex items-center gap-2'>
							<IconButton
								onClick={handleClearChat}
								sx={{
									color: "white",
									"&:hover": {
										backgroundColor:
											"rgba(255,255,255,0.2)",
									},
								}}
								title='Clear chat'
							>
								<DeleteOutline />
							</IconButton>
							<ModalClose
								sx={{ color: "white", position: "static" }}
							/>
						</div>
					</div>

					{/* Chat Content */}
					<div className='flex-1 overflow-y-auto bg-gray-50 p-4'>
						<div className='max-w-4xl mx-auto space-y-4'>
							{messages.map((message, idx) => (
								<div
									key={idx}
									className={`flex gap-3 ${
										message.role === "user"
											? "flex-row-reverse"
											: "flex-row"
									}`}
								>
									{/* Avatar */}
									<div
										className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
											message.role === "assistant"
												? "bg-gradient-to-br from-purple-500 to-blue-500"
												: "bg-gradient-to-br from-gray-600 to-gray-800"
										}`}
									>
										{message.role === "assistant" ? (
											<SmartToy
												sx={{
													color: "white",
													fontSize: "24px",
												}}
											/>
										) : (
											<Person
												sx={{
													color: "white",
													fontSize: "24px",
												}}
											/>
										)}
									</div>

									{/* Message Bubble */}
									<div
										className={`flex flex-col max-w-[75%] ${
											message.role === "user"
												? "items-end"
												: "items-start"
										}`}
									>
										<div
											className={`rounded-2xl px-4 py-3 shadow-sm ${
												message.role === "user"
													? "bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-tr-sm"
													: "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
											}`}
										>
											{message.role === "assistant" ? (
												<div
													className='prose prose-sm max-w-none'
													dangerouslySetInnerHTML={{
														__html: formatMarkdownToHTML(
															message.content
														),
													}}
													style={{
														color: "inherit",
													}}
												/>
											) : (
												<p className='whitespace-pre-wrap break-words'>
													{message.content}
												</p>
											)}
										</div>
										<span
											className={`text-xs mt-1 px-2 ${
												message.role === "user"
													? "text-gray-500"
													: "text-gray-400"
											}`}
										>
											{message.timestamp.toLocaleTimeString(
												[],
												{
													hour: "2-digit",
													minute: "2-digit",
												}
											)}
										</span>
									</div>
								</div>
							))}

							{/* Loading indicator */}
							{isLoading && (
								<div className='flex gap-3'>
									<div className='flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500'>
										<SmartToy
											sx={{
												color: "white",
												fontSize: "24px",
											}}
										/>
									</div>
									<div className='bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-200'>
										<div className='flex gap-1'>
											<span
												className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
												style={{
													animationDelay: "0ms",
												}}
											></span>
											<span
												className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
												style={{
													animationDelay: "150ms",
												}}
											></span>
											<span
												className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
												style={{
													animationDelay: "300ms",
												}}
											></span>
										</div>
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>
					</div>

					{/* Modal Footer */}
					<div className='border-t border-gray-200 bg-white p-4'>
						<div className='flex items-end gap-3 max-w-4xl mx-auto'>
							<Textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleKeyPress}
								disabled={isLoading}
								placeholder='Type your message here...'
								minRows={1}
								maxRows={4}
								sx={{
									flex: 1,
									minHeight: "42px",
									"--Textarea-focusedHighlight":
										"rgba(147, 51, 234, 0.25)",
									"&:focus-within": {
										outline:
											"2px solid rgba(147, 51, 234, 0.5)",
									},
									borderRadius: "12px",
									fontSize: "14px",
								}}
							/>
							<Button
								onClick={handleSend}
								disabled={isLoading || !input.trim()}
								sx={{
									background:
										"linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)",
									color: "white",
									borderRadius: "12px",
									px: 3,
									py: 1.5,
									height: "42px",
									minWidth: "100px",
									"&:hover": {
										background:
											"linear-gradient(135deg, #7e22ce 0%, #2563eb 100%)",
									},
									"&:disabled": {
										background: "#e5e7eb",
										color: "#9ca3af",
									},
								}}
							>
								{isLoading ? (
									<CircularProgress
										size='sm'
										sx={{ color: "white" }}
									/>
								) : (
									<>
										<Send
											sx={{ fontSize: "20px", mr: 1 }}
										/>
										Send
									</>
								)}
							</Button>
						</div>
					</div>
				</Sheet>
			</Modal>
		</>
	);
}

export default llmSuggestModal;
