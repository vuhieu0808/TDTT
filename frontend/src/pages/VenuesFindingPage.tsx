import { useState } from "react";

import Layout from "@/components/Layout";

import VenuesData from "@/data/Venues.json";

import {
	Search,
	LocationOn,
	Star,
	Phone,
	Schedule,
	Map,
	AttachMoney,
} from "@mui/icons-material";
import {
	Input,
	Card,
	Chip,
	Tabs,
	TabList,
	Tab,
	TabPanel,
	Select,
	Option,
} from "@mui/joy";

interface Cafe {
	id: number;
	name: string;
	address: string;
	city: string;
	distance: string;
	rating: number;
	reviews: number;
	phone: string;
	price: string;
	hours: string;
	description: string;
	amenities: string[];
	mapUrl: string;
}

const FILTER_OPTIONS = {
	comfort: {
		label: "Comfort Level",
		options: [
			{ value: "all", label: "All", numericValue: null },
			{ value: "0", label: "Basic", numericValue: 0 },
			{ value: "1", label: "Moderate", numericValue: 1 },
			{ value: "2", label: "Premium", numericValue: 2 },
		],
	},
	noise: {
		label: "Noise Level",
		options: [
			{ value: "all", label: "All", numericValue: null },
			{ value: "0", label: "Quiet", numericValue: 0 },
			{ value: "1", label: "Moderate", numericValue: 1 },
			{ value: "2", label: "Lively", numericValue: 2 },
		],
	},
	wifi: {
		label: "WiFi Speed",
		options: [
			{ value: "all", label: "All", numericValue: null },
			{ value: "0", label: "Basic", numericValue: 0 },
			{ value: "1", label: "Fast", numericValue: 1 },
			{ value: "2", label: "Ultra Fast", numericValue: 2 },
		],
	},
	ambiance: {
		label: "Ambiance",
		options: [
			{ value: "all", label: "All", numericValue: null },
			{ value: "0", label: "Casual", numericValue: 0 },
			{ value: "1", label: "Modern", numericValue: 1 },
			{ value: "2", label: "Cozy", numericValue: 2 },
		],
	},
};

