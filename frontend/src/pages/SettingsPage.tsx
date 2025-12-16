import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { userServices } from "@/services/userServices";

import Layout from "@/components/Layout";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Textarea from "@mui/joy/Textarea";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import {
	Save,
	Cancel,
	Person,
	Email,
	Cake,
	Work,
	LocationOn,
	Numbers,
	MyLocation,
} from "@mui/icons-material";

interface SettingsForm {
	displayName: string;
	bio: string;
	dateOfBirth: string;
	age: number;
	gender: "male" | "female" | "other" | "";
	occupation: string;
	occupationDescription: string;
	location: {
		lat: number;
		lng: number;
	};
	maxDistanceKm: number;
}

function SettingsPage() {
	const { userProfile, updateUserProfile } = useAuthStore();
	const navigate = useNavigate();
	const [isSaving, setIsSaving] = useState(false);
	const [isDetectingLocation, setIsDetectingLocation] = useState(false);

	const [formData, setFormData] = useState<SettingsForm>({
		displayName: "",
		bio: "",
		dateOfBirth: "",
		age: 0,
		gender: "",
		occupation: "",
		occupationDescription: "",
		location: {
			lat: 0,
			lng: 0,
		},
		maxDistanceKm: 10,
	});

	// Load user data on mount
	useEffect(() => {
		if (userProfile) {
			setFormData({
				displayName: userProfile.displayName || "",
				bio: userProfile.bio || "",
				dateOfBirth: userProfile.dateOfBirth || "",
				age: userProfile.age || 0,
				gender: userProfile.gender || "",
				occupation: userProfile.occupation || "",
				occupationDescription: userProfile.occupationDescription || "",
				location: userProfile.location || { lat: 0, lng: 0 },
				maxDistanceKm: userProfile.maxDistanceKm || 10,
			});
		}
	}, [userProfile]);

	const handleChange = (
		field: keyof SettingsForm,
		value: string | number
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleLocationChange = (field: "lat" | "lng", value: number) => {
		setFormData((prev) => ({
			...prev,
			location: {
				...prev.location,
				[field]: value,
			},
		}));
	};

	const handleLatitudeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;

		// Check if comma is in the input
		if (value.includes(",")) {
			const parts = value.split(",").map((part) => part.trim());
			const lat = parseFloat(parts[0]) || 0;
			const lng = parseFloat(parts[1]) || 0;

			// Update both latitude and longitude
			setFormData((prev) => ({
				...prev,
				location: {
					lat: lat,
					lng: lng,
				},
			}));

			// Focus to longitude input after a short delay
			setTimeout(() => {
				const lngInput = document.getElementById(
					"longitude-input"
				) as HTMLInputElement;
				if (lngInput) {
					lngInput.focus();
				}
			}, 0);
		} else {
			// Normal input without comma
			handleLocationChange("lat", parseFloat(value) || 0);
		}
	};

	const handleLocationPaste = (
		e: React.ClipboardEvent<HTMLInputElement | HTMLDivElement>,
		field: "lat" | "lng"
	) => {
		const pastedText = e.clipboardData.getData("text");

		// Check if pasted text contains comma (format: lat, lng)
		if (pastedText.includes(",")) {
			e.preventDefault();
			const parts = pastedText.split(",").map((part) => part.trim());
			const lat = parseFloat(parts[0]) || 0;
			const lng = parseFloat(parts[1]) || 0;

			setFormData((prev) => ({
				...prev,
				location: {
					lat: lat,
					lng: lng,
				},
			}));

			// Focus to longitude input
			setTimeout(() => {
				const lngInput = document.getElementById(
					"longitude-input"
				) as HTMLInputElement;
				if (lngInput) {
					lngInput.focus();
				}
			}, 0);
		}
	};

	const handleDetectLocation = () => {
		if (!navigator.geolocation) {
			toast.error("Geolocation is not supported by your browser");
			return;
		}

		setIsDetectingLocation(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setFormData((prev) => ({
					...prev,
					location: {
						lat: parseFloat(latitude.toFixed(6)),
						lng: parseFloat(longitude.toFixed(6)),
					},
				}));
				toast.success("Location detected successfully!");
				setIsDetectingLocation(false);
			},
			(error) => {
				console.error("Geolocation error:", error);
				toast.error("Failed to detect location. Please try again.");
				setIsDetectingLocation(false);
			}
		);
	};

	const handleSave = async () => {
		if (!userProfile) {
			toast.error("User profile not found");
			return;
		}

		if (!formData.displayName.trim()) {
			toast.error("Display name is required");
			return;
		}

		const dob = new Date(formData.dateOfBirth);
		const age = formData.age;

		// Check valid year
		if (dob.getFullYear() > new Date().getFullYear()) {
			toast.error("Date of birth cannot be in the future");
			return;
		}

		// Check valid age (>18)
		if (age < 18) {
			toast.error("You must be at least 18 years old");
			return;
		}

		setIsSaving(true);
		try {
			const response = await userServices.updateMe({
				...userProfile,
				displayName: formData.displayName,
				bio: formData.bio,
				dateOfBirth: formData.dateOfBirth,
				age: formData.age,
				gender: formData.gender || undefined,
				occupation: formData.occupation,
				occupationDescription: formData.occupationDescription,
				location:
					formData.location.lat !== 0 || formData.location.lng !== 0
						? formData.location
						: undefined,
				maxDistanceKm: formData.maxDistanceKm,
			});

			if (response?.data) {
				updateUserProfile(response.data);
			}

			toast.success("Settings saved successfully!");
			setTimeout(() => {
				navigate("/ProfilePage");
			}, 500);
		} catch (error) {
			console.error("Failed to save settings:", error);
			toast.error("Failed to save settings. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	if (!userProfile) {
		return (
			<Layout>
				<div className='flex items-center justify-center h-96'>
					<p className='text-gray-500'>Loading...</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className='max-w-4xl mx-auto p-4 sm:p-6 lg:p-8'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2'>
						Account Settings
					</h1>
					<p className='text-gray-600'>
						Manage your personal information and preferences
					</p>
				</div>

				<div className='space-y-6'>
					{/* Basic Information */}
					<div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
						<h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
							<span className='w-2 h-2 rounded-full bg-purple-500'></span>
							Basic Information
						</h2>

						<div className='space-y-4'>
							{/* Display Name */}
							<div>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									<Person
										sx={{
											fontSize: "1rem",
											verticalAlign: "middle",
											marginRight: "0.5rem",
										}}
									/>
									Display Name *
								</label>
								<Input
									value={formData.displayName}
									onChange={(e) =>
										handleChange(
											"displayName",
											e.target.value
										)
									}
									placeholder='Enter your display name'
									required
								/>
							</div>

							{/* Email (Read-only) */}
							<div>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									<Email
										sx={{
											fontSize: "1rem",
											verticalAlign: "middle",
											marginRight: "0.5rem",
										}}
									/>
									Email
								</label>
								<Input
									value={userProfile.email}
									disabled
									sx={{ backgroundColor: "#f3f4f6" }}
								/>
								<p className='text-xs text-gray-500 mt-1'>
									Email cannot be changed
								</p>
							</div>

							{/* Bio */}
							<div>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									Bio
								</label>
								<Textarea
									value={formData.bio}
									onChange={(e) =>
										handleChange("bio", e.target.value)
									}
									placeholder='Tell us about yourself...'
									minRows={3}
									maxRows={6}
								/>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{/* Date of Birth */}
								<div>
									<label className='block text-sm font-semibold text-gray-700 mb-2'>
										<Cake
											sx={{
												fontSize: "1rem",
												verticalAlign: "middle",
												marginRight: "0.5rem",
											}}
										/>
										Date of Birth
									</label>
									<Input
										type='date'
										value={formData.dateOfBirth}
										onChange={(e) => {
											handleChange(
												"dateOfBirth",
												e.target.value
											);
											handleChange(
												"age",
												new Date().getFullYear() -
													new Date(
														e.target.value
													).getFullYear()
											);
										}}
									/>
								</div>

								{/* Age */}
								<div>
									<label className='block text-sm font-semibold text-gray-700 mb-2'>
										<Numbers
											sx={{
												fontSize: "1rem",
												verticalAlign: "middle",
												marginRight: "0.5rem",
											}}
										/>
										Age
									</label>
									<Input
										type='number'
										value={formData.age}
										disabled
										sx={{ backgroundColor: "#f3f4f6" }}
									/>
									<p className='text-xs text-gray-500 mt-1'>
										Age is calculated from date of birth
									</p>
								</div>
							</div>

							{/* Gender */}
							<div>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									Gender
								</label>
								<Select
									value={formData.gender}
									onChange={(_, value) =>
										handleChange("gender", value || "")
									}
									placeholder='Select gender'
								>
									<Option value='male'>Male</Option>
									<Option value='female'>Female</Option>
									<Option value='other'>Other</Option>
								</Select>
							</div>
						</div>
					</div>

					{/* Professional Information */}
					<div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
						<h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
							<span className='w-2 h-2 rounded-full bg-indigo-500'></span>
							Professional Information
						</h2>

						<div className='space-y-4'>
							{/* Occupation */}
							<div>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									<Work
										sx={{
											fontSize: "1rem",
											verticalAlign: "middle",
											marginRight: "0.5rem",
										}}
									/>
									Occupation
								</label>
								<Input
									value={formData.occupation}
									onChange={(e) =>
										handleChange(
											"occupation",
											e.target.value
										)
									}
									placeholder='e.g., Software Engineer, Designer...'
								/>
							</div>

							{/* Occupation Description */}
							<div>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									Occupation Description
								</label>
								<Textarea
									value={formData.occupationDescription}
									onChange={(e) =>
										handleChange(
											"occupationDescription",
											e.target.value
										)
									}
									placeholder='Describe your role, responsibilities, or expertise...'
									minRows={2}
									maxRows={4}
								/>
							</div>
						</div>
					</div>

					{/* Location Settings */}
					<div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
						<h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
							<span className='w-2 h-2 rounded-full bg-pink-500'></span>
							Location Settings
						</h2>

						<div className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{/* Latitude */}
								<div>
									<label className='block text-sm font-semibold text-gray-700 mb-2'>
										<LocationOn
											sx={{
												fontSize: "1rem",
												verticalAlign: "middle",
												marginRight: "0.5rem",
											}}
										/>
										Latitude
									</label>
									<Input
										id='latitude-input'
										type='number'
										value={formData.location.lat}
										onChange={handleLatitudeInput}
										onPaste={(e) =>
											handleLocationPaste(e, "lat")
										}
										placeholder='e.g., 10.762622'
										slotProps={{
											input: { step: "0.000001" },
										}}
									/>
								</div>

								{/* Longitude */}
								<div>
									<label className='block text-sm font-semibold text-gray-700 mb-2'>
										<LocationOn
											sx={{
												fontSize: "1rem",
												verticalAlign: "middle",
												marginRight: "0.5rem",
											}}
										/>
										Longitude
									</label>
									<Input
										type='number'
										value={formData.location.lng}
										onChange={(e) =>
											handleLocationChange(
												"lng",
												parseFloat(e.target.value) || 0
											)
										}
										placeholder='e.g., 106.660172'
										slotProps={{
											input: { step: "0.000001" },
										}}
									/>
								</div>
								{/* Detect Location Button */}
								<div className='md:col-span-2'>
									<Button
										onClick={handleDetectLocation}
										disabled={isDetectingLocation}
										startDecorator={<MyLocation />}
										sx={{
											backgroundColor: "#3b82f6",
											width: "100%",
											"&:hover": {
												backgroundColor: "#2563eb",
											},
											"&:disabled": {
												backgroundColor: "#e5e7eb",
												color: "#9ca3af",
											},
										}}
									>
										{isDetectingLocation
											? "Detecting..."
											: "Detect My Location"}
									</Button>
								</div>
							</div>

							{/* Max Distance */}
							<div>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									Maximum Distance (km)
								</label>
								<Input
									type='number'
									value={formData.maxDistanceKm}
									onChange={(e) =>
										handleChange(
											"maxDistanceKm",
											parseInt(e.target.value) || 0
										)
									}
									placeholder='e.g., 10'
									slotProps={{
										input: { min: 0, max: 1000 },
									}}
								/>
								<p className='text-xs text-gray-500 mt-1'>
									Maximum distance for finding work partners
								</p>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className='flex justify-end gap-4'>
						<Button
							variant='outlined'
							onClick={() => navigate(-1)}
							startDecorator={<Cancel />}
							sx={{
								borderColor: "#e5e7eb",
								color: "#6b7280",
								"&:hover": {
									borderColor: "#d1d5db",
									backgroundColor: "#f9fafb",
								},
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							disabled={isSaving}
							startDecorator={<Save />}
							sx={{
								backgroundColor: "#a855f7",
								paddingX: 4,
								"&:hover": { backgroundColor: "#9333ea" },
								"&:disabled": {
									backgroundColor: "#e5e7eb",
									color: "#9ca3af",
								},
							}}
						>
							{isSaving ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default SettingsPage;
