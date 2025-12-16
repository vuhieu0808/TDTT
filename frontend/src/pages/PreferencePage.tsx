import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";

import { toast, Toaster } from "sonner";
import { userServices } from "@/services/userServices";

import Layout from "@/components/Layout";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Slider from "@mui/joy/Slider";
import Chip from "@mui/joy/Chip";
import {
	Add,
	Close,
	VolumeOff,
	Chat,
	Psychology,
	BalanceOutlined,
	Save,
	Tune,
	WbSunny,
	WbTwilight,
	Brightness3,
	NightsStay,
	LightMode,
	Brightness7,
	CheckCircle,
	Warning,
	Person,
} from "@mui/icons-material";

type WorkingMode = "quiet" | "creative" | "deep" | "balanced" | "custom";

interface UserPreferences {
	interests: string[];
	workingMode: WorkingMode;
	availability: number[]; // Array of 42 slots (7 days × 6 time slots)
}

interface WorkingModePreset {
	workRatio: number; // percentage
	chatExpectation: number;
}

function PreferencePage() {
	const { userProfile, updateUserProfile } = useAuthStore();
	const navigate = useNavigate();

	const [newInterest, setNewInterest] = useState("");
	const [preferences, setPreferences] = useState<UserPreferences>({
		interests: [],
		workingMode: "balanced",
		availability: [],
	});

	const [isSaving, setIsSaving] = useState(false);
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	// Calendar configuration
	const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	const timeSlots = [
		{ label: "Morning", time: "6-9 AM", icon: WbSunny },
		{ label: "Late Morning", time: "9-12 PM", icon: Brightness7 },
		{ label: "Afternoon", time: "12-3 PM", icon: LightMode },
		{ label: "Late Afternoon", time: "3-6 PM", icon: WbTwilight },
		{ label: "Evening", time: "6-9 PM", icon: Brightness3 },
		{ label: "Night", time: "9-12 AM", icon: NightsStay },
	];

	// Load preferences from userProfile on mount (only once)
	useEffect(() => {
		if (userProfile && isInitialLoad) {
			setPreferences({
				availability: userProfile.availability || [],
				interests: userProfile.interests || [],
				workingMode:
					userProfile?.workVibe === "quiet-focus"
						? "quiet"
						: userProfile?.workVibe === "creative-chat"
						? "creative"
						: userProfile?.workVibe === "deep-work"
						? "deep"
						: "balanced",
			});
			setIsInitialLoad(false);
		}
	}, [userProfile, isInitialLoad]);

	// Define presets for each working mode
	const workingModePresets: Record<
		Exclude<WorkingMode, "custom">,
		WorkingModePreset
	> = {
		quiet: {
			workRatio: 90, // 90% work, 10% chat
			chatExpectation: 10,
		},
		creative: {
			workRatio: 50, // 50% work, 50% chat
			chatExpectation: 80,
		},
		deep: {
			workRatio: 80, // 80% work, 20% chat
			chatExpectation: 25,
		},
		balanced: {
			workRatio: 60, // 60% work, 40% chat
			chatExpectation: 50,
		},
	};

	const hasIncompletePersonalInfo = () => {
		if (!userProfile) return false;
		const missingFields: string[] = [];
		if (!userProfile.age) {
			missingFields.push("age");
		}
		if (!userProfile.occupation) {
			missingFields.push("occupation");
		}
		if (!userProfile.location) {
			missingFields.push("location");
		}
		return missingFields;
	};

	const handleWorkingModeChange = (mode: WorkingMode) => {
		if (mode === "custom") {
			setPreferences({
				...preferences,
				workingMode: mode,
			});
		} else {
			const preset = workingModePresets[mode];
			setPreferences({
				...preferences,
				workingMode: mode,
			});
		}
	};

	const handleSavePreferences = async () => {
		setIsSaving(true);
		try {
			if (!userProfile) {
				toast.error("User profile not found");
				return;
			}

			// Map working mode to workVibe
			const workVibe:
				| "quiet-focus"
				| "creative-chat"
				| "deep-work"
				| "balanced" =
				preferences.workingMode === "quiet"
					? "quiet-focus"
					: preferences.workingMode === "creative"
					? "creative-chat"
					: preferences.workingMode === "deep"
					? "deep-work"
					: "balanced";

			// Save preferences to backend
			const response = await userServices.updateMe({
				...userProfile,
				interests: preferences.interests,
				availability: preferences.availability,
				workVibe: workVibe,
			});

			// Update the auth store with the returned data
			if (response?.data) {
				updateUserProfile(response.data);
			}

			// Show success message
			toast.success("Preferences saved successfully!");
		} catch (error) {
			console.error("Failed to save preferences:", error);
			toast.error("Failed to save preferences. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleAddInterest = () => {
		if (
			newInterest.trim() &&
			!preferences.interests.includes(newInterest.trim())
		) {
			setPreferences({
				...preferences,
				interests: [...preferences.interests, newInterest.trim()],
			});
			setNewInterest("");
		}
	};

	const handleRemoveInterest = (interest: string) => {
		setPreferences({
			...preferences,
			interests: preferences.interests.filter((i) => i !== interest),
		});
	};
	// Get slot index: dayIndex (0-6) * 6 + timeSlotIndex (0-5) = 0-41
	const getSlotIndex = (dayIndex: number, timeSlotIndex: number) => {
		return dayIndex * 6 + timeSlotIndex;
	};

	const isSlotSelected = (dayIndex: number, timeSlotIndex: number) => {
		const slotIndex = getSlotIndex(dayIndex, timeSlotIndex);
		return preferences.availability.includes(slotIndex);
	};

	const handleToggleSlot = (dayIndex: number, timeSlotIndex: number) => {
		const slotIndex = getSlotIndex(dayIndex, timeSlotIndex);
		const isSelected = preferences.availability.includes(slotIndex);

		if (isSelected) {
			setPreferences({
				...preferences,
				availability: preferences.availability.filter(
					(slot) => slot !== slotIndex
				),
			});
		} else {
			setPreferences({
				...preferences,
				availability: [...preferences.availability, slotIndex].sort(
					(a, b) => a - b
				),
			});
		}
	};

	const handleClearAvailability = () => {
		setPreferences({
			...preferences,
			availability: [],
		});
		toast.success("Availability cleared");
	};

	const handleSelectAllSlots = () => {
		const allSlots = Array.from({ length: 42 }, (_, i) => i);
		setPreferences({
			...preferences,
			availability: allSlots,
		});
		toast.success("All time slots selected");
	};

	const workingModes = [
		{
			id: "quiet" as WorkingMode,
			name: "Quiet Focus",
			icon: VolumeOff,
			description: "Minimal conversation, maximum productivity",
			// color: "#6366f1",
			color: "#ffffff",
		},
		{
			id: "creative" as WorkingMode,
			name: "Creative Chat",
			icon: Chat,
			description: "Collaborative brainstorming sessions",
			color: "#fff",
		},
		{
			id: "deep" as WorkingMode,
			name: "Deep Work",
			icon: Psychology,
			description: "Focused work with strategic breaks",
			color: "#fff",
		},
		{
			id: "balanced" as WorkingMode,
			name: "Balanced",
			icon: BalanceOutlined,
			description: "Equal mix of work and conversation",
			color: "#fff",
		},
	];

	{
		return (
			<>
				<Layout>
					<div className='max-w-4xl mx-auto p-4 sm:p-6 lg:p-8'>
						{/* Header */}
						<div className='mb-8'>
							<h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2'>
								Work-Date Preferences
							</h1>
							<p className='text-gray-600'>
								Set your preferences to find the perfect work
								partner
							</p>
						</div>

						{/* Recommendation Banner */}
						{(() => {
							const missingPersonalInfo =
								hasIncompletePersonalInfo();
							if (
								missingPersonalInfo &&
								missingPersonalInfo.length > 0
							) {
								return (
									<div className='bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-4 mb-6 shadow-sm'>
										<div className='flex items-start gap-3'>
											<Warning
												sx={{
													color: "#f59e0b",
													fontSize: "1.5rem",
												}}
											/>
											<div className='flex-1'>
												<h3 className='font-bold text-gray-900 mb-1'>
													Complete Your Personal
													Profile
												</h3>
												<p className='text-sm text-gray-700 mb-3'>
													You're missing:{" "}
													<span className='font-semibold'>
														{missingPersonalInfo.join(
															", "
														)}
													</span>
													. Complete your personal
													information to start
													matching!
												</p>
												<Button
													onClick={() =>
														navigate(
															"/SettingsPage"
														)
													}
													startDecorator={<Person />}
													size='sm'
													sx={{
														backgroundColor:
															"#f59e0b",
														"&:hover": {
															backgroundColor:
																"#d97706",
														},
													}}
												>
													Complete Personal Info
												</Button>
											</div>
										</div>
									</div>
								);
							} else if (
								missingPersonalInfo &&
								missingPersonalInfo.length === 0
							) {
								return (
									<div className='bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 mb-6 shadow-sm'>
										<div className='flex items-center gap-3'>
											<CheckCircle
												sx={{
													color: "#10b981",
													fontSize: "1.5rem",
												}}
											/>
											<div>
												<h3 className='font-bold text-gray-900'>
													Profile Complete! 🎉
												</h3>
												<p className='text-sm text-gray-700'>
													Your personal profile and
													work preferences are all set
													up. You're ready to match!
												</p>
											</div>
										</div>
									</div>
								);
							}
							return null;
						})()}

						<div className='space-y-8'>
							{/* Interests Section */}
							<div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
								<h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
									<span className='w-2 h-2 rounded-full bg-purple-500'></span>
									Interests
								</h2>
								<p className='text-sm text-gray-600 mb-4'>
									Add topics you're interested in to match
									with like-minded partners
								</p>

								{/* Add Interest Input */}
								<div className='flex gap-2 mb-4'>
									<Input
										placeholder='e.g., Machine Learning, Design, Photography...'
										value={newInterest}
										onChange={(e) =>
											setNewInterest(e.target.value)
										}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleAddInterest();
											}
										}}
										sx={{
											flex: 1,
											"--Input-focusedThickness": "2px",
											"&:focus-within": {
												outline:
													"2px solid var(--color-primary)",
											},
										}}
									/>
									<Button
										onClick={handleAddInterest}
										disabled={!newInterest.trim()}
										sx={{
											backgroundColor: "#a855f7",
											"&:hover": {
												backgroundColor: "#9333ea",
											},
											"&:disabled": {
												backgroundColor: "#e5e7eb",
												color: "#9ca3af",
											},
										}}
									>
										<Add />
									</Button>
								</div>

								{/* Interests List */}
								<div className='flex flex-wrap gap-2'>
									{preferences.interests.length > 0 ? (
										preferences.interests.map(
											(interest, index) => (
												<Chip
													key={index}
													sx={{
														backgroundColor:
															"#f3e8ff",
														color: "#7e22ce",
														fontWeight: "500",
														"&:hover": {
															backgroundColor:
																"#e9d5ff",
														},
													}}
												>
													{interest}
													<Close
														onClick={(e) => {
															e.stopPropagation();
															e.preventDefault();
															handleRemoveInterest(
																interest
															);
														}}
														sx={{
															fontSize: "1rem",
															cursor: "pointer",
															"&:hover": {
																color: "#dc2626",
															},
														}}
													/>
												</Chip>
											)
										)
									) : (
										<p className='text-sm text-gray-400 italic'>
											No interests added yet. Start by
											adding some above!
										</p>
									)}
								</div>
							</div>

							{/* Working Modes Section */}
							<div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
								<h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
									<span className='w-2 h-2 rounded-full bg-indigo-500'></span>
									Working Mode Presets
								</h2>
								<p className='text-sm text-gray-600 mb-6'>
									Choose a preset or customize your own
									work-date style
								</p>

								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4'>
									{workingModes.map((mode) => {
										const Icon = mode.icon;
										const isSelected =
											preferences.workingMode === mode.id;

										return (
											<button
												key={mode.id}
												onClick={() =>
													handleWorkingModeChange(
														mode.id
													)
												}
												className={`p-4 rounded-xl border-2 transition-all text-left ${
													isSelected
														? "border-purple-500 bg-purple-50 shadow-lg"
														: "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50"
												}`}
											>
												<div className='flex items-center gap-3'>
													<div className='w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center'>
														<Icon
															sx={{
																fontSize:
																	"1.5rem",
																color: isSelected
																	? mode.color
																	: "#6b7280",
															}}
														/>
													</div>
													<div className='flex-1'>
														<h3 className='font-bold text-gray-800 mb-1'>
															{mode.name}
														</h3>
														<p className='text-sm text-gray-600'>
															{mode.description}
														</p>
													</div>
													{isSelected && (
														<div className='w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center'>
															<span className='text-white text-sm'>
																✓
															</span>
														</div>
													)}
												</div>
											</button>
										);
									})}
								</div>
							</div>

							{/* Availability Calendar Section */}
							<div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
								<div className='flex items-center justify-between mb-4'>
									<div>
										<h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
											<span className='w-2 h-2 rounded-full bg-pink-500'></span>
											Weekly Availability
										</h2>
										<p className='text-sm text-gray-600 mt-1'>
											Click on time slots to mark when
											you're available for work dates
										</p>
									</div>
									<div className='flex gap-2'>
										<Button
											size='sm'
											variant='outlined'
											onClick={handleClearAvailability}
											sx={{
												borderColor: "#e5e7eb",
												color: "#6b7280",
												fontSize: "0.75rem",
												padding: "4px 12px",
												"&:hover": {
													borderColor: "#d1d5db",
													backgroundColor: "#f9fafb",
												},
											}}
										>
											Clear All
										</Button>
										<Button
											size='sm'
											onClick={handleSelectAllSlots}
											sx={{
												backgroundColor: "#ec4899",
												fontSize: "0.75rem",
												padding: "4px 12px",
												"&:hover": {
													backgroundColor: "#db2777",
												},
											}}
										>
											Select All
										</Button>
									</div>
								</div>

								{/* Calendar Grid */}
								<div className=''>
									<div className='min-w-[700px]'>
										{/* Header Row - Days of Week */}
										<div className='grid grid-cols-8 gap-2 mb-2'>
											<div className='text-xs font-medium text-gray-500 flex items-end pb-1'></div>
											{daysOfWeek.map((day, index) => (
												<div
													key={day}
													className='text-center text-xs font-bold text-gray-700 pb-1'
												>
													{day}
												</div>
											))}
										</div>

										{/* Time Slots Rows */}
										{timeSlots.map(
											(timeSlot, timeIndex) => {
												const Icon = timeSlot.icon;
												return (
													<div
														key={timeIndex}
														className='grid grid-cols-8 gap-2 mb-2'
													>
														{/* Time Label */}
														<div className='flex flex-col items-start justify-center pr-2'>
															<div className='flex items-center gap-2'>
																<Icon
																	sx={{
																		fontSize:
																			"1rem",
																		color: "#9ca3af",
																	}}
																/>
																<div>
																	<p className='text-xs font-medium text-gray-700'>
																		{
																			timeSlot.label
																		}
																	</p>
																	<p className='text-xs text-gray-500'>
																		{
																			timeSlot.time
																		}
																	</p>
																</div>
															</div>
														</div>

														{/* Day Slots */}
														{daysOfWeek.map(
															(_, dayIndex) => {
																const selected =
																	isSlotSelected(
																		dayIndex,
																		timeIndex
																	);
																return (
																	<button
																		key={
																			dayIndex
																		}
																		onClick={() =>
																			handleToggleSlot(
																				dayIndex,
																				timeIndex
																			)
																		}
																		className={`h-14 rounded-lg border-2 transition-all ${
																			selected
																				? "border-pink-500 bg-gradient-to-br from-pink-100 to-purple-100 shadow-md"
																				: "border-gray-200 bg-gray-50 hover:border-pink-300 hover:bg-pink-50"
																		}`}
																		title={`${daysOfWeek[dayIndex]} ${timeSlot.label}`}
																	>
																		{selected && (
																			<div className='flex items-center justify-center h-full'>
																				<span className='text-pink-600 font-bold text-lg'>
																					✓
																				</span>
																			</div>
																		)}
																	</button>
																);
															}
														)}
													</div>
												);
											}
										)}
									</div>
								</div>

								{/* Stats */}
								<div className='mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200'>
									<p className='text-sm text-gray-700'>
										<span className='font-semibold text-purple-600'>
											{preferences.availability.length} of
											42
										</span>{" "}
										time slots selected
										{preferences.availability.length ===
											0 && (
											<span className='text-amber-600 ml-2'>
												⚠️ Select at least a few slots
												to improve matching!
											</span>
										)}
									</p>
								</div>
							</div>

							{/* Save Button */}
							<div className='flex justify-end gap-4'>
								<Button
									variant='outlined'
									onClick={() => navigate(-1)}
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
									onClick={handleSavePreferences}
									disabled={isSaving}
									startDecorator={<Save />}
									sx={{
										backgroundColor: "#a855f7",
										paddingX: 4,
										"&:hover": {
											backgroundColor: "#9333ea",
										},
										"&:disabled": {
											backgroundColor: "#e5e7eb",
											color: "#9ca3af",
										},
									}}
								>
									{isSaving
										? "Saving..."
										: "Save Preferences"}
								</Button>
							</div>
						</div>
					</div>
				</Layout>
			</>
		);
	}
}

export default PreferencePage;
