import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";

import ChatButton from "@/components/ChatButton";

import Layout from "@/components/Layout";
import Button from "@mui/joy/Button";

import {
	WavingHand,
	CalendarToday,
	Coffee,
	CrisisAlert,
	Favorite,
	TrendingUp,
} from "@mui/icons-material";

const HomePage = () => {
	const { userProfile } = useAuthStore();
	const navigate = useNavigate();

	const handleScheduleClick = () => {
		navigate("/SchedulePage");
	};

	const handleMatchingClick = () => {
		navigate("/MatchingPage");
	};

	const handleVenuesClick = () => {
		navigate("/VenuesFindingPage");
	};

	const handlePreferencesClick = () => {
		navigate("/PreferencePage");
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 to-purple-50'>
			<Layout>
				{/* Hero Section */}
				<div className='max-w-7xl mx-auto px-6 py-12'>
					<div className='text-center mb-12'>
						<h2 className='text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3'>
							Welcome back, {userProfile?.displayName}!
							<WavingHand
								sx={{
									color: "#ec4899",
									fontSize: "3rem",
									animation: "wave 1s ease-in-out infinite",
									"@keyframes wave": {
										"0%, 100%": {
											transform: "rotate(0deg)",
										},
										"25%": { transform: "rotate(20deg)" },
										"75%": { transform: "rotate(-20deg)" },
									},
								}}
							/>
						</h2>
						<p className='text-xl text-gray-700 mb-2 font-medium'>
							Find your type, while you type
						</p>
						<p className='text-base text-gray-500'>
							Balance work productivity and emotional connection
						</p>
					</div>

					{/* Find Match Button - Enhanced */}
					<div className='flex justify-center mb-16'>
						<div className='relative group'>
							{/* Glow effect background */}
							<div className='absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse'></div>

							<Button
								onClick={handleMatchingClick}
								startDecorator={
									<Favorite sx={{ fontSize: "2rem" }} />
								}
								endDecorator={
									<TrendingUp sx={{ fontSize: "1.5rem" }} />
								}
								sx={{
									position: "relative",
									background:
										"linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
									fontSize: {
										xs: "1.5rem",
										sm: "2rem",
										md: "2.5rem",
									},
									fontWeight: "bold",
									color: "white",
									padding: {
										xs: "1.5rem 3rem",
										sm: "2rem 4rem",
										md: "2.5rem 5rem",
									},
									borderRadius: "2rem",
									textTransform: "none",
									border: "2px solid rgba(255, 255, 255, 0.2)",
									boxShadow:
										"0 10px 40px rgba(236, 72, 153, 0.3)",
									"&:hover": {
										background:
											"linear-gradient(135deg, #db2777 0%, #9333ea 100%)",
										transform:
											"translateY(-4px) scale(1.02)",
										boxShadow:
											"0 20px 60px rgba(236, 72, 153, 0.5)",
									},
									transition: "all 0.3s ease",
								}}
							>
								Find Your Match
							</Button>
						</div>
					</div>

					{/* Feature Cards */}
					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
						{/* Availability Matching */}
						<div className='group bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-2'>
							<div className='w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg'>
								<CalendarToday
									sx={{
										color: "white",
										fontSize: "2rem",
									}}
								/>
							</div>
							<h3 className='text-2xl font-bold text-gray-900 mb-3 text-center'>
								Set Availability
							</h3>
							<p className='text-base text-gray-600 mb-8 text-center flex-grow leading-relaxed'>
								Sync your schedule for perfect work-date
								matching
							</p>
							<Button
								onClick={handleScheduleClick}
								sx={{
									width: "100%",
									background:
										"linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
									color: "white",
									textTransform: "none",
									padding: "12px 24px",
									borderRadius: "1rem",
									fontSize: "1rem",
									fontWeight: "600",
									"&:hover": {
										background:
											"linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)",
										transform: "translateY(-2px)",
										boxShadow:
											"0 8px 20px rgba(168, 85, 247, 0.4)",
									},
									transition: "all 0.3s ease",
								}}
							>
								Update Schedule
							</Button>
						</div>

						{/* Coffee Shop Finder */}
						<div className='group bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-2'>
							<div className='w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg'>
								<Coffee
									sx={{
										color: "white",
										fontSize: "2rem",
									}}
								/>
							</div>
							<h3 className='text-2xl font-bold text-gray-900 mb-3 text-center'>
								Find Venues
							</h3>
							<p className='text-base text-gray-600 mb-8 text-center flex-grow leading-relaxed'>
								Discover work-friendly spots with honest reviews
							</p>
							<Button
								onClick={handleVenuesClick}
								sx={{
									width: "100%",
									background:
										"linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
									color: "white",
									textTransform: "none",
									padding: "12px 24px",
									borderRadius: "1rem",
									fontSize: "1rem",
									fontWeight: "600",
									"&:hover": {
										background:
											"linear-gradient(135deg, #d97706 0%, #b45309 100%)",
										transform: "translateY(-2px)",
										boxShadow:
											"0 8px 20px rgba(245, 158, 11, 0.4)",
									},
									transition: "all 0.3s ease",
								}}
							>
								Browse Cafes
							</Button>
						</div>

						{/* Work Vibe Preferences */}
						<div className='group bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-2'>
							<div className='w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg'>
								<CrisisAlert
									sx={{
										color: "white",
										fontSize: "2rem",
									}}
								/>
							</div>
							<h3 className='text-2xl font-bold text-gray-900 mb-3 text-center'>
								Work Vibe
							</h3>
							<p className='text-base text-gray-600 mb-8 text-center flex-grow leading-relaxed'>
								Set your ideal work session preferences
							</p>
							<Button
								onClick={handlePreferencesClick}
								sx={{
									width: "100%",
									background:
										"linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
									color: "white",
									textTransform: "none",
									padding: "12px 24px",
									borderRadius: "1rem",
									fontSize: "1rem",
									fontWeight: "600",
									"&:hover": {
										background:
											"linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
										transform: "translateY(-2px)",
										boxShadow:
											"0 8px 20px rgba(59, 130, 246, 0.4)",
									},
									transition: "all 0.3s ease",
								}}
							>
								Customize Vibe
							</Button>
						</div>
					</div>

					{/* Active Sessions / Matches Section */}
					<div className='flex flex-row'>
						{/* Your Matches */}
						<div className='w-full bg-gradient-to-br from-white to-pink-50 rounded-3xl p-10 shadow-md border border-pink-100'>
							<h3 className='text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-8'>
								Your Matches
							</h3>
							<div className='text-center py-12'>
								<span className='text-7xl mb-6 block filter drop-shadow-lg'>
									💝
								</span>
								<p className='text-gray-700 mb-2 text-lg font-medium'>
									No matches yet
								</p>
								<p className='text-base text-gray-500'>
									Complete your profile and set your
									availability to start matching!
								</p>
							</div>
						</div>
					</div>
				</div>
				<ChatButton />
			</Layout>
		</div>
	);
};

export default HomePage;
