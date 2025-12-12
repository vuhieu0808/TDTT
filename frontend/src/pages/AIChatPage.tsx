import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import Navbar from "@/components/Navbar";
import { llmChatServices } from "@/services/chatServices";
import { Send, SmartToy, Person, DeleteOutline } from "@mui/icons-material";
import { toast } from "sonner";

interface Message {
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

function AIChatPage() {
	const conversationId = "default"; // You can make this dynamic per user session
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
			const response = await llmChatServices.chat(
				userInput,
				conversationId
			);

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
			<Navbar />
			<div className='min-h-[calc(100vh-64px)] bg-gradient-to-br from-purple-50 via-pink-50 to-white'>
				<div className='max-w-4xl mx-auto p-4 h-[calc(100vh-64px)] flex flex-col'>
					{/* Header */}
					<div className='bg-white rounded-t-3xl shadow-lg p-6 flex items-center justify-between'>
						<div className='flex items-center gap-3'>
							<div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
								<SmartToy
									sx={{ color: "white", fontSize: "1.75rem" }}
								/>
							</div>
							<div>
								<h1 className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
									AI Assistant
								</h1>
								<p className='text-sm text-gray-500'>
									Always here to help
								</p>
							</div>
						</div>
						<button
							onClick={handleClearChat}
							className='p-2 hover:bg-red-50 rounded-full transition-colors group'
							title='Clear chat'
						>
							<DeleteOutline
								sx={{ color: "#ef4444" }}
								className='group-hover:scale-110 transition-transform'
							/>
						</button>
					</div>

					{/* Messages Container */}
					<div className='flex-1 bg-white shadow-lg overflow-y-auto p-6 space-y-4'>
						{messages.map((message, index) => (
							<div
								key={index}
								className={`flex gap-3 ${
									message.role === "user"
										? "flex-row-reverse"
										: "flex-row"
								}`}
							>
								{/* Avatar */}
								<div
									className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
										message.role === "user"
											? "bg-gradient-to-r from-purple-500 to-pink-500"
											: "bg-gradient-to-r from-pink-400 to-purple-400"
									}`}
								>
									{message.role === "user" ? (
										<Person
											sx={{
												color: "white",
												fontSize: "1.25rem",
											}}
										/>
									) : (
										<SmartToy
											sx={{
												color: "white",
												fontSize: "1.25rem",
											}}
										/>
									)}
								</div>

								{/* Message Bubble */}
								<div
									className={`max-w-[70%] rounded-2xl p-4 ${
										message.role === "user"
											? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
											: "bg-gray-100 text-gray-800"
									}`}
								>
									<p className='text-sm whitespace-pre-wrap'>
										{message.content}
									</p>
									<p
										className={`text-xs mt-2 ${
											message.role === "user"
												? "text-purple-100"
												: "text-gray-500"
										}`}
									>
										{message.timestamp.toLocaleTimeString(
											[],
											{
												hour: "2-digit",
												minute: "2-digit",
											}
										)}
									</p>
								</div>
							</div>
						))}

						{/* Loading Indicator */}
						{isLoading && (
							<div className='flex gap-3'>
								<div className='w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center'>
									<SmartToy
										sx={{
											color: "white",
											fontSize: "1.25rem",
										}}
									/>
								</div>
								<div className='bg-gray-100 rounded-2xl p-4'>
									<div className='flex gap-2'>
										<div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
										<div
											className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
											style={{ animationDelay: "0.2s" }}
										></div>
										<div
											className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
											style={{ animationDelay: "0.4s" }}
										></div>
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>

					{/* Input Area */}
					<div className='bg-white rounded-b-3xl shadow-lg p-6'>
						<div className='flex gap-3 items-end'>
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder='Ask me anything...'
								disabled={isLoading}
								rows={1}
								className='flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-400 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed'
							/>
							<button
								onClick={handleSend}
								disabled={!input.trim() || isLoading}
								className='px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105'
							>
								<Send sx={{ fontSize: "1.25rem" }} />
							</button>
						</div>
						<p className='text-xs text-gray-400 mt-2 text-center'>
							Press Enter to send, Shift + Enter for new line
						</p>
					</div>
				</div>
			</div>
		</>
	);
}

export default AIChatPage;
