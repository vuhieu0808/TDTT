import { useEffect, useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import Navbar from "@/components/Navbar";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatDetails from "@/components/chat/ChatDetails";

function MessagePage() {
	const { fetchConversations } = useChatStore();
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	// Fetch conversations on component mount
	useEffect(() => {
		fetchConversations();
	}, []);

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
				<ConversationList />

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
