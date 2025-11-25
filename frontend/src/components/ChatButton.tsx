import IconButton from "@mui/material/IconButton";
import { Chat } from "@mui/icons-material";

import { useNavigate } from "react-router";

function ChatButton() {
	const navigate = useNavigate();
	const handleChatClick = () => {
		navigate("/MessagePage");
	};

	return (
		<>
			<IconButton
				onClick={handleChatClick}
				sx={{
					backgroundColor: "#A855F7",
					color: "white",
					position: "fixed",
					bottom: "2rem",
					right: "2rem",
					height: "50px",
					width: "50px",
					boxShadow: "0 4px 12px rgba(168, 85, 247, 0.4)",
					zIndex: 1000,
					"&:hover": {
						backgroundColor: "#9333EA",
						boxShadow: "0 6px 16px rgba(168, 85, 247, 0.6)",
						transform: "scale(0.95)",
					},
				}}
			>
				<Chat />
			</IconButton>
		</>
	);
}

export default ChatButton;
