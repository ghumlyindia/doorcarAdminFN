import React from 'react';
import { useGetDashboardStatsQuery } from '../redux/apiSlice';
import { Users, Car, Calendar, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import { useState } from 'react';

const StatCard = ({ icon: Icon, label, value, color, iconColor }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-yellow-200 transition-all duration-300 group">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
                <h3 className="text-3xl font-bold text-gray-800 group-hover:text-yellow-600 transition-colors">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={iconColor} size={24} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [dateRange, setDateRange] = useState({
        startDate: subDays(new Date(), 30).toISOString(), // Default Last 30 Days
        endDate: new Date().toISOString()
    });
    const [selectedPreset, setSelectedPreset] = useState('last30');

    const { data, isLoading, isError } = useGetDashboardStatsQuery(dateRange);
    const stats = data?.data;

    const handlePresetChange = (preset) => {
        setSelectedPreset(preset);
        const today = new Date();
        let start, end = today;

        switch (preset) {
            case 'today':
                start = new Date(today.setHours(0, 0, 0, 0));
                break;
            case 'yesterday':
                start = subDays(today, 1);
                end = subDays(today, 1);
                end.setHours(23, 59, 59, 999);
                start.setHours(0, 0, 0, 0);
                break;
            case 'last7':
                start = subDays(today, 7);
                break;
            case 'last30':
                start = subDays(today, 30);
                break;
            case 'thisMonth':
                start = startOfMonth(today);
                break;
            case 'lastMonth':
                start = startOfMonth(subMonths(today, 1));
                end = endOfMonth(subMonths(today, 1));
                break;
            case 'custom':
                return; // Do nothing, let user pick dates
            default:
                start = subDays(today, 30);
        }

        setDateRange({
            startDate: start.toISOString(),
            endDate: end.toISOString()
        });
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (isError) return (
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl">
            Error loading dashboard data. Please try again.
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <select
                        value={selectedPreset}
                        onChange={(e) => handlePresetChange(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-400 block p-2.5 outline-none"
                    >
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="last7">Last 7 Days</option>
                        <option value="last30">Last 30 Days</option>
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                        {/* <option value="custom">Custom Range</option> */}
                    </select>

                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-yellow-200">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        <span className="text-sm font-medium text-gray-600">System Online</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    label="Total Users"
                    value={stats?.totalUsers || 0}
                    color="bg-gradient-to-br from-yellow-400 to-yellow-500"
                    iconColor="text-gray-900"
                />
                <StatCard
                    icon={Car}
                    label="Total Fleet"
                    value={stats?.totalCars || 0}
                    color="bg-gradient-to-br from-yellow-400 to-yellow-500"
                    iconColor="text-gray-900"
                />
                <StatCard
                    icon={Calendar}
                    label="Active Bookings"
                    value={stats?.activeBookings || 0}
                    color="bg-gradient-to-br from-amber-400 to-orange-500"
                    iconColor="text-white"
                />
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                    color="bg-gradient-to-br from-emerald-400 to-green-500"
                    iconColor="text-white"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Activity size={20} className="text-yellow-500" /> Revenue Analytics
                        </h3>
                        <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md capitalize">
                            {selectedPreset === 'last7' ? 'Last 7 Days' :
                                selectedPreset === 'last30' ? 'Last 30 Days' :
                                    selectedPreset === 'thisMonth' ? 'This Month' :
                                        selectedPreset === 'lastMonth' ? 'Last Month' :
                                            selectedPreset === 'today' ? 'Today' :
                                                selectedPreset === 'yesterday' ? 'Yesterday' : 'Custom Range'}
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        {stats?.revenueChart && stats.revenueChart.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.revenueChart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickFormatter={(value) => `₹${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#FBBF24"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No data available for chart
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-yellow-500" /> Recent Activity
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((booking) => (
                                <div key={booking._id} className="flex items-start gap-3 p-3 hover:bg-yellow-50 rounded-xl transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shrink-0 text-gray-900 font-bold text-xs ring-2 ring-white shadow-md">
                                        {booking.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                            {booking.user?.name || 'Unknown User'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Booked for <span className="font-medium text-gray-700">₹{booking.totalPrice}</span>
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            {format(new Date(booking.createdAt), 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${booking.status === 'confirmed' ? 'bg-green-500' : booking.status === 'completed' ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-10">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