function VenuesFindingPage() {
	const [location, setLocation] = useState("");
	const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
	const [activeTab, setActiveTab] = useState(0);
	const [cafesList, setCafesList] = useState<Cafe[]>(VenuesData);

	// Filter state with string values for display
	const [filters, setFilters] = useState({
		comfort: "all",
		noise: "all",
		wifi: "all",
		ambiance: "all",
	});

	const cafes: Cafe[] = VenuesData;

	const findVenues = (searchLocation: string) => {
		if (searchLocation.trim() === "") {
			setCafesList(cafes);
		} else {
			const filtered = cafes.filter(
				(cafe) =>
					cafe.address
						.toLowerCase()
						.includes(searchLocation.toLowerCase()) ||
					cafe.city
						.toLowerCase()
						.includes(searchLocation.toLowerCase())
			);
			setCafesList(filtered);
		}
	};

	// Helper function to get selected label for display
	const getFilterLabel = (filterKey: keyof typeof filters) => {
		const selectedValue = filters[filterKey];
		const filterConfig = FILTER_OPTIONS[filterKey];
		const selectedOption = filterConfig.options.find(
			(opt) => opt.value === selectedValue
		);
		return selectedOption?.label || "All";
	};

	// Handle filter change
	const handleFilterChange = (
		filterKey: keyof typeof filters,
		value: string
	) => {
		setFilters((prev) => ({
			...prev,
			[filterKey]: value,
		}));
	};

	// Apply filters and convert to numeric values for backend
	const applyFilters = () => {
		let filtered = [...cafes];

		// Convert string values to numeric for filtering
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== "all") {
				const filterConfig =
					FILTER_OPTIONS[key as keyof typeof FILTER_OPTIONS];
				const selectedOption = filterConfig.options.find(
					(opt) => opt.value === value
				);
				if (selectedOption && selectedOption.numericValue !== null) {
					// Apply your filter logic here using selectedOption.numericValue
					// Example: filtered = filtered.filter(cafe => cafe[key] === selectedOption.numericValue);
				}
			}
		});

		setCafesList(filtered);
	};

	// Reset filters
	const resetFilters = () => {
		setFilters({
			comfort: "all",
			noise: "all",
			wifi: "all",
			ambiance: "all",
		});
		setCafesList(cafes);
	};

	return (
		<>
			<Layout>
				<div className='min-h-screen bg-gradient-to-br from-slate-50 to-purple-50'>
					<div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6'>
						{/* Header */}
						<div className='mb-6 sm:mb-8'>
							<h1 className='text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2'>
								Cafes Scouting
							</h1>
							<p className='text-sm sm:text-base text-gray-600'>
								Find the perfect cafe for your work-and-date
								sessions
							</p>
						</div>

						{/* Search Bar */}
						<div className='mb-6'>
							<Input
								placeholder='Enter your location (e.g., District 1, HCMC)'
								value={location}
								onChange={(e) => {
									setLocation(e.target.value);
									findVenues(e.target.value);
								}}
								startDecorator={<Search />}
								endDecorator={
									<LocationOn sx={{ color: "#a855f7" }} />
								}
								sx={{
									"--Input-focusedThickness": "2px",
									"--Input-focusedHighlight": "#a855f7",
									fontSize: { xs: "0.875rem", sm: "1rem" },
									padding: {
										xs: "10px 12px",
										sm: "12px 16px",
									},
									borderRadius: "12px",
									border: "2px solid #e5e7eb",
									"&:hover": { borderColor: "#d1d5db" },
								}}
							/>
						</div>

						{/* Filter Settings */}
						<Card
							variant='outlined'
							sx={{
								mb: 2,
								border: "1px solid #e5e7eb",
								borderRadius: "12px",
								p: 3,
							}}
						>
							<div className='flex justify-between items-center mb-2'>
								<h3 className='text-lg font-semibold text-gray-900'>
									Filters
								</h3>
								<Chip
									size='sm'
									variant='soft'
									onClick={resetFilters}
									sx={{
										cursor: "pointer",
										backgroundColor: "var(--color-red-500)",
									}}
								>
									Reset All
								</Chip>
							</div>

							{/* Filter Option Setting */}
							<div className='grid grid-cols-4 gap-4'>
								{Object.entries(FILTER_OPTIONS).map(
									([key, config]) => (
										<>
											<div>
												<label className='text-md font-medium text-gray-700 mb-2 block'>
													{config.label}
												</label>
												<div key={key}>
													<Select
														value={
															filters[
																key as keyof typeof filters
															]
														}
														onChange={(
															e,
															newValue
														) =>
															handleFilterChange(
																key as keyof typeof filters,
																newValue as string
															)
														}
														placeholder={`${
															config.label
														}: ${getFilterLabel(
															key as keyof typeof filters
														)}`}
														sx={{
															borderRadius:
																"12px",
															border: "2px solid #e5e7eb",
															"&:hover": {
																borderColor:
																	"#d1d5db",
															},
														}}
													>
														{config.options.map(
															(option) => (
																<Option
																	key={
																		option.value
																	}
																	value={
																		option.value
																	}
																>
																	{
																		option.label
																	}
																</Option>
															)
														)}
													</Select>
												</div>
											</div>
										</>
									)
								)}
							</div>

							<div className='mt-4 flex justify-end'>
								<button
									onClick={applyFilters}
									className='px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
								>
									Apply Filters
								</button>
							</div>
						</Card>

						{/* Main Content Grid */}
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
							{/* Left Side - Cafe List */}
							<div>
								<h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4'>
									Nearby Cafes ({cafesList.length})
								</h2>

								{/* Scrollable area */}
								<div className='h-[600px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100'>
									{cafesList.map((cafe) => (
										<Card
											key={cafe.id}
											variant='outlined'
											onClick={() =>
												setSelectedCafe(cafe)
											}
											sx={{
												cursor: "pointer",
												transition: "all 0.2s",
												border:
													selectedCafe?.id === cafe.id
														? "2px solid #a855f7"
														: "1px solid #e5e7eb",
												backgroundColor:
													selectedCafe?.id === cafe.id
														? "#faf5ff"
														: "white",
												"&:hover": {
													borderColor: "#a855f7",
													transform:
														"translateY(-2px)",
													boxShadow:
														"0 4px 12px rgba(168, 85, 247, 0.2)",
												},
											}}
										>
											<div className='flex flex-col sm:flex-row justify-between gap-3'>
												<div className='flex-1'>
													<h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-1'>
														{cafe.name}
													</h3>
													<div className='flex items-center gap-1 text-xs sm:text-sm text-gray-600 mb-2'>
														<LocationOn
															sx={{
																fontSize:
																	"1rem",
															}}
														/>
														<span>
															{cafe.address}
														</span>
													</div>
													<div className='flex items-center gap-3 flex-wrap'>
														<div className='flex items-center gap-1'>
															<Star
																sx={{
																	fontSize:
																		"1rem",
																	color: "#fbbf24",
																}}
															/>
															<span className='text-xs sm:text-sm font-medium'>
																{cafe.rating}
															</span>
															<span className='text-xs text-gray-500'>
																({cafe.reviews})
															</span>
														</div>
														<Chip
															size='sm'
															variant='soft'
															color='success'
														>
															{cafe.distance}
														</Chip>
													</div>
												</div>
											</div>
										</Card>
									))}
								</div>
							</div>

							{/* Right Side - Cafe Details */}
							<div className='lg:sticky lg:top-24 h-fit'>
								{selectedCafe ? (
									<Card
										variant='outlined'
										sx={{
											border: "1px solid #e5e7eb",
											borderRadius: "16px",
										}}
									>
										<div className='mb-4'>
											<h2 className='text-xl sm:text-2xl font-bold text-gray-900 mb-2'>
												{selectedCafe.name}
											</h2>
											<div className='flex items-center gap-2 mb-3'>
												<Star
													sx={{
														fontSize: "1.25rem",
														color: "#fbbf24",
													}}
												/>
												<span className='text-lg font-semibold'>
													{selectedCafe.rating}
												</span>
												<span className='text-sm text-gray-500'>
													({selectedCafe.reviews}{" "}
													reviews)
												</span>
											</div>
										</div>

										<Tabs
											value={activeTab}
											onChange={(e, value) =>
												setActiveTab(value as number)
											}
										>
											<TabList>
												<Tab>Details</Tab>
												<Tab>
													<Map
														sx={{
															mr: 1,
															fontSize: "1rem",
														}}
													/>
													Map
												</Tab>
											</TabList>

											{/* Details Tab */}
											<TabPanel value={0}>
												<div className='space-y-4'>
													<div>
														<p className='text-sm text-gray-700 mb-4'>
															{
																selectedCafe.description
															}
														</p>
													</div>

													<div>
														<h3 className='text-sm font-semibold text-gray-900 mb-2'>
															Contact
														</h3>
														<div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
															<Phone
																sx={{
																	fontSize:
																		"1rem",
																}}
															/>
															<span>
																{
																	selectedCafe.phone
																}
															</span>
														</div>
														<div className='flex items-center gap-2 text-sm text-gray-600'>
															<Schedule
																sx={{
																	fontSize:
																		"1rem",
																}}
															/>
															<span>
																{
																	selectedCafe.hours
																}
															</span>
														</div>
													</div>

													<div className=''>
														<h3 className='text-sm font-semibold text-gray-900 mb-2'>
															Price
														</h3>
														<span className=''>
															<AttachMoney
																sx={{
																	fontSize:
																		"1rem",
																}}
															/>
															{selectedCafe.price}
														</span>
													</div>

													<div>
														<h3 className='text-sm font-semibold text-gray-900 mb-2'>
															Amenities
														</h3>
														<div className='flex flex-wrap gap-2'>
															{selectedCafe.amenities.map(
																(amenity) => (
																	<Chip
																		key={
																			amenity
																		}
																		size='sm'
																		variant='soft'
																		color='primary'
																		sx={{
																			backgroundColor:
																				"#f3e8ff",
																			color: "#7c3aed",
																		}}
																	>
																		{
																			amenity
																		}
																	</Chip>
																)
															)}
														</div>
													</div>

													<div>
														<h3 className='text-sm font-semibold text-gray-900 mb-2'>
															Location
														</h3>
														<div className='flex items-start gap-2 text-sm text-gray-600'>
															<LocationOn
																sx={{
																	fontSize:
																		"1rem",
																}}
															/>
															<span>
																{
																	selectedCafe.address
																}
															</span>
														</div>
													</div>
												</div>
											</TabPanel>

											{/* Map Tab */}
											<TabPanel value={1}>
												<div className='w-full h-[400px] rounded-lg overflow-hidden'>
													<iframe
														src={
															selectedCafe.mapUrl
														}
														width='100%'
														height='100%'
														style={{ border: 0 }}
														allowFullScreen
														loading='lazy'
														referrerPolicy='no-referrer-when-downgrade'
													></iframe>
												</div>
											</TabPanel>
										</Tabs>
									</Card>
								) : (
									<Card
										variant='outlined'
										sx={{
											border: "1px solid #e5e7eb",
											borderRadius: "16px",
											minHeight: "400px",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<div className='text-center text-gray-500'>
											<LocationOn
												sx={{
													fontSize: "4rem",
													color: "#d1d5db",
													mb: 2,
												}}
											/>
											<p className='text-sm'>
												Select a cafe to view details
												and map
											</p>
										</div>
									</Card>
								)}
							</div>
						</div>
					</div>
				</div>
			</Layout>
		</>
	);
}

export default VenuesFindingPage;
