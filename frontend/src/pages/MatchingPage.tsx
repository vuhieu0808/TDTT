import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";
import Layout from "@/components/Layout";
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
		workDuration: 3,
		chatDuration: 1.5,
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
		workDuration: 2,
		chatDuration: 2,
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
		workDuration: 4,
		chatDuration: 0.5,
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
		workDuration: 2.5,
		chatDuration: 1.5,
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
		workDuration: 4,
		chatDuration: 0.5,
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
			if (hasMoreMatches) {
				setCurrentIndex(currentIndex + 1);
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
			}
			setIsAnimating(false);
			setAnimationDirection(null);
		}, 400);
	};

	const handleUndo = () => {
		if (currentIndex > 0 && !isAnimating) {
			setCurrentIndex(currentIndex - 1);
		}
	};

	if (!currentMatch) {
		return (
			<Layout>
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
			</Layout>
		);
	}

	return (
		<>
			<Layout>
				{/* Main Container */}
				<div className='flex items-center justify-center min-h-[90vh] p-4'>
					{/* User Card */}
					<div
						className={`w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] border border-gray-200 overflow-hidden flex transition-all duration-400 ${
							isAnimating
								? animationDirection === "left"
									? "opacity-0 -translate-x-full rotate-[-12deg]"
									: "opacity-0 translate-x-full rotate-[12deg]"
								: "opacity-100 translate-x-0 rotate-0"
						}`}
					>
						{/* Left Side - User Picture */}
						<div className='w-2/5 relative bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center'>
							{/* Match Percentage Badge */}
							<div className='absolute top-6 right-6 z-10'>
								<div className='px-4 py-2 bg-white rounded-full shadow-lg'>
									<span className='text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
										{currentMatch.matchPercentage}% Match
									</span>
								</div>
							</div>

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
										{currentMatch.workingMode ===
											"Balanced" &&
											"Perfect balance of productivity and collaboration"}
										{currentMatch.workingMode ===
											"Creative Chat" &&
											"Collaborative brainstorming and idea sharing"}
										{currentMatch.workingMode ===
											"Deep Work" &&
											"Focused work with strategic breaks"}
										{currentMatch.workingMode ===
											"Quiet Focus" &&
											"Minimal conversation, maximum productivity"}
									</p>
								</div>
							</div>

							{/* Work Session Details */}
							<div className='mb-6'>
								<div className='flex items-center gap-2 mb-3'>
									<Schedule
										sx={{
											fontSize: "1.5rem",
											color: "#a855f7",
										}}
									/>
									<h2 className='text-xl font-bold text-gray-800'>
										Session Preferences
									</h2>
								</div>

								<div className='grid grid-cols-2 gap-4'>
									{/* Work Duration */}
									<div className='p-4 bg-purple-50 rounded-2xl border border-purple-200'>
										<div className='flex items-center gap-2 mb-2'>
											<Work
												sx={{
													fontSize: "1.25rem",
													color: "#a855f7",
												}}
											/>
											<p className='text-sm font-semibold text-gray-700'>
												Work Duration
											</p>
										</div>
										<p className='text-2xl font-bold text-purple-600'>
											{currentMatch.workDuration}h
										</p>
									</div>

									{/* Chat Duration */}
									<div className='p-4 bg-pink-50 rounded-2xl border border-pink-200'>
										<div className='flex items-center gap-2 mb-2'>
											<ChatBubble
												sx={{
													fontSize: "1.25rem",
													color: "#ec4899",
												}}
											/>
											<p className='text-sm font-semibold text-gray-700'>
												Chat Duration
											</p>
										</div>
										<p className='text-2xl font-bold text-pink-600'>
											{currentMatch.chatDuration}h
										</p>
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
				</div>

				{/* Action Buttons - Fixed at Bottom */}
				<div className='fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6 z-20'>
					{/* Undo Button */}
					<button
						onClick={handleUndo}
						disabled={currentIndex === 0}
						className='p-4 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:opacity-50 rounded-full shadow-lg transition-all hover:scale-110 disabled:hover:scale-100'
					>
						<ArrowBack
							sx={{ fontSize: "1.5rem", color: "#6b7280" }}
						/>
					</button>

					{/* Reject Button */}
					<button
						onClick={handleReject}
						disabled={isAnimating}
						className='p-6 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-full shadow-xl transition-all hover:scale-110 group'
					>
						<Clear
							sx={{
								fontSize: "3rem",
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
						className='p-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 rounded-full shadow-xl transition-all hover:scale-110 group'
					>
						<Favorite
							sx={{
								fontSize: "3rem",
								color: "white",
								transition: "all 0.3s",
							}}
							className='group-hover:scale-125'
						/>
					</button>

					{/* Counter */}
					<div className='px-6 py-3 bg-white rounded-full shadow-lg'>
						<span className='text-sm font-bold text-gray-700'>
							{currentIndex + 1} / {mockMatches.length}
						</span>
					</div>
				</div>
			</Layout>
		</>
	);
}

export default MatchingPage;
