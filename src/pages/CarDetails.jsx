import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCarByIdQuery } from '../redux/apiSlice';
import { ArrowLeft, MapPin, DollarSign, CheckCircle, Car, Fuel, Settings, Calendar, ShieldCheck, Box, Edit, Users, Gauge, Activity, FileText, ChevronLeft, ChevronRight } from 'lucide-react';


const CarDetailsSkeleton = () => (
    <div className="max-w-7xl mx-auto p-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                    <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div className="flex gap-3">
                <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-xl"></div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-8">
                {/* Image Gallery Skeleton */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="h-96 w-full bg-gray-200 rounded-xl mb-4"></div>
                    <div className="grid grid-cols-6 gap-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>

                {/* Description Skeleton */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-6">
                {/* Pricing Card Skeleton */}
                <div className="bg-gray-100 rounded-2xl p-6 h-64"></div>

                {/* Specs Skeleton */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="h-6 w-32 bg-gray-200 rounded mb-6"></div>
                    <div className="space-y-3">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const CarDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, error } = useGetCarByIdQuery(id);
    const [selectedImage, setSelectedImage] = useState(0);

    const car = data?.data;

    // Combine thumbnail and additional images
    const allImages = car ? [
        { url: car.thumbnail, isMain: true },
        ...(car.images || [])
    ] : [];

    if (isLoading) return <CarDetailsSkeleton />;

    if (error || !car) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
            <p className="text-xl font-semibold mb-4">Car not found</p>
            <button onClick={() => navigate('/cars')} className="text-yellow-600 hover:text-yellow-700 font-medium hover:underline">Back to Fleet</button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/cars')} className="p-2 hover:bg-yellow-50 rounded-full transition-colors shadow-sm text-gray-600 hover:text-yellow-600 border border-gray-200">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            {car.brand} {car.model}
                            <span className="text-lg font-normal text-gray-500 bg-gradient-to-r from-yellow-50 to-yellow-100 px-3 py-1 rounded-full border border-yellow-200">{car.year}</span>
                        </h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${car.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            {car.isActive ? 'Active & Listed' : 'Inactive / Unlisted'}
                            <span className="text-gray-300">|</span>
                            ID: <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{car._id}</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(`/edit-car/${car._id}`)}
                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-yellow-500/20 transition-all active:scale-95"
                    >
                        <Edit size={18} />
                        Edit Car
                    </button>
                    <button onClick={() => navigate(`/add-car`)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors border border-gray-200">
                        Add New
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Images & Key Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Enhanced Image Gallery */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        {/* Main Image */}
                        <div className="relative mb-4 group overflow-hidden rounded-xl bg-gray-100">
                            <img
                                src={allImages[selectedImage]?.url || car.thumbnail}
                                alt={car.model}
                                className="w-full h-96 object-cover"
                            />

                            {/* Image Navigation Arrows */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImage(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <ChevronLeft size={20} className="text-gray-700" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <ChevronRight size={20} className="text-gray-700" />
                                    </button>
                                </>
                            )}

                            {/* Image Counter */}
                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                                {selectedImage + 1} / {allImages.length}
                            </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        {allImages.length > 1 && (
                            <div className="grid grid-cols-6 gap-2">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative w-full h-20 rounded-lg overflow-hidden transition-all ${selectedImage === idx
                                            ? 'ring-4 ring-yellow-400 scale-105'
                                            : 'ring-1 ring-gray-200 hover:ring-yellow-300 opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={img.url}
                                            className="w-full h-full object-cover"
                                            alt={`View ${idx + 1}`}
                                        />
                                        {img.isMain && (
                                            <div className="absolute top-1 left-1 bg-yellow-400 text-gray-900 text-xs px-1.5 py-0.5 rounded font-bold">
                                                Main
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="text-yellow-500" size={24} />
                            About this Vehicle
                        </h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{car.description || "No description provided."}</p>
                    </div>

                    {/* Pickup Locations */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <MapPin className="text-yellow-500" size={24} />
                            Location & Pickup Points
                        </h3>

                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Base Location</h4>
                            <p className="text-lg text-gray-800 font-medium">{car.area}, {car.city}</p>
                        </div>

                        {car.pickupLocations?.length > 0 ? (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Additional Pickup Points</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {car.pickupLocations.map((loc, i) => (
                                        <div key={i} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200 hover:border-yellow-300 transition-colors">
                                            <div className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                                <MapPin size={16} className="text-yellow-600" />
                                                {loc.name}
                                            </div>
                                            <div className="text-gray-600 text-sm mb-2">{loc.address}</div>
                                            <div className="flex gap-3 text-xs text-gray-500 font-mono bg-white p-2 rounded border border-yellow-100 inline-block">
                                                <span>Lat: {loc.coordinates?.lat}</span>
                                                <span>Lng: {loc.coordinates?.lng}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No additional pickup locations added.</p>
                        )}
                    </div>
                </div>

                {/* Right Column - Details & Pricing */}
                <div className="space-y-6">
                    {/* Pricing Card */}
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 text-gray-900 shadow-xl shadow-yellow-200">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <DollarSign size={20} />
                            Pricing Structure
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-yellow-600/30 pb-4">
                                <span className="font-medium">Daily Rate</span>
                                <span className="text-3xl font-bold">₹{car.pricing?.perDay}</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between bg-white/20 backdrop-blur-sm p-2 rounded">
                                    <span>Hourly Rate</span>
                                    <span className="font-semibold">₹{car.pricing?.perHour || '-'}</span>
                                </div>
                                <div className="flex justify-between bg-white/20 backdrop-blur-sm p-2 rounded">
                                    <span>Security Deposit</span>
                                    <span className="font-semibold">₹{car.securityDeposit}</span>
                                </div>
                                <div className="flex justify-between bg-white/20 backdrop-blur-sm p-2 rounded">
                                    <span>Free KM Limit</span>
                                    <span className="font-semibold">{car.pricing?.freeKmPerDay || 0} km/day</span>
                                </div>
                                <div className="flex justify-between bg-white/20 backdrop-blur-sm p-2 rounded">
                                    <span>Extra KM Charge</span>
                                    <span className="font-semibold">₹{car.pricing?.extraKmCharge || 0}/km</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Specifications */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Car className="text-yellow-500" size={20} />
                            Specifications
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-lg hover:from-yellow-50 hover:to-yellow-100 transition-colors border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Box size={18} className="text-yellow-600" />
                                    <span className="text-gray-600 text-sm">Variant</span>
                                </div>
                                <span className="font-semibold text-gray-900">{car.variant}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-lg hover:from-yellow-50 hover:to-yellow-100 transition-colors border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Car size={18} className="text-yellow-600" />
                                    <span className="text-gray-600 text-sm">Category</span>
                                </div>
                                <span className="font-semibold text-gray-900 capitalize">{car.category}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-lg hover:from-yellow-50 hover:to-yellow-100 transition-colors border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Fuel size={18} className="text-yellow-600" />
                                    <span className="text-gray-600 text-sm">Fuel Type</span>
                                </div>
                                <span className="font-semibold text-gray-900 capitalize">{car.fuelType}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-lg hover:from-yellow-50 hover:to-yellow-100 transition-colors border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Settings size={18} className="text-yellow-600" />
                                    <span className="text-gray-600 text-sm">Transmission</span>
                                </div>
                                <span className="font-semibold text-gray-900 capitalize">{car.transmission}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-lg hover:from-yellow-50 hover:to-yellow-100 transition-colors border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-yellow-600" />
                                    <span className="text-gray-600 text-sm">Year</span>
                                </div>
                                <span className="font-semibold text-gray-900">{car.year}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-lg hover:from-yellow-50 hover:to-yellow-100 transition-colors border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Users size={18} className="text-yellow-600" />
                                    <span className="text-gray-600 text-sm">Seats</span>
                                </div>
                                <span className="font-semibold text-gray-900">{car.seats} Persons</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-lg hover:from-yellow-50 hover:to-yellow-100 transition-colors border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Gauge size={18} className="text-yellow-600" />
                                    <span className="text-gray-600 text-sm">Mileage</span>
                                </div>
                                <span className="font-semibold text-gray-900">{car.mileage} km/l</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-lg hover:from-yellow-50 hover:to-yellow-100 transition-colors border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Activity size={18} className="text-yellow-600" />
                                    <span className="text-gray-600 text-sm">Total Driven</span>
                                </div>
                                <span className="font-semibold text-gray-900">{car.kmDriven} km</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-lg hover:from-yellow-50 hover:to-yellow-100 transition-colors border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-yellow-600" />
                                    <span className="text-gray-600 text-sm">Registration</span>
                                </div>
                                <span className="font-semibold text-gray-900 uppercase">{car.registrationNumber}</span>
                            </div>
                        </div>
                    </div>

                    {/* Features & Availability */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ShieldCheck className="text-yellow-500" size={20} />
                            Status & Features
                        </h3>

                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                                <span className="text-sm text-gray-700 font-medium">Current Status</span>
                                <span className="font-bold text-green-700 bg-green-200 px-3 py-1 rounded-full uppercase text-xs tracking-wide">
                                    {car.availability?.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Condition</span>
                                <span className="font-medium capitalize text-gray-800">{car.condition}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Bookable</span>
                                <span className={`font-bold px-3 py-1 rounded-full text-xs ${car.availability?.isAvailable
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}>
                                    {car.availability?.isAvailable ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>

                        {car.features?.length > 0 && (
                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Vehicle Features</h4>
                                <div className="flex flex-wrap gap-2">
                                    {car.features.map((feat, i) => (
                                        <span key={i} className="text-xs px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 text-gray-700 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors">
                                            {feat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Scheduled Bookings */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="text-yellow-500" size={20} />
                            Scheduled Bookings
                        </h3>

                        {car.availability?.bookedDates?.length > 0 ? (
                            <div className="space-y-3">
                                {car.availability.bookedDates.map((booking, index) => (
                                    <div key={index} className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200 hover:border-orange-300 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-semibold text-orange-800 uppercase tracking-wide">Booking ID</span>
                                            <span
                                                onClick={() => navigate(`/bookings/${booking.bookingId}`)}
                                                className="text-xs font-mono text-yellow-700 hover:text-yellow-900 cursor-pointer underline font-bold"
                                            >
                                                {booking.bookingId}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-700 space-y-1">
                                            <div className="flex justify-between bg-white/50 p-2 rounded">
                                                <span className="text-gray-600">From:</span>
                                                <span className="font-medium">
                                                    {new Date(booking.startDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                                    <span className="text-gray-400 text-xs ml-1">
                                                        {new Date(booking.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="flex justify-between bg-white/50 p-2 rounded">
                                                <span className="text-gray-600">To:</span>
                                                <span className="font-medium">
                                                    {new Date(booking.endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                                    <span className="text-gray-400 text-xs ml-1">
                                                        {new Date(booking.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-400">
                                <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No upcoming bookings scheduled.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarDetails;
