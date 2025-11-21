import { useState } from "react";

import Layout from "@/components/Layout";

function MessagePage() {
	return (
		<>
			<Layout>
				{/* Main Layout */}
				<div className='grid grid-cols-[1fr_2fr_1fr] gap-5'>
					{/* Left Side - Chats List */}
					<div className='text-left pl-5'>
						<h1>Chats</h1>
					</div>

					{/* Middle - Main Chat Display */}
					<div className='text-center'>
						<h1>place holder</h1>
					</div>

					{/* Right Side - Chat's Detail */}
					<div className='text-right pr-5'>
						<h1>place holder</h1>
					</div>
				</div>
			</Layout>
		</>
	);
}

export default MessagePage;
