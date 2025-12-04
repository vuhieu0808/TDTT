import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";

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
import IconButton from "@mui/joy/IconButton";

type WorkingMode = "quiet" | "creative" | "deep" | "balanced" | "custom";

interface UserPreferences {
	interests: string[];
	workHours: number;
	chatHours: number;
	chatExpectation: number; // 0-100 scale
	workingMode: WorkingMode;
}

interface WorkingModePreset {
	workHours: number;
	chatHours: number;
	chatExpectation: number;
}

function PreferencePage() {
	const { userProfile } = useAuthStore();
	const navigate = useNavigate();

	const [newInterest, setNewInterest] = useState("");
	const [preferences, setPreferences] = useState<UserPreferences>({
		interests: [],
		workHours: 2,
		chatHours: 1,
		chatExpectation: 50,
		workingMode: "balanced",
	});

	const [isSaving, setIsSaving] = useState(false);

	// Define presets for each working mode
	const workingModePresets: Record<
		Exclude<WorkingMode, "custom">,
		WorkingModePreset
	> = {
		quiet: {
			workHours: 4,
			chatHours: 0.5,
			chatExpectation: 10,
		},
		creative: {
			workHours: 2,
			chatHours: 2,
			chatExpectation: 80,
		},
		deep: {
			workHours: 3,
			chatHours: 0.75,
			chatExpectation: 25,
		},
		balanced: {
			workHours: 2.5,
			chatHours: 1.5,
			chatExpectation: 50,
		},
	};

	const checkIfCustom = (
		workHours: number,
		chatHours: number,
		chatExpectation: number
	): WorkingMode => {
		for (const [mode, preset] of Object.entries(workingModePresets)) {
			if (
				preset.workHours === workHours &&
				preset.chatHours === chatHours &&
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
				workHours: preset.workHours,
				chatHours: preset.chatHours,
				chatExpectation: preset.chatExpectation,
				workingMode: mode,
			});
		}
	};

	const handleWorkSessionChange = (
		field: "workHours" | "chatHours" | "chatExpectation",
		value: number
	) => {
		const newPreferences = {
			...preferences,
			[field]: value,
		};

		// Check if the new settings match a preset
		const detectedMode = checkIfCustom(
			field === "workHours" ? value : preferences.workHours,
			field === "chatHours" ? value : preferences.chatHours,
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
			// TODO: Save preferences to backend
			console.log("Saving preferences:", preferences);
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
			// Show success message
			alert("Preferences saved successfully!");
		} catch (error) {
			console.error("Failed to save preferences:", error);
			alert("Failed to save preferences. Please try again.");
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
										endDecorator={
											<IconButton
												size='sm'
												variant='plain'
												onClick={(e) => {
													e.stopPropagation();
													handleRemoveInterest(
														interest
													);
												}}
												sx={{
													minHeight: "unset",
													minWidth: "unset",
													padding: 0,
													marginLeft: "4px",
													"--IconButton-size": "20px",
													"&:hover": {
														backgroundColor:
															"transparent",
													},
												}}
											>
												<Close
													sx={{
														fontSize: "1rem",
														cursor: "pointer",
														"&:hover": {
															color: "#dc2626",
														},
													}}
												/>
											</IconButton>
										}
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
							Working Mode
						</h2>
						<p className='text-sm text-gray-600 mb-6'>
							Choose your preferred work-date style
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
					<div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
						<h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
							<span className='w-2 h-2 rounded-full bg-pink-500'></span>
							Expected Work Session
						</h2>
						<p className='text-sm text-gray-600 mb-6'>
							Define your ideal work session duration and
							interaction level
						</p>

						<div className='space-y-6'>
							{/* Work Hours */}
							<div>
								<div className='flex justify-between items-center mb-3'>
									<label className='text-sm font-semibold text-gray-700'>
										Work Duration
									</label>
									<span className='text-lg font-bold text-purple-600'>
										{preferences.workHours}{" "}
										{preferences.workHours === 1
											? "hour"
											: "hours"}
									</span>
								</div>
								<Slider
									value={preferences.workHours}
									onChange={(_, value) =>
										handleWorkSessionChange(
											"workHours",
											value as number
										)
									}
									min={0.5}
									max={8}
									step={0.5}
									marks={[
										{ value: 0.5, label: "30m" },
										{ value: 2, label: "2h" },
										{ value: 4, label: "4h" },
										{ value: 6, label: "6h" },
										{ value: 8, label: "8h" },
									]}
									sx={{
										"--Slider-trackBackground": "#a855f7",
										"--Slider-thumbBackground": "#a855f7",
									}}
								/>
							</div>

							{/* Chat Hours */}
							<div>
								<div className='flex justify-between items-center mb-3'>
									<label className='text-sm font-semibold text-gray-700'>
										Chat/Break Duration
									</label>
									<span className='text-lg font-bold text-pink-600'>
										{preferences.chatHours}{" "}
										{preferences.chatHours === 1
											? "hour"
											: "hours"}
									</span>
								</div>
								<Slider
									value={preferences.chatHours}
									onChange={(_, value) =>
										handleWorkSessionChange(
											"chatHours",
											value as number
										)
									}
									min={0.25}
									max={4}
									step={0.25}
									marks={[
										{ value: 0.25, label: "15m" },
										{ value: 1, label: "1h" },
										{ value: 2, label: "2h" },
										{ value: 3, label: "3h" },
										{ value: 4, label: "4h" },
									]}
									sx={{
										"--Slider-trackBackground": "#ec4899",
										"--Slider-thumbBackground": "#ec4899",
									}}
								/>
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
