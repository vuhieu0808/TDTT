import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";
import Layout from "@/components/Layout";
import Navbar from "@/components/Navbar";
import {
	Favorite,
	LocationOn,
	Work,
	Schedule,
	ChatBubble,
	Psychology,
	Close,
	Info,
	FavoriteBorder,
	Clear,
	ArrowBack,
} from "@mui/icons-material";

// Mock potential matches data
const mockMatches = [
	{
		id: 1,
		name: "Sarah Johnson",
		email: "sarah.j@example.com",
		avatarUrl: "https://i.pravatar.cc/400?img=5",
		bio: "Software engineer passionate about clean code and collaborative work. Love coffee chats during breaks!",
		interests: ["Coding", "Coffee", "Music", "Reading", "Travel"],
		workRatio: 60, // 60% work, 40% break
		chatRatio: 40,
		interactionLevel: 50,
		workingMode: "Balanced",
		matchPercentage: 92,
	},
	{
		id: 2,
		name: "Michael Chen",
		email: "mchen@example.com",
		avatarUrl: "https://i.pravatar.cc/400?img=12",
		bio: "Creative designer who thrives in collaborative environments. Always up for brainstorming sessions!",
		interests: ["Design", "Photography", "Art", "Coffee", "Music"],
		workRatio: 50, // 50% work, 50% break
		chatRatio: 50,
		interactionLevel: 80,
		workingMode: "Creative Chat",
		matchPercentage: 85,
	},
	{
		id: 3,
		name: "Emma Davis",
		email: "emma.davis@example.com",
		avatarUrl: "https://i.pravatar.cc/400?img=9",
		bio: "Data scientist focused on deep work with strategic breaks. Prefer quiet focus time with minimal interruptions.",
		interests: ["Data Science", "Machine Learning", "Reading", "Hiking"],
		workRatio: 80, // 80% work, 20% break
		chatRatio: 20,
		interactionLevel: 25,
		workingMode: "Deep Work",
		matchPercentage: 78,
	},
	{
		id: 4,
		name: "Alex Rodriguez",
		email: "alex.r@example.com",
		avatarUrl: "https://i.pravatar.cc/400?img=14",
		bio: "Marketing professional who loves networking and collaborative projects. Let's work and connect!",
		interests: ["Marketing", "Networking", "Travel", "Coffee", "Yoga"],
		workRatio: 65, // 65% work, 35% break
		chatRatio: 35,
		interactionLevel: 65,
		workingMode: "Balanced",
		matchPercentage: 88,
	},
	{
		id: 5,
		name: "Lisa Wang",
		email: "lisa.wang@example.com",
		avatarUrl: "https://i.pravatar.cc/400?img=20",
		bio: "Product manager seeking minimal conversation during focused work sessions. Quick check-ins work best!",
		interests: ["Product Design", "Tech", "Meditation", "Reading"],
		workRatio: 50, // 90% work, 10% break
		chatRatio: 50,
		interactionLevel: 10,
		workingMode: "Quiet Focus",
		matchPercentage: 72,
	},
];

