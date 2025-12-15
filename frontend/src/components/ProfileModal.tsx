import { useNavigate } from "react-router";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import Chip from "@mui/joy/Chip";
import Button from "@mui/joy/Button";
import {
	Person,
	Email,
	Cake,
	LocationOn,
	Chat,
	PersonRemove,
} from "@mui/icons-material";
import type { UserProfile } from "@/types/user";

interface ProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	userProfile: UserProfile | null;
	onUnmatch?: () => void;
	onChat?: () => void;
	showActions?: boolean;
}

function ProfileModal({
	isOpen,
	onClose,
	userProfile,
	onUnmatch,
	onChat,
	showActions = true,
}: ProfileModalProps) {
	const formatDate = (dateString?: string) => {
		if (!dateString) return "Not set";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<Modal
			open={isOpen}
			onClose={onClose}
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Sheet
				variant='plain'
				sx={{
					maxWidth: 800,
					width: "90%",
					maxHeight: "90vh",
					overflowY: "auto",
					borderRadius: "lg",
					p: 0,
					boxShadow: "lg",
					border: "none",
					outline: "none",
				}}
			>
				<ModalClose />
				{userProfile && (
					<div>
						{/* Cover Photo and Profile Picture */}
						<div className='relative'>
							<div
								className='h-32 bg-gradient-to-r from-purple-500 to-pink-500'
								style={{
									backgroundImage: userProfile.coverUrl
										? `url(${userProfile.coverUrl})`
										: undefined,
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}
							></div>

							<div className='px-6 pb-4'>
								<div className='flex flex-col items-center -mt-12'>
									<img
										src={
											userProfile.avatarUrl ||
											"https://via.placeholder.com/120"
										}
										alt={userProfile.displayName}
										className='w-24 h-24 rounded-full border-4 border-white object-cover'
									/>
									<h2 className='text-2xl font-bold text-gray-900 mt-2'>
										{userProfile.displayName}
									</h2>
									{userProfile.occupation && (
										<p className='text-gray-600 mt-1'>
											{userProfile.occupation}
										</p>
									)}
									{userProfile.location && (
										<p className='text-gray-500 text-sm mt-1 flex items-center gap-1'>
											<LocationOn
												sx={{ fontSize: "1rem" }}
											/>
											Lat: {userProfile.location.lat},
											Lng: {userProfile.location.lng}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* About Section */}
						<div className='px-6 py-4 border-t border-gray-100'>
							<h3 className='text-lg font-bold text-gray-900 mb-2'>
								About
							</h3>
							{userProfile.bio ? (
								<p className='text-gray-700 leading-relaxed'>
									{userProfile.bio}
								</p>
							) : (
								<p className='text-gray-400 italic'>
									No bio added yet
								</p>
							)}
						</div>

						{/* Personal Information */}
						<div className='px-6 py-4 border-t border-gray-100'>
							<h3 className='text-lg font-bold text-gray-900 mb-3'>
								Personal Information
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
								<div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
									<Email
										className='text-purple-600'
										sx={{ fontSize: "1.25rem" }}
									/>
									<div>
										<p className='text-xs text-gray-500'>
											Email
										</p>
										<p className='font-medium text-gray-900 text-sm'>
											{userProfile.email}
										</p>
									</div>
								</div>
								<div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
									<Person
										className='text-purple-600'
										sx={{ fontSize: "1.25rem" }}
									/>
									<div>
										<p className='text-xs text-gray-500'>
											Age
										</p>
										<p className='font-medium text-gray-900 text-sm'>
											{userProfile.age || "Not set"}
										</p>
									</div>
								</div>
								<div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
									<Cake
										className='text-purple-600'
										sx={{ fontSize: "1.25rem" }}
									/>
									<div>
										<p className='text-xs text-gray-500'>
											Date of Birth
										</p>
										<p className='font-medium text-gray-900 text-sm'>
											{formatDate(
												userProfile.dateOfBirth
											)}
										</p>
									</div>
								</div>
								<div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
									<Person
										className='text-purple-600'
										sx={{ fontSize: "1.25rem" }}
									/>
									<div>
										<p className='text-xs text-gray-500'>
											Gender
										</p>
										<p className='font-medium text-gray-900 text-sm capitalize'>
											{userProfile.gender || "Not set"}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Work Preferences */}
						{userProfile.occupationDescription && (
							<div className='px-6 py-4 border-t border-gray-100'>
								<h3 className='text-lg font-bold text-gray-900 mb-3'>
									Work Preferences
								</h3>
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
						)}

						{/* Interests */}
						{userProfile.interests &&
							userProfile.interests.length > 0 && (
								<div className='px-6 py-4 border-t border-gray-100'>
									<h3 className='text-lg font-bold text-gray-900 mb-3'>
										Interests
									</h3>
									<div className='flex flex-wrap gap-2 capitalize'>
										{userProfile.interests.map(
											(interest, index) => (
												<Chip
													key={index}
													size='md'
													sx={{
														backgroundColor:
															"#f3e8ff",
														color: "#7e22ce",
														fontWeight: "500",
													}}
												>
													{interest}
												</Chip>
											)
										)}
									</div>
								</div>
							)}

						{/* Work Vibe */}
						{userProfile.workVibe && (
							<div className='px-6 py-4 border-t border-gray-100'>
								<h3 className='text-lg font-bold text-gray-900 mb-3'>
									Work Vibe
								</h3>
								<div className='flex flex-wrap gap-2 capitalize'>
									<Chip
										sx={{
											backgroundColor: "#f3e8ff",
											color: "#7e22ce",
											fontWeight: "500",
										}}
									>
										{userProfile.workVibe}
									</Chip>
								</div>
							</div>
						)}

						{/* Action Buttons */}
						{showActions && (
							<div className='px-6 py-4 border-t border-gray-100 flex gap-3'>
								{onUnmatch && (
									<Button
										onClick={onUnmatch}
										startDecorator={<PersonRemove />}
										variant='outlined'
										color='danger'
										fullWidth
										sx={{
											borderRadius: "0.75rem",
											py: 1.5,
										}}
									>
										Unmatch
									</Button>
								)}
								{onChat && (
									<Button
										onClick={onChat}
										startDecorator={<Chat />}
										fullWidth
										sx={{
											backgroundColor: "#a855f7",
											borderRadius: "0.75rem",
											py: 1.5,
											"&:hover": {
												backgroundColor: "#9333ea",
											},
										}}
									>
										Chat
									</Button>
								)}
							</div>
						)}
					</div>
				)}
			</Sheet>
		</Modal>
	);
}

export default ProfileModal;
