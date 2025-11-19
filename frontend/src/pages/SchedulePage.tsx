import { useAuthStore } from '@/stores/useAuthStore'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { ResponsiveCalendar } from '@nivo/calendar'

import WorkloadData from '@/data/WorkLoad.json'

import Layout from '@/components/Layout'
import './SchedulePage.css'

function SchedulePage() {

    const localizer = momentLocalizer(moment)

    return (<>
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
                <div className="max-w-7xl mx-auto p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            My Schedule
                        </h1>
                        <p className="text-gray-600">Manage your availability and work-date sessions</p>
                    </div>

                    {/* Big Calendar */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Weekly Calendar</h2>
                        <div className="calendar-container">
                            <Calendar
                                localizer={localizer}
                                events={[]}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: 600 }}
                            />
                        </div>
                    </div>

                    {/* Nivo Calendar */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Yearly Overview</h2>
                        <div className="h-80">
                            <ResponsiveCalendar
                                data={WorkloadData}
                                from="2025-01-01"
                                to="2025-12-31"
                                emptyColor="#f3e8ff"
                                colors={['#fce7f3', '#f9a8d4', '#ec4899', '#db2777', '#9f1239']}
                                margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
                                yearSpacing={40}
                                monthBorderColor="#a955f742"
                                dayBorderWidth={2}
                                dayBorderColor="#ffffff"
                                monthLegendOffset={10}
                                theme={{
                                    text: {
                                        fontSize: 12,
                                        fontWeight: 'bold',
                                        fill: '#374151',
                                    },
                                    tooltip: {
                                        container: {
                                            background: '#a855f7',
                                            color: 'white',
                                            fontSize: 14,
                                            borderRadius: 8,
                                            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                                        },
                                    },
                                }}
                                legends={[
                                    {
                                        anchor: 'bottom-right',
                                        direction: 'row',
                                        translateY: 36,
                                        itemCount: 4,
                                        itemWidth: 42,
                                        itemHeight: 36,
                                        itemsSpacing: 14,
                                        itemDirection: 'right-to-left'
                                    }
                                ]}
                            />
                        </div>

                        {/* Color notation */}
                        <div className="mt-6 flex items-center justify-center gap-4">
                            <span className="text-sm font-semibold text-gray-700">Workload Intensity:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">Light</span>
                                <div className="flex h-6 w-[300px] rounded-lg overflow-hidden shadow-md">
                                    <div className="w-1/5 bg-pink-100"></div>
                                    <div className="w-1/5 bg-pink-300"></div>
                                    <div className="w-1/5 bg-pink-500"></div>
                                    <div className="w-1/5 bg-pink-700"></div>
                                    <div className="w-1/5 bg-pink-900"></div>
                                </div>
                                <span className="text-xs text-gray-600">Intense</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    </>)
}

export default SchedulePage;