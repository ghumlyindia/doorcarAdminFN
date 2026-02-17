import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetBookingByIdQuery } from '../redux/apiSlice';
import {
    Calendar, User, MapPin, CheckCircle, XCircle, Clock,
    ArrowLeft, Mail, Phone, Car, CreditCard, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';


const BookingDetailsSkeleton = () => (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse p-6">
        <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <div>
                    <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-x divide-gray-100">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-6 space-y-6">
                        <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>
                        <div className="space-y-4">
                            {[...Array(4)].map((_, j) => (
                                <div key={j}>
                                    <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-5 w-full bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, error } = useGetBookingByIdQuery(id);
    const booking = data?.data;

    // Use for future implementation of status updates
    // const [updateStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();

    if (isLoading) return <BookingDetailsSkeleton />;

    if (error || !booking) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-red-600">
            <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
            <p className="text-gray-500 mb-6">The booking you are looking for does not exist or has been deleted.</p>
            <button
                onClick={() => navigate('/bookings')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Back to Bookings
            </button>
        </div>
    );

    const getStatusBadge = (status) => {
        const styles = {
            confirmed: "bg-green-100 text-green-700 border-green-200",
            pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            cancelled: "bg-red-100 text-red-700 border-red-200",
            completed: "bg-blue-100 text-blue-700 border-blue-200"
        };
        return (
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border capitalize ${styles[status] || styles.pending}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button
                    onClick={() => navigate('/bookings')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Bookings
                </button>
                <div className="flex gap-3">
                    {/* Placeholder for future actions */}
                    {/* <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">Cancel Booking</button> */}
                </div>
            </div>

            {/* Main Content Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Booking #{booking._id.slice(-6).toUpperCase()}</h1>
                        <p className="text-gray-500 text-sm">Created on {format(new Date(booking.createdAt), 'PPpp')}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                    {/* Column 1: Trip Details */}
                    <div className="p-6 space-y-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={16} /> Trip Details
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                    <Clock size={16} className="text-green-500" />
                                    {format(new Date(booking.startDate), 'PPP p')}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">End Date</label>
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                    <Clock size={16} className="text-red-500" />
                                    {format(new Date(booking.endDate), 'PPP p')}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Duration</label>
                                <div className="font-medium text-gray-900">
                                    {Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} Days
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Pickup Information</label>
                                <div className="font-medium text-gray-900 flex items-start gap-2">
                                    <MapPin size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                    <span>{booking.address || booking.car.city}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Customer & Payment */}
                    <div className="p-6 space-y-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <User size={16} /> Customer & Payment
                        </h3>

                        <div className="space-y-6">
                            {/* Customer */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {booking.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{booking.user?.name || 'Unknown User'}</div>
                                    <div className="text-xs text-gray-500">ID: {booking.user?._id}</div>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail size={14} /> {booking.user?.email}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone size={14} /> {booking.user?.phone || 'No phone provided'}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Payment */}
                            <div>
                                <label className="text-xs text-gray-500 block mb-2">Payment Summary</label>
                                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Amount</span>
                                        <span className="font-bold text-gray-900">₹{booking.totalPrice}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Status</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${booking.payment?.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {booking.payment?.status?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-mono mt-1 break-all">
                                        Tx: {booking.payment?.razorpayPaymentId}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Vehicle Info */}
                    <div className="p-6 space-y-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Car size={16} /> Vehicle Information
                        </h3>

                        {booking.car ? (
                            <div className="space-y-4">
                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={booking.car.thumbnail || 'https://via.placeholder.com/400x200?text=Car'}
                                        alt="Car"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{booking.car.brand} {booking.car.model}</h4>
                                    <p className="text-gray-500 text-sm">{booking.car.year} • {booking.car.registrationNumber}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200">
                                        {booking.car.city}
                                    </span>
                                    {/* Add more tags if needed */}
                                </div>
                                <button
                                    onClick={() => navigate(`/cars/${booking.car._id}`)}
                                    className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
                                >
                                    View Full Car Details
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <Car size={32} className="mx-auto mb-2 opacity-50" />
                                <p>Car information is unavailable</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
