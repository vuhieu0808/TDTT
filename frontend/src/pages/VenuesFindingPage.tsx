import { useState, useEffect } from "react";
import { venueServices } from "@/services/venueServices";
import type { Venue, VenueFilter } from "@/types/venue";
import { useAuthStore } from "@/stores/useAuthStore";
import Layout from "@/components/Layout";
import {
	Search,
	LocationOn,
	Star,
	Phone,
	Schedule,
	Map,
	AttachMoney,
	Language,
	Sort, // Add this import
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
	CircularProgress,
	Checkbox,
	Button,
	Menu,
	MenuItem,
} from "@mui/joy";

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
	interior: {
		label: "Interior",
		options: [
			{ value: "all", label: "All", numericValue: null },
			{ value: "0", label: "Basic", numericValue: 0 },
			{ value: "1", label: "Modern", numericValue: 1 },
			{ value: "2", label: "Luxurious", numericValue: 2 },
		],
	},
	view: {
		label: "View",
		options: [
			{ value: "all", label: "All", numericValue: null },
			{ value: "0", label: "No View", numericValue: 0 },
			{ value: "1", label: "Street View", numericValue: 1 },
			{ value: "2", label: "Scenic", numericValue: 2 },
		],
	},
	staffInteraction: {
		label: "Staff Interaction",
		options: [
			{ value: "all", label: "All", numericValue: null },
			{ value: "0", label: "Minimal", numericValue: 0 },
			{ value: "1", label: "Friendly", numericValue: 1 },
			{ value: "2", label: "Attentive", numericValue: 2 },
		],
	},
};