function MatchingPage() {
	const { userProfile } = useAuthStore();
	const navigate = useNavigate();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [animationDirection, setAnimationDirection] = useState<
		"left" | "right" | null
	>(null);

	const currentMatch = mockMatches[currentIndex];
	const hasMoreMatches = currentIndex < mockMatches.length - 1;

	const handleReject = () => {
		if (isAnimating) return;

		setIsAnimating(true);
		setAnimationDirection("left");

		setTimeout(() => {
			console.log("Rejected: ", currentMatch.name);
			if (hasMoreMatches) {
				setCurrentIndex(currentIndex + 1);
			} else {
				setCurrentIndex(0);
			}
			setIsAnimating(false);
			setAnimationDirection(null);
		}, 400);
	};

	const handleAccept = () => {
		if (isAnimating) return;

		setIsAnimating(true);
		setAnimationDirection("right");

		setTimeout(() => {
			// Here you would save the match to backend
			console.log("Matched with:", currentMatch.name);

			if (hasMoreMatches) {
				setCurrentIndex(currentIndex + 1);
			} else {
				setCurrentIndex(0);
			}
			setIsAnimating(false);
			setAnimationDirection(null);
		}, 400);
	};

	if (!currentMatch) {
		return (
			<>
				<Navbar />
				<div className='flex items-center justify-center min-h-[90vh]'>
					<div className='text-center'>
						<h2 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4'>
							No More Matches!
						</h2>
						<p className='text-gray-600 mb-6'>
							You've reviewed all available matches. Check back
							later for more!
						</p>
						<button
							onClick={() => navigate("/")}
							className='px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all'
						>
							Back to Home
						</button>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<Navbar />
			{/* Main Container */}
			<div className='flex flex-col items-center justify-center h-[calc(100vh-64px)] p-4 gap-6 overflow-hidden'>
				{/* User Card */}
				<div
					className={`w-full max-w-5xl h-[73vh] bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] border border-gray-200 overflow-hidden flex transition-all duration-400 ${
						isAnimating
							? animationDirection === "left"
								? "opacity-0 -translate-x-full rotate-[-12deg]"
								: "opacity-0 translate-x-full rotate-[12deg]"
							: "opacity-100 translate-x-0 rotate-0"
					}`}
				>
					{/* Left Side - User Picture */}
					<div className='w-2/5 relative bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center'>
						{/* Profile Image */}
						<div className='relative'>
							<div className='w-80 h-80 rounded-full overflow-hidden border-8 border-white shadow-2xl'>
								<img
									src={currentMatch.avatarUrl}
									alt={currentMatch.name}
									className='w-full h-full object-cover'
								/>
							</div>

							{/* Online Status Indicator */}
							<div className='absolute bottom-6 right-6 w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-lg'></div>
						</div>

						{/* Decorative Elements */}
						<div className='absolute top-10 right-10 w-20 h-20 bg-purple-300/30 rounded-full blur-xl'></div>
						<div className='absolute bottom-10 left-10 w-32 h-32 bg-pink-300/30 rounded-full blur-xl'></div>
					</div>

					{/* Right Side - User Information */}
					<div className='w-3/5 p-8 overflow-y-auto custom-scrollbar'>
						{/* Header */}
						<div className='mb-6'>
							<div className='flex items-center justify-between mb-2'>
								<h1 className='text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
									{currentMatch.name}
								</h1>
								<div className='flex gap-2'>
									<button className='p-2 hover:bg-purple-50 rounded-full transition-colors'>
										<Info className='text-purple-600' />
									</button>
								</div>
							</div>
							<p className='text-gray-600 flex items-center gap-2'>
								<LocationOn
									sx={{
										fontSize: "1.25rem",
										color: "#ec4899",
									}}
								/>
								{currentMatch.email}
							</p>
						</div>

						{/* Bio */}
						<div className='mb-6 p-4 bg-purple-50 rounded-2xl'>
							<p className='text-gray-700 text-sm leading-relaxed'>
								{currentMatch.bio}
							</p>
						</div>

						{/* Interests Section */}
						<div className='mb-6'>
							<div className='flex items-center gap-2 mb-3'>
								<Favorite
									sx={{
										fontSize: "1.5rem",
										color: "#a855f7",
									}}
								/>
								<h2 className='text-xl font-bold text-gray-800'>
									Interests
								</h2>
							</div>
							<div className='flex flex-wrap gap-2'>
								{currentMatch.interests.map(
									(interest, index) => (
										<span
											key={index}
											className='px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200'
										>
											{interest}
										</span>
									)
								)}
							</div>
						</div>

						{/* Working Mode */}
						<div className='mb-6'>
							<div className='flex items-center gap-2 mb-3'>
								<Psychology
									sx={{
										fontSize: "1.5rem",
										color: "#a855f7",
									}}
								/>
								<h2 className='text-xl font-bold text-gray-800'>
									Working Mode
								</h2>
							</div>
							<div className='p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white'>
								<p className='text-lg font-semibold'>
									{currentMatch.workingMode}
								</p>
								<p className='text-sm opacity-90 mt-1'>
									{currentMatch.workingMode === "Balanced" &&
										"Perfect balance of productivity and collaboration"}
									{currentMatch.workingMode ===
										"Creative Chat" &&
										"Collaborative brainstorming and idea sharing"}
									{currentMatch.workingMode === "Deep Work" &&
										"Focused work with strategic breaks"}
									{currentMatch.workingMode ===
										"Quiet Focus" &&
										"Minimal conversation, maximum productivity"}
								</p>
							</div>
						</div>

						{/* Work/Chat Ratio */}
						<div className='mb-6'>
							<div className='flex items-center gap-2 mb-3'>
								<Schedule
									sx={{
										fontSize: "1.5rem",
										color: "#a855f7",
									}}
								/>
								<h2 className='text-xl font-bold text-gray-800'>
									Work/Chat Balance
								</h2>
							</div>

							<div className='p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200'>
								{/* Percentage Display */}
								<div className='flex items-center justify-between mb-3'>
									<div className='flex items-center gap-2'>
										<Work
											sx={{
												fontSize: "1.25rem",
												color: "#a855f7",
											}}
										/>
										<span className='text-lg font-bold text-purple-600'>
											{currentMatch.workRatio}% Work
										</span>
									</div>
									<div className='flex items-center gap-2'>
										<ChatBubble
											sx={{
												fontSize: "1.25rem",
												color: "#ec4899",
											}}
										/>
										<span className='text-lg font-bold text-pink-600'>
											{currentMatch.chatRatio}% Chat
										</span>
									</div>
								</div>

								{/* Progress Bar */}
								<div className='w-full bg-gray-200 rounded-full h-4 overflow-hidden flex'>
									<div
										className='bg-gradient-to-r from-purple-500 to-purple-400 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500'
										style={{
											width: `${currentMatch.workRatio}%`,
										}}
									>
										{currentMatch.workRatio > 20 && "Work"}
									</div>
									<div
										className='bg-gradient-to-r from-pink-400 to-pink-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500'
										style={{
											width: `${currentMatch.chatRatio}%`,
										}}
									>
										{currentMatch.chatRatio > 20 && "Chat"}
									</div>
								</div>
							</div>

							{/* Interaction Level */}
							<div className='mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200'>
								<div className='flex items-center justify-between mb-2'>
									<p className='text-sm font-semibold text-gray-700'>
										Interaction Level
									</p>
									<p className='text-lg font-bold text-purple-600'>
										{currentMatch.interactionLevel}%
									</p>
								</div>
								<div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
									<div
										className='h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500'
										style={{
											width: `${currentMatch.interactionLevel}%`,
										}}
									></div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Action Buttons - Below Card */}
				<div className='flex items-center gap-6'>
					{/* Reject Button */}
					<button
						onClick={handleReject}
						disabled={isAnimating}
						className='p-5 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-full shadow-xl transition-all hover:scale-110 group'
					>
						<Clear
							sx={{
								fontSize: "2.5rem",
								color: "#ef4444",
								transition: "all 0.3s",
							}}
							className='group-hover:rotate-90'
						/>
					</button>

					{/* Accept Button */}
					<button
						onClick={handleAccept}
						disabled={isAnimating}
						className='p-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 rounded-full shadow-xl transition-all hover:scale-110 group'
					>
						<Favorite
							sx={{
								fontSize: "2.5rem",
								color: "white",
								transition: "all 0.3s",
							}}
							className='group-hover:scale-125'
						/>
					</button>
				</div>
			</div>
		</>
	);
}

export default MatchingPage;
