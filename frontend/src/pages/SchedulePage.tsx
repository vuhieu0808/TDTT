import { useState } from "react";

// React big calendar import
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";

// Nivo timeline chart import
import { ResponsiveCalendar } from "@nivo/calendar";

// Data import
import EventsData from "@/data/Events.json";

import Layout from "@/components/Layout";
import "./SchedulePage.css";

import { CalendarToday } from "@mui/icons-material";

function SchedulePage() {
	const localizer = momentLocalizer(moment);
	const [date, setDate] = useState(new Date());
	const [view, setView] = useState<View>("month");
	const [text, setText] = useState<string>("Monthly");
	const [yearText, setYearText] = useState<number>(2025);

	// Parse events data from JSON
	const events = EventsData.map((event) => ({
		title: event.title,
		start: new Date(event.start),
		end: new Date(event.end),
	}));

	// Get workload data from imported events
	const getWorkloadData = () => {
		const taskCounts: { [key: string]: number } = {};

		events.forEach((event) => {
			const dateKey = moment(event.start).format("YYYY-MM-DD");
			taskCounts[dateKey] = (taskCounts[dateKey] || 0) + 1;
		});

		return Object.entries(taskCounts).map(([day, value]) => ({
			day,
			value,
		}));
	};

	const workloadData = getWorkloadData();

	const startTime = yearText.toString() + "-01-01";
	const endTime = yearText.toString() + "-12-31";

	const handleNavigate = (newDate: Date) => {
		console.log(newDate);
		setYearText(newDate.getFullYear());
		setDate(newDate);
	};
	const handleViewChange = (newView: View) => {
		console.log(newView);
		let viewText: string;
		switch (newView) {
			case "month":
				viewText = "Monthly";
				break;
			case "week":
				viewText = "Weekly";
				break;
			case "day":
				viewText = "Daily";
				break;
			default:
				viewText = "Monthly";
		}
		setText(viewText);
		setView(newView);
	};

	return (
		<>
			<Layout>
				<div className='min-h-screen bg-gradient-to-br from-slate-50 to-purple-50'>
					<div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6'>
						{/* Header */}
						<div className='mb-6 sm:mb-8'>
							<h1 className='text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2'>
								My Schedule
							</h1>
							<p className='text-sm sm:text-base text-gray-600'>
								Manage your availability and work-date sessions
							</p>
						</div>

						{/* Big Calendar */}
						<div className='bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-purple-100 mb-6 sm:mb-8'>
							<h2 className='text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2'>
								<CalendarToday
									sx={{
										fontSize: {
											xs: "1.2rem",
											sm: "1.5rem",
											md: "2rem",
										},
									}}
								/>
								<span className='truncate'>{text}</span>
							</h2>
							<div className='calendar-container overflow-x-auto'>
								<Calendar
									localizer={localizer}
									events={events}
									startAccessor='start'
									endAccessor='end'
									style={{ height: 700, minWidth: 300 }}
									view={view}
									date={date}
									onNavigate={handleNavigate}
									onView={handleViewChange}
								/>
							</div>
						</div>

						{/* Nivo Calendar */}
						<div className='bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-pink-100'>
							<h2 className='text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4'>
								Yearly Overview - {yearText}
							</h2>

							{/* Scrollable container with better touch interaction */}
							<div className='relative'>
								<div className='overflow-x-auto overflow-y-hidden -mx-3 px-3 sm:mx-0 sm:px-0'>
									<div
										style={{
											minWidth: "600px",
											height: "280px",
										}}
										className='sm:min-w-0 sm:h-64 md:h-80'
									>
										<ResponsiveCalendar
											data={workloadData}
											from={startTime}
											to={endTime}
											emptyColor='#f3e8ff'
											colors={[
												"#fce7f3",
												"#f9a8d4",
												"#ec4899",
												"#db2777",
												"#9f1239",
											]}
											margin={{
												top: 20,
												right: 10,
												bottom: 40,
												left: 10,
											}}
											yearSpacing={40}
											monthBorderColor='#a955f7'
											dayBorderWidth={2}
											dayBorderColor='#ffffff'
											monthLegendOffset={10}
											daySpacing={2}
											theme={{
												text: {
													fontSize: 11,
													fontWeight: "bold",
													fill: "#374151",
												},
												tooltip: {
													container: {
														background: "#a855f7",
														color: "white",
														fontSize: 13,
														borderRadius: 8,
														boxShadow:
															"0 4px 12px rgba(168, 85, 247, 0.3)",
														padding: "8px 12px",
													},
												},
											}}
											legends={[
												{
													anchor: "bottom",
													direction: "row",
													translateY: 36,
													itemCount: 5,
													itemWidth: 42,
													itemHeight: 18,
													itemsSpacing: 4,
													itemDirection:
														"left-to-right",
													symbolSize: 16,
												},
											]}
										/>
									</div>
								</div>

								{/* Scroll hint for mobile */}
								<div className='sm:hidden text-center mt-2'>
									<p className='text-xs text-gray-500 italic'>
										← Swipe to see more months →
									</p>
								</div>
							</div>

							{/* Color notation */}
							<div className='mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4'>
								<span className='text-xs sm:text-sm font-semibold text-gray-700'>
									Workload Intensity:
								</span>
								<div className='flex items-center gap-2'>
									<span className='text-[0.65rem] sm:text-xs text-gray-600'>
										Light
									</span>
									<div className='flex h-5 sm:h-6 w-48 sm:w-60 md:w-[300px] rounded-lg overflow-hidden shadow-md'>
										<div className='w-1/5 bg-pink-100'></div>
										<div className='w-1/5 bg-pink-300'></div>
										<div className='w-1/5 bg-pink-500'></div>
										<div className='w-1/5 bg-pink-700'></div>
										<div className='w-1/5 bg-pink-900'></div>
									</div>
									<span className='text-[0.65rem] sm:text-xs text-gray-600'>
										Intense
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Layout>
		</>
	);
}

export default SchedulePage;