function VenuesFindingPage() {
	const { userProfile } = useAuthStore();
	const [location, setLocation] = useState("");
	const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
	const [activeTab, setActiveTab] = useState(0);
	const [allVenues, setAllVenues] = useState<Venue[]>([]);
	const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState<string>("rating-desc");

	// Filter state with arrays for multiple selections
	const [filters, setFilters] = useState({
		comfort: [] as number[],
		noise: [] as number[],
		interior: [] as number[],
		view: [] as number[],
		staffInteraction: [] as number[],
	});

	// Track which dropdown menu is open
	const [anchorEl, setAnchorEl] = useState<{
		[key: string]: HTMLElement | null;
	}>({
		comfort: null,
		noise: null,
		interior: null,
		view: null,
		staffInteraction: null,
	});

	// Fetch venues from Firebase on component mount
	useEffect(() => {
		const loadVenues = async () => {
			try {
				setLoading(true);

				// Pass filter arrays directly to backend
				const venueFilter: VenueFilter = {
					comfort: filters.comfort,
					noise: filters.noise,
					interior: filters.interior,
					view: filters.view,
					staffInteraction: filters.staffInteraction,
				};

				const venues = await venueServices.fetchVenues(
					(userProfile?.location && userProfile?.location.lat) || 0,
					(userProfile?.location && userProfile?.location.lng) || 0,
					venueFilter
				);

				console.log("Fetched venues:", venues);

				setAllVenues(sortVenues(venues, sortBy));
				setFilteredVenues(sortVenues(venues, sortBy));
			} catch (error) {
				console.error("Error fetching venues:", error);
			} finally {
				setLoading(false);
			}
		};

		loadVenues();
	}, []);

	// Filter venues by location search
	const findVenues = (searchLocation: string) => {
		if (searchLocation.trim() === "") {
			setFilteredVenues(allVenues);
		} else {
			const locationFiltered = allVenues.filter(
				(venue) =>
					venue.address
						.toLowerCase()
						.includes(searchLocation.toLowerCase()) ||
					venue.name
						.toLowerCase()
						.includes(searchLocation.toLowerCase())
			);
			setFilteredVenues(locationFiltered);
		}
	};

	// Handle checkbox toggle for filters
	const handleFilterChange = (
		filterKey: keyof typeof filters,
		value: number
	) => {
		setFilters((prev) => {
			const currentValues = prev[filterKey];
			const newValues = currentValues.includes(value)
				? currentValues.filter((v) => v !== value)
				: [...currentValues, value];
			return {
				...prev,
				[filterKey]: newValues,
			};
		});
	};

	// Handle toggle dropdown menu (open/close)
	const handleToggleMenu = (
		filterKey: string,
		event: React.MouseEvent<HTMLElement>
	) => {
		setAnchorEl((prev) => ({
			...prev,
			[filterKey]: prev[filterKey] ? null : event.currentTarget,
		}));
	};

	// Handle closing dropdown menu
	const handleCloseMenu = (filterKey: string) => {
		setAnchorEl((prev) => ({
			...prev,
			[filterKey]: null,
		}));
	};

	// Sort venues function
	const sortVenues = (venues: Venue[], sortOption: string): Venue[] => {
		const sorted = [...venues];

		switch (sortOption) {
			case "rating-desc":
				return sorted.sort((a, b) => b.ratingStar - a.ratingStar);
			case "rating-asc":
				return sorted.sort((a, b) => a.ratingStar - b.ratingStar);
			default:
				return sorted;
		}
	};

	// Handle sort change
	const handleSortChange = (newSortOption: string) => {
		setSortBy(newSortOption);
		const sorted = sortVenues(filteredVenues, newSortOption);
		setFilteredVenues(sorted);
	};

	// Apply filters - fetch from backend with selected filters
	const applyFilters = async () => {
		try {
			setLoading(true);
			setSelectedVenue(null);

			const venueFilter: VenueFilter = {
				comfort: filters.comfort,
				noise: filters.noise,
				interior: filters.interior,
				view: filters.view,
				staffInteraction: filters.staffInteraction,
			};

			const venues = await venueServices.fetchVenues(
				(userProfile?.location && userProfile?.location.lat) || 0,
				(userProfile?.location && userProfile?.location.lng) || 0,
				venueFilter
			);

			// Apply location filter on frontend if exists
			let filtered = venues;
			if (location.trim() !== "") {
				filtered = venues.filter(
					(venue) =>
						venue.address
							.toLowerCase()
							.includes(location.toLowerCase()) ||
						venue.name
							.toLowerCase()
							.includes(location.toLowerCase())
				);
			}

			const sortedVenues = sortVenues(filtered, sortBy);
			setAllVenues(sortedVenues);
			setFilteredVenues(sortedVenues);

			setAnchorEl({
				comfort: null,
				noise: null,
				interior: null,
				view: null,
				staffInteraction: null,
			});
		} catch (error) {
			console.error("Error applying filters:", error);
		} finally {
			setLoading(false);
		}
	};

	// Reset filters
	const resetFilters = async () => {
		// Close all dropdown menus first
		setAnchorEl({
			comfort: null,
			noise: null,
			interior: null,
			view: null,
			staffInteraction: null,
		});

		setFilters({
			comfort: [],
			noise: [],
			interior: [],
			view: [],
			staffInteraction: [],
		});
		setLocation("");
		setSelectedVenue(null);

		// Refetch all venues without filters
		try {
			setLoading(true);
			const venues = await venueServices.fetchVenues(
				(userProfile?.location && userProfile?.location.lat) || 0,
				(userProfile?.location && userProfile?.location.lng) || 0,
				{
					comfort: [],
					noise: [],
					interior: [],
					view: [],
					staffInteraction: [],
				}
			);
			const sortedVenues = sortVenues(venues, sortBy);
			setAllVenues(sortedVenues);
			setFilteredVenues(sortedVenues);
		} catch (error) {
			console.error("Error resetting filters:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<Layout>
				<div className='flex items-center justify-center min-h-screen'>
					<CircularProgress size='lg' />
				</div>
			</Layout>
		);
	}

	return (
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
							placeholder='Enter your location or cafe name'
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
								variant='solid'
								color='danger'
								onClick={resetFilters}
								sx={{
									cursor: "pointer",
									"&:hover": {
										backgroundColor: "#dc2626",
									},
								}}
							>
								Reset All
							</Chip>
						</div>

						{/* Filter Option Setting */}
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
							{Object.entries(FILTER_OPTIONS).map(
								([key, config]) => {
									const hasSelections =
										filters[key as keyof typeof filters]
											.length > 0;
									return (
										<div key={key}>
											<label className='text-md font-medium text-gray-700 mb-2 block'>
												{config.label}
											</label>
											<Button
												variant='outlined'
												onClick={(e) =>
													handleToggleMenu(key, e)
												}
												fullWidth
												sx={{
													justifyContent:
														"space-between",
													borderRadius: "8px",
													border: hasSelections
														? "2px solid #a855f7"
														: "2px solid #e5e7eb",
													backgroundColor:
														hasSelections
															? "#faf5ff"
															: "white",
													color: hasSelections
														? "#a855f7"
														: "#374151",
													fontWeight: hasSelections
														? 600
														: 400,
													"&:hover": {
														borderColor: "#a855f7",
														backgroundColor:
															"#faf5ff",
													},
												}}
											>
												<span>
													{hasSelections
														? `Selected (${
																filters[
																	key as keyof typeof filters
																].length
														  })`
														: "Select options"}
												</span>
												<span>▼</span>
											</Button>
											<Menu
												anchorEl={anchorEl[key]}
												open={Boolean(anchorEl[key])}
												onClose={() =>
													handleCloseMenu(key)
												}
												placement='bottom-start'
												disablePortal={false}
												sx={{
													minWidth: "200px",
													maxHeight: "300px",
													overflowY: "auto",
												}}
											>
												{config.options
													.filter(
														(option) =>
															option.numericValue !==
															null
													)
													.map((option) => (
														<MenuItem
															key={option.value}
															onClick={() =>
																handleFilterChange(
																	key as keyof typeof filters,
																	option.numericValue as number
																)
															}
															sx={{
																display: "flex",
																alignItems:
																	"center",
																gap: 1,
																py: 1,
															}}
														>
															<Checkbox
																checked={filters[
																	key as keyof typeof filters
																].includes(
																	option.numericValue as number
																)}
																size='sm'
																readOnly
																sx={{
																	pointerEvents:
																		"none",
																}}
															/>
															<span>
																{option.label}
															</span>
														</MenuItem>
													))}
											</Menu>
										</div>
									);
								}
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
						{/* Left Side - Venue List */}
						<div>
							{/* Header with Sort */}
							<div className='flex items-center justify-between mb-4'>
								<h2 className='text-lg sm:text-xl font-semibold text-gray-900'>
									Nearby Cafes ({filteredVenues.length})
								</h2>

								{/* Sort Dropdown */}
								<Select
									value={sortBy}
									onChange={(e, newValue) =>
										handleSortChange(newValue as string)
									}
									startDecorator={<Sort />}
									size='sm'
									sx={{
										minWidth: "180px",
										borderRadius: "8px",
										border: "1px solid #e5e7eb",
										"&:hover": {
											borderColor: "#a855f7",
										},
									}}
								>
									<Option value='rating-desc'>
										Rating: High to Low
									</Option>
									<Option value='rating-asc'>
										Rating: Low to High
									</Option>
								</Select>
							</div>

							{/* Scrollable area */}
							<div className='h-[600px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100'>
								{filteredVenues.length === 0 ? (
									<Card
										variant='outlined'
										sx={{
											border: "1px solid #e5e7eb",
											borderRadius: "12px",
											p: 4,
											textAlign: "center",
										}}
									>
										<p className='text-gray-500'>
											No venues found matching your
											criteria
										</p>
									</Card>
								) : (
									filteredVenues.map((venue, idx) => (
										<Card
											key={idx}
											variant='outlined'
											onClick={() =>
												setSelectedVenue(venue)
											}
											sx={{
												cursor: "pointer",
												transition: "all 0.2s",
												border:
													selectedVenue?.name ===
													venue.name
														? "2px solid #a855f7"
														: "1px solid #e5e7eb",
												backgroundColor:
													selectedVenue?.name ===
													venue.name
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
														{venue.name}
													</h3>
													<div className='flex items-center gap-1 text-xs sm:text-sm text-gray-600 mb-2'>
														<LocationOn
															sx={{
																fontSize:
																	"1rem",
															}}
														/>
														<span>
															{venue.address}
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
																{
																	venue.ratingStar
																}
															</span>
															<span className='text-xs text-gray-500'>
																(
																{
																	venue.ratingCount
																}
																)
															</span>
														</div>
													</div>
												</div>
											</div>
										</Card>
									))
								)}
							</div>
						</div>

						{/* Right Side - Venue Details */}
						<div className='lg:sticky lg:top-24 h-fit'>
							{selectedVenue ? (
								<Card
									variant='outlined'
									sx={{
										border: "1px solid #e5e7eb",
										borderRadius: "16px",
									}}
								>
									<div className='mb-4'>
										<h2 className='text-xl sm:text-2xl font-bold text-gray-900 mb-2'>
											{selectedVenue.name}
										</h2>
										<div className='flex items-center gap-2 mb-3'>
											<Star
												sx={{
													fontSize: "1.25rem",
													color: "#fbbf24",
												}}
											/>
											<span className='text-lg font-semibold'>
												{selectedVenue.ratingStar}
											</span>
											<span className='text-sm text-gray-500'>
												({selectedVenue.ratingCount}{" "}
												ratings)
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
														{selectedVenue.description ||
															"No description available"}
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
															{selectedVenue.phonecall ||
																"N/A"}
														</span>
													</div>
													<div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
														<Schedule
															sx={{
																fontSize:
																	"1rem",
															}}
														/>
														<span>
															{selectedVenue.openingHours ||
																"N/A"}
														</span>
													</div>
													{selectedVenue.website && (
														<div className='flex items-center gap-2 text-sm text-gray-600'>
															<Language
																sx={{
																	fontSize:
																		"1rem",
																}}
															/>
															<a
																href={
																	selectedVenue.website
																}
																target='_blank'
																rel='noopener noreferrer'
																className='text-purple-600 hover:underline'
															>
																Website
															</a>
														</div>
													)}
												</div>

												<div>
													<h3 className='text-sm font-semibold text-gray-900 mb-2'>
														Price Range
													</h3>
													<span className='flex items-center'>
														<AttachMoney
															sx={{
																fontSize:
																	"1rem",
															}}
														/>
														{selectedVenue.price ||
															"N/A"}
													</span>
												</div>

												<div>
													<h3 className='text-sm font-semibold text-gray-900 mb-2'>
														Attributes
													</h3>
													<div className='grid grid-cols-2 gap-2'>
														<Chip
															size='sm'
															variant='soft'
															color='primary'
														>
															Comfort:{" "}
															{FILTER_OPTIONS.comfort.options.find(
																(opt) =>
																	opt.numericValue ===
																	selectedVenue
																		.attributes
																		.comfort
															)?.label ||
																selectedVenue
																	.attributes
																	.comfort}
														</Chip>
														<Chip
															size='sm'
															variant='soft'
															color='primary'
														>
															Noise:{" "}
															{FILTER_OPTIONS.noise.options.find(
																(opt) =>
																	opt.numericValue ===
																	selectedVenue
																		.attributes
																		.noise
															)?.label ||
																selectedVenue
																	.attributes
																	.noise}
														</Chip>
														<Chip
															size='sm'
															variant='soft'
															color='primary'
														>
															Interior:{" "}
															{FILTER_OPTIONS.interior.options.find(
																(opt) =>
																	opt.numericValue ===
																	selectedVenue
																		.attributes
																		.interior
															)?.label ||
																selectedVenue
																	.attributes
																	.interior}
														</Chip>
														<Chip
															size='sm'
															variant='soft'
															color='primary'
														>
															View:{" "}
															{FILTER_OPTIONS.view.options.find(
																(opt) =>
																	opt.numericValue ===
																	selectedVenue
																		.attributes
																		.view
															)?.label ||
																selectedVenue
																	.attributes
																	.view}
														</Chip>
														<Chip
															size='sm'
															variant='soft'
															color='primary'
														>
															Staff Interaction:{" "}
															{FILTER_OPTIONS.staffInteraction.options.find(
																(opt) =>
																	opt.numericValue ===
																	selectedVenue
																		.attributes
																		.staffInteraction
															)?.label ||
																selectedVenue
																	.attributes
																	.staffInteraction}
														</Chip>
													</div>
												</div>

												{selectedVenue.menu &&
													selectedVenue.menu.length >
														0 && (
														<div>
															<h3 className='text-sm font-semibold text-gray-900 mb-2'>
																Menu Items
															</h3>
															<div className='flex flex-wrap gap-2'>
																{selectedVenue.menu.map(
																	(
																		item,
																		idx
																	) => (
																		<Chip
																			key={
																				idx
																			}
																			size='sm'
																			variant='outlined'
																		>
																			{
																				item
																			}
																		</Chip>
																	)
																)}
															</div>
														</div>
													)}

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
																selectedVenue.address
															}
														</span>
													</div>
													<div className='text-xs text-gray-500 mt-1'>
														Lat:{" "}
														{
															selectedVenue
																.location.lat
														}
														, Lng:{" "}
														{
															selectedVenue
																.location.lng
														}
													</div>
												</div>
											</div>
										</TabPanel>

										{/* Map Tab */}
										<TabPanel value={1}>
											<div className='w-full h-[400px] rounded-lg overflow-hidden'>
												{selectedVenue.mapEmbeddingUrl ? (
													<iframe
														src={
															selectedVenue.mapEmbeddingUrl
														}
														width='100%'
														height='100%'
														style={{ border: 0 }}
														allowFullScreen
														loading='lazy'
														referrerPolicy='no-referrer-when-downgrade'
													></iframe>
												) : (
													<div className='flex items-center justify-center h-full bg-gray-100'>
														<p className='text-gray-500'>
															Map not available
														</p>
													</div>
												)}
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
											Select a cafe to view details and
											map
										</p>
									</div>
								</Card>
							)}
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default VenuesFindingPage;
