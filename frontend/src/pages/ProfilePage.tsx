import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";
import {
	Person,
	Email,
	Cake,
	LocationOn,
	Edit,
	CheckCircle,
	Warning,
	Tune,
} from "@mui/icons-material";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";

import Layout from "@/components/Layout";

function ProfilePage() {
	const { userProfile } = useAuthStore();
	const navigate = useNavigate();

	if (!userProfile) {
		return (
			<Layout>
				<div className='flex items-center justify-center h-96'>
					<p className='text-gray-500'>Loading profile...</p>
				</div>
			</Layout>
		);
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "online":
				return "bg-green-500";
			case "working":
				return "bg-purple-500";
			case "break":
				return "bg-yellow-500";
			default:
				return "bg-gray-400";
		}
	};

	const hasIncompletePreferences = () => {
		if (!userProfile) return false;
		const missingFields: string[] = [];
		if (!userProfile.interests || userProfile.interests.length === 0) {
			missingFields.push("interests");
		}
		if (!userProfile.workVibe) {
			missingFields.push("work vibe");
		}
		return missingFields;
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "Not set";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const missingPreferences = hasIncompletePreferences();

	return (
		<Layout>
			<div className='max-w-5xl mx-auto'>
				{/* Recommendation Banner */}
				{missingPreferences && missingPreferences.length > 0 && (
					<div className='bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-4 mb-4 shadow-sm'>
						<div className='flex items-start gap-3'>
							<Warning
								sx={{ color: "#f59e0b", fontSize: "1.5rem" }}
							/>
							<div className='flex-1'>
								<h3 className='font-bold text-gray-900 mb-1'>
									Complete Your Work Preferences
								</h3>
								<p className='text-sm text-gray-700 mb-3'>
									You're missing:{" "}
									<span className='font-semibold'>
										{missingPreferences.join(", ")}
									</span>
									. Set up your work preferences to start
									matching with work partners!
								</p>
								<Button
									onClick={() => navigate("/PreferencePage")}
									startDecorator={<Tune />}
									size='sm'
									sx={{
										backgroundColor: "#f59e0b",
										"&:hover": {
											backgroundColor: "#d97706",
										},
									}}
								>
									Set Up Work Preferences
								</Button>
							</div>
						</div>
					</div>
				)}
				{missingPreferences && missingPreferences.length === 0 && (
					<div className='bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 mb-4 shadow-sm'>
						<div className='flex items-center gap-3'>
							<CheckCircle
								sx={{ color: "#10b981", fontSize: "1.5rem" }}
							/>
							<div>
								<h3 className='font-bold text-gray-900'>
									Profile Complete! 🎉
								</h3>
								<p className='text-sm text-gray-700'>
									Your profile and work preferences are all
									set up. You're ready to match!
								</p>
							</div>
						</div>
					</div>
				)}
				{/* Cover Photo and Profile Picture */}
				<div className='flex flex-col gap-10 relative bg-white rounded-lg shadow-sm overflow-hidden mb-4'>
					{/* Cover Image */}
					<div
						className='h-48 bg-gradient-to-r from-purple-500 to-pink-500'
						style={{
							backgroundImage: userProfile.coverUrl
								? `url(${userProfile.coverUrl})`
								: undefined,
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}
					></div>

					{/* Profile Section */}
					<div className='px-6 py-6'>
						<div className='flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-end -mt-16 sm:-mt-20'>
							{/* Avatar */}
							<div className='relative flex-shrink-0'>
								<img
									src={
										userProfile.avatarUrl ||
										"https://via.placeholder.com/160"
									}
									alt={userProfile.displayName}
									className='w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white object-cover'
								/>
								<div
									className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(
										userProfile.status
									)}`}
								></div>
							</div>

							{/* Name and Basic Info */}
							<div className='flex-1 sm:pb-2'>
								<div className='pt-5'>
									<h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
										{userProfile.displayName}
									</h1>
								</div>
								<div className='min-h-[1.75rem] mt-1'>
									<p className='text-gray-600'>
										{userProfile.occupation || "\u00A0"}
									</p>
								</div>
								<div className='min-h-[1.5rem] mt-1'>
									<p className='text-gray-500 text-sm flex items-center gap-1'>
										{userProfile.location ? (
											<>
												<LocationOn
													sx={{ fontSize: "1rem" }}
												/>
												Lat: {userProfile.location.lat},
												Lng: {userProfile.location.lng}
											</>
										) : (
											"\u00A0"
										)}
									</p>
								</div>
							</div>

							{/* Edit Button */}
							<Button
								onClick={() => navigate("/SettingsPage")}
								startDecorator={<Edit />}
								sx={{
									backgroundColor: "#a855f7",
									"&:hover": { backgroundColor: "#9333ea" },
								}}
							>
								Edit Profile
							</Button>
						</div>
					</div>
				</div>

				{/* About Section */}
				<div className='bg-white rounded-lg shadow-sm p-6 mb-4'>
					<h2 className='text-xl font-bold text-gray-900 mb-4'>
						About
					</h2>
					{userProfile.bio ? (
						<p className='text-gray-700 leading-relaxed'>
							{userProfile.bio}
						</p>
					) : (
						<p className='text-gray-400 italic'>No bio added yet</p>
					)}
				</div>

				{/* Details Section */}
				<div className='bg-white rounded-lg shadow-sm p-6 mb-4'>
					<h2 className='text-xl font-bold text-gray-900 mb-4'>
						Personal Information
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{/* Email */}
						<div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
							<Email className='text-purple-600' />
							<div>
								<p className='text-sm text-gray-500'>Email</p>
								<p className='font-medium text-gray-900'>
									{userProfile.email}
								</p>
							</div>
						</div>

						{/* Age */}
						<div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
							<Person className='text-purple-600' />
							<div>
								<p className='text-sm text-gray-500'>Age</p>
								<p className='font-medium text-gray-900'>
									{userProfile.age || "Not set"}
								</p>
							</div>
						</div>

						{/* Date of Birth */}
						<div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
							<Cake className='text-purple-600' />
							<div>
								<p className='text-sm text-gray-500'>
									Date of Birth
								</p>
								<p className='font-medium text-gray-900'>
									{formatDate(userProfile.dateOfBirth)}
								</p>
							</div>
						</div>

						{/* Gender */}
						<div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
							<Person className='text-purple-600' />
							<div>
								<p className='text-sm text-gray-500'>Gender</p>
								<p className='font-medium text-gray-900 capitalize'>
									{userProfile.gender || "Not set"}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Work Preferences */}
				<div className='bg-white rounded-lg shadow-sm p-6 mb-4'>
					<h2 className='text-xl font-bold text-gray-900 mb-4'>
						Work Preferences
					</h2>
					<div className='space-y-4'>
						{/* Work Vibe */}
						{userProfile.workVibe && (
							<div>
								<p className='text-sm text-gray-500 mb-2 '>
									Work Vibe
								</p>
								<div className='capitalize'>
									<Chip
										sx={{
											backgroundColor: "#f3e8ff",
											color: "#7e22ce",
											fontWeight: "500",
										}}
									>
										{typeof userProfile.workVibe ===
										"object"
											? JSON.stringify(
													userProfile.workVibe
											  )
											: userProfile.workVibe}
									</Chip>
								</div>
							</div>
						)}

						{/* Occupation Description */}
						{userProfile.occupationDescription && (
							<div>
								<p className='text-sm text-gray-500 mb-2'>
									Occupation Description
								</p>
								<p className='text-gray-700'>
									{userProfile.occupationDescription}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Interests Section */}
				{userProfile.interests && userProfile.interests.length > 0 && (
					<div className='bg-white rounded-lg shadow-sm p-6 mb-4'>
						<h2 className='text-xl font-bold text-gray-900 mb-4'>
							Interests
						</h2>
						<div className='flex flex-wrap gap-2'>
							{userProfile.interests.map((interest, index) => (
								<Chip
									key={index}
									sx={{
										backgroundColor: "#f3e8ff",
										color: "#7e22ce",
										fontWeight: "500",
									}}
								>
									{interest}
								</Chip>
							))}
						</div>
					</div>
				)}
			</div>
		</Layout>
	);
}

export default ProfilePage;
