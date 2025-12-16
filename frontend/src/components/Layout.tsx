import Navbar from "@/components/Navbar";
import ChatButton from "@/components/ChatButton";

import Box from "@mui/joy/Box";
import { type ReactNode } from "react";

interface LayoutProps {
	children: ReactNode;
}

function Layout({ children }: LayoutProps) {
	return (
		<>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					width: "100%",
					minHeight: "100vh",
				}}
			>
				<Navbar />
				<Box sx={{ flexGrow: 1 }}>{children}</Box>
				<ChatButton />
			</Box>
		</>
	);
}

export default Layout;
