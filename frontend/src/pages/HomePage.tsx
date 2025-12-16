import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/useAuthStore";
import type { UserProfile } from "@/types/user";

import Layout from "@/components/Layout";
import ProfileModal from "@/components/ProfileModal";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";

import {
	WavingHand,
	HourglassEmpty,
	Coffee,
	CrisisAlert,
	Favorite,
	FavoriteBorder,
	TrendingUp,
	Check,
	Close,
	Warning,
	ArrowForward,
} from "@mui/icons-material";
import { useFriendStore } from "@/stores/useFriendStore";

const HomePage = () => {
	const { userProfile } = useAuthStore();
	const navigate = useNavigate();

	const handleMatchingClick = () => {
		// Check if user is ready to match
		if (!userProfile?.isReadyToMatch) {
			setMissingFieldsModalType("matching");
			setShowMissingFieldsModal(true);
			return;
		}
		navigate("/MatchingPage");
	};

	const handleVenuesClick = () => {
		if (checkVenueMissingFields()) {
			setMissingFieldsModalType("seaching venue");
			setShowMissingFieldsModal(true);
			return;
		}
		navigate("/VenuesFindingPage");
	};

	const handlePreferencesClick = () => {
		navigate("/PreferencePage");
	};

	const {
		friends,
		receivedFriendRequests,
		sentFriendRequests,
		loadingFriend,
		loadingFriendRequest,
	} = useFriendStore();

	const {
		fetchFriends,
		fetchFriendRequests,
		swipeLeft,
		swipeRight,
		unMatch,
	} = useFriendStore();

	const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(
		null
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showMissingFieldsModal, setShowMissingFieldsModal] = useState(false);
	const [missingFieldsModalType, setMissingFieldsModalType] = useState<
		"seaching venue" | "matching"
	>("matching");

	const handleViewProfile = (profile: UserProfile) => {
		setSelectedProfile(profile);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedProfile(null);
	};

	const handleUnmatch = async () => {
		if (selectedProfile) {
			try {
				await unMatch(selectedProfile.uid);
				handleCloseModal();
			} catch (error) {
				console.error("Failed to unmatch:", error);
			}
		}
	};

	const handleChat = () => {
		if (selectedProfile) {
			// Navigate to chat with this user
			navigate(`/MessagePage?userId=${selectedProfile.uid}`);
			handleCloseModal();
		}
	};

	// Check which fields are missing
	const getMatchingMissingFields = () => {
		const missing: string[] = [];
		if (!userProfile?.age) missing.push("Age");
		if (!userProfile?.interests || userProfile.interests.length === 0)
			missing.push("Interests");
		if (!userProfile?.occupation) missing.push("Occupation");
		if (!userProfile?.location) missing.push("Location");
		if (!userProfile?.workVibe) missing.push("Work Vibe");
		return missing;
	};

	const checkVenueMissingFields = () => {
		return !userProfile?.maxDistanceKm || !userProfile?.location;
	};

	const getVenueMissingFields = () => {
		const missing: string[] = [];
		if (!userProfile?.maxDistanceKm) missing.push("Maximum Distance");
		if (!userProfile?.location) missing.push("Location");
		return missing;
	};

	useEffect(() => {
		const fetchRequest = async () => {
			try {
				await fetchFriends();
				await fetchFriendRequests();
			} catch (error) {
				console.log("Failed to get match requests:", error);
			}
		};

		fetchRequest();
	}, []);

	useEffect(() => {
		console.log("Friends updated:", friends);
		console.log(
			"Received Friend Requests updated:",
			receivedFriendRequests
		);
		console.log("Sent Friend Requests updated:", sentFriendRequests);
	}, [friends, receivedFriendRequests, sentFriendRequests]);

	const handleAcceptRequest = async (requestId: string) => {
		try {
			console.log("Accepting request for ID:", requestId);
			await swipeRight(requestId);
		} catch (error) {
			console.error("Failed to accept request:", error);
		}
	};

	const handleRejectRequest = async (requestId: string) => {
		try {
			await swipeLeft(requestId);
		} catch (error) {
			console.error("Failed to reject request:", error);
		}
	};

	console.log(userProfile);

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
					<div className='grid md:grid-cols-1 lg:grid-cols-2 gap-8 mb-16'>
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

					{/* Matches Section */}
					<div className='grid grid-cols-2 gap-5'>
						{/* Your Matches */}
						<div className='w-full bg-gradient-to-br from-white to-pink-50 rounded-3xl p-10 shadow-md border border-pink-100'>
							<h3 className='text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-8'>
								Your Matches
							</h3>
							{loadingFriend ? (
								<div className='text-center py-12'>
									<div className='w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
									<p className='text-gray-600'>
										Loading friends...
									</p>
								</div>
							) : friends.length > 0 ? (
								<div className='space-y-4 max-h-96 overflow-y-auto'>
									{friends.map((profile) => (
										<div
											key={profile.uid}
											className='flex items-center gap-4 p-4 bg-white rounded-2xl border border-pink-200 hover:shadow-md transition-all'
										>
											<img
												onClick={() =>
													handleViewProfile(profile)
												}
												src={profile.avatarUrl}
												alt={profile.displayName}
												className='w-16 h-16 rounded-full object-cover border-2 border-pink-300 cursor-pointer'
											/>
											<div
												className='flex-1 cursor-pointer'
												onClick={() =>
													handleViewProfile(profile)
												}
											>
												<h4 className='font-semibold text-gray-800 text-lg'>
													{profile.displayName}
												</h4>
												<p className='text-sm text-gray-600'>
													{profile.bio?.substring(
														0,
														50
													) || "No bio available"}
													...
												</p>
												<div className='flex gap-2 mt-2'>
													{profile.interests
														?.slice(0, 3)
														.map((interest, i) => (
															<span
																key={i}
																className='px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs'
															>
																{interest}
															</span>
														))}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className='text-center py-12'>
									<FavoriteBorder
										sx={{
											fontSize: "3rem",
											color: "#ec4899",
											mb: 2,
										}}
									/>
									<p className='text-gray-700 mb-2 text-lg font-medium'>
										No matches yet
									</p>
									<p className='text-base text-gray-500'>
										Complete your profile and set your
										availability to start matching!
									</p>
								</div>
							)}
						</div>

						{/* Pending Match Requests */}
						<div className='w-full bg-gradient-to-br from-white to-pink-50 rounded-3xl p-10 shadow-md border border-pink-100'>
							<h3 className='text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-8'>
								Match Requests
							</h3>

							{loadingFriendRequest ? (
								<div className='text-center py-12'>
									<div className='w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
									<p className='text-gray-600'>
										Loading requests...
									</p>
								</div>
							) : receivedFriendRequests.length > 0 ? (
								<div className='space-y-4 max-h-96 overflow-y-auto'>
									{receivedFriendRequests.map((profile) => (
										<div
											key={profile.uid}
											className='flex items-center gap-4 p-4 bg-white rounded-2xl border border-pink-200 hover:shadow-md transition-all'
										>
											<img
												onClick={() =>
													handleViewProfile(profile)
												}
												src={profile.avatarUrl}
												alt={profile.displayName}
												className='w-16 h-16 rounded-full object-cover border-2 border-pink-300 cursor-pointer'
											/>
											<div
												className='flex-1 cursor-pointer'
												onClick={() =>
													handleViewProfile(profile)
												}
											>
												<h4 className='font-semibold text-gray-800 text-lg'>
													{profile.displayName}
												</h4>
												<p className='text-sm text-gray-600'>
													{profile.bio?.substring(
														0,
														50
													) || "No bio available"}
													...
												</p>
												<div className='flex gap-2 mt-2'>
													{profile.interests
														?.slice(0, 3)
														.map((interest, i) => (
															<span
																key={i}
																className='px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs'
															>
																{interest}
															</span>
														))}
												</div>
											</div>
											<div className='flex gap-2'>
												<button
													onClick={() =>
														handleAcceptRequest(
															profile.uid
														)
													}
													className='p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors'
												>
													<Check />
												</button>
												<button
													onClick={() =>
														handleRejectRequest(
															profile.uid
														)
													}
													className='p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors'
												>
													<Close />
												</button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className='text-center py-12'>
									<HourglassEmpty
										sx={{
											fontSize: "3rem",
											color: "#a855f7",
											mb: 2,
										}}
									/>
									<p className='text-gray-700 mb-2 text-lg font-medium'>
										No pending requests
									</p>
									<p className='text-base text-gray-500'>
										Start matching to receive work date
										requests!
									</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Profile View Modal */}
				<ProfileModal
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					userProfile={selectedProfile}
					onUnmatch={handleUnmatch}
					onChat={handleChat}
					showActions={true}
				/>

				{/* Missing Fields Modal */}
				<Modal
					open={showMissingFieldsModal}
					onClose={() => setShowMissingFieldsModal(false)}
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Sheet
						variant='plain'
						sx={{
							maxWidth: 500,
							width: "90%",
							borderRadius: "xl",
							p: 4,
							boxShadow: "lg",
							position: "relative",
							background: "white",
						}}
					>
						<ModalClose variant='plain' sx={{ m: 1 }} />

						<div className='text-center mb-6'>
							<div className='w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
								<Warning
									sx={{ fontSize: "3rem", color: "white" }}
								/>
							</div>
							<h2 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2'>
								Profile Incomplete
							</h2>
							<p className='text-gray-600'>
								Please complete your profile to start{" "}
								{missingFieldsModalType}
							</p>
						</div>

						<div className='bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6'>
							<h3 className='text-lg font-semibold text-red-800 mb-3 flex items-center gap-2'>
								<Warning sx={{ color: "#991b1b" }} />
								Missing Information:
							</h3>
							<ul className='space-y-2'>
								{(missingFieldsModalType === "matching"
									? getMatchingMissingFields()
									: getVenueMissingFields()
								).map((field, index) => (
									<li
										key={index}
										className='flex items-center gap-2 text-red-700'
									>
										<span className='w-2 h-2 bg-red-500 rounded-full'></span>
										<span className='font-medium'>
											{field}
										</span>
									</li>
								))}
							</ul>
						</div>

						<Button
							onClick={() => {
								setShowMissingFieldsModal(false);
								navigate("/SettingsPage");
							}}
							endDecorator={<ArrowForward />}
							sx={{
								width: "100%",
								background:
									"linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
								color: "white",
								padding: "12px 24px",
								borderRadius: "1rem",
								fontSize: "1rem",
								fontWeight: "600",
								textTransform: "none",
								"&:hover": {
									background:
										"linear-gradient(135deg, #9333ea 0%, #db2777 100%)",
									transform: "translateY(-2px)",
									boxShadow:
										"0 8px 20px rgba(168, 85, 247, 0.4)",
								},
								transition: "all 0.3s ease",
							}}
						>
							Complete Profile Now
						</Button>
					</Sheet>
				</Modal>
			</Layout>
		</div>
	);
};

export default HomePage;
