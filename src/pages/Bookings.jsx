import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAllBookingsQuery } from '../redux/apiSlice';
import { Calendar, User, MapPin, CheckCircle, Clock, XCircle, DollarSign, Eye, Search } from 'lucide-react';
import { format } from 'date-fns';


const BookingsSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 w-full md:w-64 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="p-4">
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                            <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-8 w-24 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const Bookings = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const { data, isLoading, isError } = useGetAllBookingsQuery({ search: searchTerm, page, limit });
    const bookings = data?.data || [];

    // Reset page when search changes
    React.useEffect(() => {
        setPage(1);
    }, [searchTerm, limit]);

    const getStatusBadge = (status) => {
        const styles = {
            confirmed: "bg-green-100 text-green-700 border-green-200",
            pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            cancelled: "bg-red-100 text-red-700 border-red-200",
            completed: "bg-blue-100 text-blue-700 border-blue-200"
        };
        const icons = {
            confirmed: <CheckCircle size={14} className="mr-1" />,
            pending: <Clock size={14} className="mr-1" />,
            cancelled: <XCircle size={14} className="mr-1" />,
            completed: <CheckCircle size={14} className="mr-1" />
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center w-fit ${styles[status] || styles.pending}`}>
                {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (isLoading) return <BookingsSkeleton />;

    if (isError) return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            Error loading bookings. Please try again later.
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">All Bookings</h2>
                    <div className="text-sm text-gray-500">
                        Total: <span className="font-bold text-gray-900">{data?.totalBookings || 0}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex-1 md:flex-none flex items-center px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search by ID, User, Car..."
                            className="bg-transparent outline-none text-sm w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-semibold">Booking ID</th>
                            <th className="p-4 font-semibold">User</th>
                            <th className="p-4 font-semibold">Car Details</th>
                            <th className="p-4 font-semibold">Trip Dates</th>
                            <th className="p-4 font-semibold">Amount</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings.map((booking) => (
                            <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-mono text-xs text-gray-500">
                                    {booking._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="p-4">
                                    {booking.user ? (
                                        <Link
                                            to={`/users/${booking.user._id}`}
                                            className="flex items-center gap-3 group hover:bg-gray-100 p-2 -m-2 rounded-lg transition-colors"
                                            title="View User Profile"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs group-hover:bg-blue-200 transition-colors">
                                                {booking.user.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-blue-600 group-hover:underline">
                                                    {booking.user.name || 'Unknown'}
                                                </div>
                                                <div className="text-xs text-gray-500">{booking.user.email}</div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-3 opacity-50">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">
                                                U
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">User Deleted</div>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={booking.car.thumbnail}
                                            alt="Car"
                                            className="w-10 h-10 rounded-md object-fit bg-gray-100"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/40?text=Car'}
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Car Deleted'}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono">
                                                {booking.car?.registrationNumber || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm text-gray-900 flex items-center gap-1">
                                        <Calendar size={14} className="text-gray-400" />
                                        {format(new Date(booking.startDate), 'MMM dd')} - {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5 ml-5">
                                        {Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} Days
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-gray-900">₹{booking.totalPrice}</div>
                                    <div className="text-xs text-green-600 flex items-center gap-1">
                                        {booking.payment?.status === 'success' ? 'Paid' : 'Pending'}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(booking.status)}
                                </td>
                                <td className="p-4 text-center">
                                    <Link
                                        to={`/bookings/${booking._id}`}
                                        className="inline-flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {bookings.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    No bookings found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination & Limit Controls */}
            {data?.totalBookings > 0 && (
                <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <span>Showing {bookings.length} of {data?.totalBookings} bookings</span>

                        <div className="flex items-center gap-2">
                            <span>Rows per page:</span>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500 bg-white cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-medium">
                            Page {page} of {data?.totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(data?.totalPages || 1, p + 1))}
                            disabled={page >= (data?.totalPages || 1)}
                            className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
