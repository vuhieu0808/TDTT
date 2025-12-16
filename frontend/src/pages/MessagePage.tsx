import { useEffect, useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import Navbar from "@/components/Navbar";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatDetails from "@/components/chat/ChatDetails";
import LlmSuggestModal from "@/components/LlmSuggestModal";
import { Button } from "@mui/joy";
import { Assistant } from "@mui/icons-material";

function MessagePage() {
	const { fetchConversations, activeConversationId } = useChatStore();
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [isLlmSuggestOpen, setIsLlmSuggestOpen] = useState(false);

	// Fetch conversations on component mount
	useEffect(() => {
		fetchConversations();
	}, []);

	const handleLlmSuggestClick = () => {
		setIsLlmSuggestOpen(true);
	};

	const handleCloseLlmSuggest = () => {
		setIsLlmSuggestOpen(false);
	};

	return (
		<>
			<Navbar />
			{/* Main Layout */}
			<div
				className={`grid h-[calc(100vh-80px)] transition-all duration-300 ${
					isDetailOpen
						? "grid-cols-[0.5fr_1.5fr_0.5fr]"
						: "grid-cols-[0.5fr_2fr]"
				}`}
			>
				{/* Left Side - Conversations List */}
				<div className='flex flex-col h-full'>
					<div className='flex-1'>
						<ConversationList />
					</div>
					{/* LLM Suggest Modal Button */}
					<div className='py-5 px-5 border-t border-gray-200 flex justify-left'>
						<Button
							variant='solid'
							onClick={handleLlmSuggestClick}
							className='rounded-full'
						>
							<Assistant className='mr-2' />
							Chat Suggestion
						</Button>
					</div>
					{/* LLM Suggest Modal */}
					<LlmSuggestModal
						isOpen={isLlmSuggestOpen}
						onClose={handleCloseLlmSuggest}
						conversationId={activeConversationId || "default"}
					></LlmSuggestModal>
				</div>

				{/* Middle - Main Chat Display */}
				<ChatWindow
					onToggleDetails={() => setIsDetailOpen(!isDetailOpen)}
				/>

				{/* Right Side - Chat's Detail Tab */}
				{isDetailOpen && (
					<ChatDetails onClose={() => setIsDetailOpen(false)} />
				)}
			</div>
		</>
	);
}

export default MessagePage;
