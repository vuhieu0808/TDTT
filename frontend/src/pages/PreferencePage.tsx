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
} from "@mui/icons-material";

type WorkingMode = "quiet" | "creative" | "deep" | "balanced" | "custom";

interface UserPreferences {
	interests: string[];
	workRatio: number; // 0-100 percentage
	chatExpectation: number; // 0-100 scale
	workingMode: WorkingMode;
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
		workRatio: 60,
		chatExpectation: 50,
		workingMode: "balanced",
	});

	const [isSaving, setIsSaving] = useState(false);
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	// Load preferences from userProfile on mount (only once)
	useEffect(() => {
		if (userProfile && isInitialLoad) {
			setPreferences({
				interests: userProfile.interests || [],
				workRatio: userProfile.workDateRatio ?? 60,
				chatExpectation: 50,
				workingMode:
					userProfile.workVibe?.type === "quiet-focus"
						? "quiet"
						: userProfile.workVibe?.type === "creative-chat"
						? "creative"
						: userProfile.workVibe?.type === "deep-work"
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

	const checkIfCustom = (
		workRatio: number,
		chatExpectation: number
	): WorkingMode => {
		for (const [mode, preset] of Object.entries(workingModePresets)) {
			if (
				preset.workRatio === workRatio &&
				preset.chatExpectation === chatExpectation
			) {
				return mode as Exclude<WorkingMode, "custom">;
			}
		}
		return "custom";
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
				workRatio: preset.workRatio,
				chatExpectation: preset.chatExpectation,
				workingMode: mode,
			});
		}
	};

	const handleWorkSessionChange = (
		field: "workRatio" | "chatExpectation",
		value: number
	) => {
		const newPreferences = {
			...preferences,
			[field]: value,
		};

		// Check if the new settings match a preset
		const detectedMode = checkIfCustom(
			field === "workRatio" ? value : preferences.workRatio,
			field === "chatExpectation" ? value : preferences.chatExpectation
		);

		setPreferences({
			...newPreferences,
			workingMode: detectedMode,
		});
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
				workDateRatio: preferences.workRatio,
				workVibe: {
					type: workVibe,
					workChatRatio: preferences.workRatio,
					interactionLevel: preferences.chatExpectation,
				},
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
		{
			id: "custom" as WorkingMode,
			name: "Custom",
			icon: Tune,
			description: "Your personalized work-date settings",
			color: "#fff",
		},
	];

	return (
		<Layout>
			<div className='max-w-4xl mx-auto p-4 sm:p-6 lg:p-8'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2'>
						Work-Date Preferences
					</h1>
					<p className='text-gray-600'>
						Set your preferences to find the perfect work partner
					</p>
				</div>

				<div className='space-y-8'>
					{/* Interests Section */}
					<div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
						<h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
							<span className='w-2 h-2 rounded-full bg-purple-500'></span>
							Interests
						</h2>
						<p className='text-sm text-gray-600 mb-4'>
							Add topics you're interested in to match with
							like-minded partners
						</p>

						{/* Add Interest Input */}
						<div className='flex gap-2 mb-4'>
							<Input
								placeholder='e.g., Machine Learning, Design, Photography...'
								value={newInterest}
								onChange={(e) => setNewInterest(e.target.value)}
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
									"&:hover": { backgroundColor: "#9333ea" },
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
								preferences.interests.map((interest, index) => (
									<Chip
										key={index}
										sx={{
											backgroundColor: "#f3e8ff",
											color: "#7e22ce",
											fontWeight: "500",
											"&:hover": {
												backgroundColor: "#e9d5ff",
											},
										}}
									>
										{interest}
										<Close
											onClick={(e) => {
												e.stopPropagation();
												e.preventDefault();
												handleRemoveInterest(interest);
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
								))
							) : (
								<p className='text-sm text-gray-400 italic'>
									No interests added yet. Start by adding some
									above!
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
							Choose a preset or customize your own work-date
							style
						</p>

						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
							{workingModes.map((mode) => {
								const Icon = mode.icon;
								const isSelected =
									preferences.workingMode === mode.id;

								return (
									<button
										key={mode.id}
										onClick={() =>
											handleWorkingModeChange(mode.id)
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
														fontSize: "1.5rem",
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

					{/* Expected Work Session Section */}
					<div className='bg-white rounded-2xl p-10 shadow-sm border border-gray-200'>
						<h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
							<span className='w-2 h-2 rounded-full bg-pink-500'></span>
							Expected Work Session
						</h2>
						<p className='text-sm text-gray-600 mb-6'>
							Define your ideal work session duration and
							interaction level
						</p>

						<div className='space-y-6'>
							{/* Work/Chat Ratio */}
							<div>
								<div className='flex justify-between items-center mb-3'>
									<label className='text-sm font-semibold text-gray-700'>
										Work / Chat Ratio
									</label>
									<div className='flex items-center gap-3'>
										<span className='text-lg font-bold text-purple-600'>
											{preferences.workRatio}%
										</span>
										<span className='text-gray-400'>/</span>
										<span className='text-lg font-bold text-pink-600'>
											{100 - preferences.workRatio}%
										</span>
									</div>
								</div>
								<Slider
									value={preferences.workRatio}
									onChange={(_, value) =>
										handleWorkSessionChange(
											"workRatio",
											value as number
										)
									}
									min={0}
									max={100}
									step={5}
									marks={[
										{ value: 0, label: "0%" },
										{ value: 25, label: "25%" },
										{ value: 50, label: "50%" },
										{ value: 75, label: "75%" },
										{ value: 100, label: "100%" },
									]}
									sx={{
										"--Slider-trackBackground":
											"linear-gradient(to right, #a855f7, #ec4899)",
										"--Slider-thumbBackground": "#a855f7",
									}}
								/>
								<div className='flex justify-between mt-2'>
									<p className='text-xs text-purple-600 font-medium'>
										Work: {preferences.workRatio}%
									</p>
									<p className='text-xs text-pink-600 font-medium'>
										Chat: {100 - preferences.workRatio}%
									</p>
								</div>
							</div>

							{/* Chat Expectation */}
							<div>
								<div className='flex justify-between items-center mb-3'>
									<label className='text-sm font-semibold text-gray-700'>
										Interaction Level
									</label>
									<span className='text-lg font-bold text-purple-600'>
										{preferences.chatExpectation}%
									</span>
								</div>
								<Slider
									value={preferences.chatExpectation}
									onChange={(_, value) =>
										handleWorkSessionChange(
											"chatExpectation",
											value as number
										)
									}
									min={0}
									max={100}
									step={5}
									marks={[
										{ value: 0, label: "Silent" },
										{ value: 50, label: "Moderate" },
										{ value: 100, label: "Very Active" },
									]}
									sx={{
										"--Slider-trackBackground":
											"linear-gradient(to right, #a855f7, #ec4899)",
										"--Slider-thumbBackground": "#a855f7",
									}}
								/>
								<p className='text-xs text-gray-500 mt-2'>
									{preferences.chatExpectation < 30
										? "You prefer minimal interaction during work"
										: preferences.chatExpectation < 70
										? "You enjoy moderate conversation during breaks"
										: "You love active collaboration and chat"}
								</p>
							</div>
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
								"&:hover": { backgroundColor: "#9333ea" },
								"&:disabled": {
									backgroundColor: "#e5e7eb",
									color: "#9ca3af",
								},
							}}
						>
							{isSaving ? "Saving..." : "Save Preferences"}
						</Button>
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default PreferencePage;
