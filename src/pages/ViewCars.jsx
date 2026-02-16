import { useGetCarsQuery, useDeleteCarMutation } from '../redux/apiSlice';
import { Edit, Trash2, MapPin, Fuel, Settings, Plus, Search, Filter, Eye, LayoutGrid, List, SlidersHorizontal, Car, CheckSquare, Square, ArrowUpDown, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';

const ViewCars = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [selectedCars, setSelectedCars] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        category: 'all',
        availability: 'all',
        city: 'all',
        fuelType: 'all',
        transmission: 'all',
        sortBy: 'name-asc'
    });

    const { data, isLoading, error } = useGetCarsQuery({ search: debouncedSearch }, {
        refetchOnMountOrArgChange: true
    });
    const [deleteCar] = useDeleteCarMutation();
    const navigate = useNavigate();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (!data?.data) return null;

        const cars = data.data;
        const total = cars.length;
        const available = cars.filter(c => c.availability?.isAvailable).length;
        const unavailable = total - available;

        const categories = cars.reduce((acc, car) => {
            acc[car.category] = (acc[car.category] || 0) + 1;
            return acc;
        }, {});

        const avgPrice = cars.length > 0
            ? Math.round(cars.reduce((sum, car) => sum + (car.pricing?.perDay || car.price || 0), 0) / cars.length)
            : 0;

        return { total, available, unavailable, categories, avgPrice };
    }, [data?.data]);

    // Get unique values for filters
    const filterOptions = useMemo(() => {
        if (!data?.data) return { cities: [], categories: [], fuelTypes: [], transmissions: [] };

        const cars = data.data;
        return {
            cities: [...new Set(cars.map(c => c.city).filter(Boolean))],
            categories: [...new Set(cars.map(c => c.category).filter(Boolean))],
            fuelTypes: [...new Set(cars.map(c => c.fuelType).filter(Boolean))],
            transmissions: [...new Set(cars.map(c => c.transmission).filter(Boolean))]
        };
    }, [data?.data]);

    // Filter and sort cars
    const filteredCars = useMemo(() => {
        if (!data?.data) return [];

        let cars = [...data.data];

        // Apply filters
        if (filters.category !== 'all') {
            cars = cars.filter(c => c.category === filters.category);
        }
        if (filters.availability !== 'all') {
            const isAvailable = filters.availability === 'available';
            cars = cars.filter(c => c.availability?.isAvailable === isAvailable);
        }
        if (filters.city !== 'all') {
            cars = cars.filter(c => c.city === filters.city);
        }
        if (filters.fuelType !== 'all') {
            cars = cars.filter(c => c.fuelType === filters.fuelType);
        }
        if (filters.transmission !== 'all') {
            cars = cars.filter(c => c.transmission === filters.transmission);
        }

        // Apply sorting
        switch (filters.sortBy) {
            case 'name-asc':
                cars.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));
                break;
            case 'name-desc':
                cars.sort((a, b) => `${b.brand} ${b.model}`.localeCompare(`${a.brand} ${a.model}`));
                break;
            case 'price-asc':
                cars.sort((a, b) => (a.pricing?.perDay || a.price || 0) - (b.pricing?.perDay || b.price || 0));
                break;
            case 'price-desc':
                cars.sort((a, b) => (b.pricing?.perDay || b.price || 0) - (a.pricing?.perDay || a.price || 0));
                break;
            case 'year-new':
                cars.sort((a, b) => (b.year || 0) - (a.year || 0));
                break;
            case 'year-old':
                cars.sort((a, b) => (a.year || 0) - (b.year || 0));
                break;
            default:
                break;
        }

        return cars;
    }, [data?.data, filters]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this car?')) {
            try {
                await deleteCar(id).unwrap();
                toast.success('Car deleted successfully');
                setSelectedCars(prev => prev.filter(carId => carId !== id));
            } catch (err) {
                toast.error('Failed to delete car');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedCars.length === 0) return;

        if (window.confirm(`Delete ${selectedCars.length} cars? This action cannot be undone.`)) {
            try {
                await Promise.all(selectedCars.map(id => deleteCar(id).unwrap()));
                toast.success(`${selectedCars.length} cars deleted successfully`);
                setSelectedCars([]);
            } catch (err) {
                toast.error('Failed to delete some cars');
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedCars.length === filteredCars.length) {
            setSelectedCars([]);
        } else {
            setSelectedCars(filteredCars.map(car => car._id));
        }
    };

    const toggleCarSelection = (carId) => {
        setSelectedCars(prev =>
            prev.includes(carId) ? prev.filter(id => id !== carId) : [...prev, carId]
        );
    };

    const resetFilters = () => {
        setFilters({
            category: 'all',
            availability: 'all',
            city: 'all',
            fuelType: 'all',
            transmission: 'all',
            sortBy: 'name-asc'
        });
    };

    if (isLoading) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500">
            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading fleet...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center p-8 bg-red-50 rounded-xl border border-red-100 max-w-md">
                <div className="text-red-500 font-bold mb-2">Error loading cars</div>
                <p className="text-gray-600 text-sm">Please check your connection and try again.</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Fleet</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats?.total || 0}</h3>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                            <Car className="text-gray-900" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Available</p>
                            <h3 className="text-3xl font-bold text-green-600 mt-1">{stats?.available || 0}</h3>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckSquare className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Unavailable</p>
                            <h3 className="text-3xl font-bold text-red-600 mt-1">{stats?.unavailable || 0}</h3>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <X className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Avg. Price/Day</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">₹{stats?.avgPrice || 0}</h3>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">₹</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header Section with Search and Controls */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Car Management</h1>
                        <p className="text-gray-500 text-sm mt-1">{filteredCars.length} of {stats?.total || 0} cars</p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search */}
                        <div className="flex items-center px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-yellow-400 transition-all min-w-[250px]">
                            <Search size={18} className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search cars..."
                                className="bg-transparent outline-none text-sm flex-1"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${showFilters
                                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                                }`}
                        >
                            <SlidersHorizontal size={18} />
                            Filters
                        </button>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded transition-all ${viewMode === 'grid'
                                        ? 'bg-white shadow-sm text-yellow-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded transition-all ${viewMode === 'table'
                                        ? 'bg-white shadow-sm text-yellow-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        {/* Add Car Button */}
                        <button
                            onClick={() => navigate('/add-car')}
                            className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-yellow-500/20 transition-all active:scale-95"
                        >
                            <Plus size={20} />
                            Add New Car
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                            >
                                <option value="all">All Categories</option>
                                {filterOptions.categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <select
                                value={filters.availability}
                                onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                            >
                                <option value="all">All Status</option>
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>

                            <select
                                value={filters.city}
                                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                            >
                                <option value="all">All Cities</option>
                                {filterOptions.cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>

                            <select
                                value={filters.fuelType}
                                onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                            >
                                <option value="all">All Fuel Types</option>
                                {filterOptions.fuelTypes.map(fuel => (
                                    <option key={fuel} value={fuel}>{fuel}</option>
                                ))}
                            </select>

                            <select
                                value={filters.transmission}
                                onChange={(e) => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                            >
                                <option value="all">All Transmissions</option>
                                {filterOptions.transmissions.map(trans => (
                                    <option key={trans} value={trans}>{trans}</option>
                                ))}
                            </select>

                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                            >
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="price-asc">Price (Low to High)</option>
                                <option value="price-desc">Price (High to Low)</option>
                                <option value="year-new">Year (Newest)</option>
                                <option value="year-old">Year (Oldest)</option>
                            </select>

                            <div className="flex gap-2">
                                <button
                                    onClick={resetFilters}
                                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={toggleSelectAll}
                                    className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
                                >
                                    {selectedCars.length === filteredCars.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Actions */}
                {selectedCars.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">{selectedCars.length} car(s) selected</span>
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                            <Trash2 size={16} />
                            Delete Selected
                        </button>
                    </div>
                )}
            </div>

            {/* Grid/Table View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCars.map((car) => (
                        <div key={car._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            {/* Checkbox */}
                            <div className="absolute top-3 left-3 z-10">
                                <button
                                    onClick={() => toggleCarSelection(car._id)}
                                    className="w-6 h-6 rounded bg-white/90 backdrop-blur-sm border-2 border-gray-300 flex items-center justify-center hover:border-yellow-400 transition-colors"
                                >
                                    {selectedCars.includes(car._id) && (
                                        <CheckSquare size={16} className="text-yellow-600" />
                                    )}
                                </button>
                            </div>

                            {/* Image Area */}
                            <div className="relative h-48 overflow-hidden bg-gray-100">
                                <img
                                    src={car.thumbnail || 'https://via.placeholder.com/300'}
                                    alt={car.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
                                    <button onClick={() => navigate(`/cars/${car._id}`)} className="p-2 bg-white/90 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-lg backdrop-blur-sm transition-all">
                                        <Eye size={16} />
                                    </button>
                                    <button onClick={() => navigate(`/edit-car/${car._id}`)} className="p-2 bg-white/90 rounded-lg text-yellow-600 hover:bg-yellow-600 hover:text-white shadow-lg backdrop-blur-sm transition-all">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(car._id)}
                                        className="p-2 bg-white/90 rounded-lg text-red-600 hover:bg-red-600 hover:text-white shadow-lg backdrop-blur-sm transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="absolute bottom-3 left-3 bg-white/95 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-md shadow-md backdrop-blur-sm">
                                    ₹{car.pricing?.perDay || car.price}/day
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-yellow-600 transition-colors">{car.brand} {car.model}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{car.category}</span>
                                            <span className="text-xs text-gray-400">• {car.year}</span>
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full mt-1.5 ring-4 ring-opacity-20 ${car.availability?.isAvailable ? 'bg-green-500 ring-green-500' : 'bg-red-500 ring-red-500'}`}></div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5">
                                        <Fuel size={14} className="text-yellow-500" /> {car.fuelType}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Settings size={14} className="text-yellow-600" /> {car.transmission}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: car.color?.toLowerCase() }}></div> {car.color}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={14} className="text-red-500" /> {car.city}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <button onClick={toggleSelectAll} className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center hover:border-yellow-400">
                                            {selectedCars.length === filteredCars.length && filteredCars.length > 0 && (
                                                <CheckSquare size={16} className="text-yellow-600" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price/Day</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">City</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCars.map((car) => (
                                    <tr key={car._id} className="hover:bg-yellow-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggleCarSelection(car._id)}
                                                className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center hover:border-yellow-400"
                                            >
                                                {selectedCars.includes(car._id) && (
                                                    <CheckSquare size={16} className="text-yellow-600" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <img
                                                src={car.thumbnail || 'https://via.placeholder.com/80'}
                                                alt={car.name}
                                                className="w-16 h-12 object-cover rounded-lg"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-800">{car.brand} {car.model}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <Fuel size={12} /> {car.fuelType} • <Settings size={12} /> {car.transmission}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">{car.category}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{car.year}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-800">₹{car.pricing?.perDay || car.price}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{car.city}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${car.availability?.isAvailable
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${car.availability?.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {car.availability?.isAvailable ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => navigate(`/cars/${car._id}`)} className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded transition-colors">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => navigate(`/edit-car/${car._id}`)} className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded transition-colors">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(car._id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {filteredCars.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Car size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No cars found</h3>
                    <p className="text-gray-500 mb-6 max-w-xs text-center">
                        {searchTerm || Object.values(filters).some(v => v !== 'all' && v !== 'name-asc')
                            ? 'Try adjusting your filters or search term'
                            : 'Get started by adding your first vehicle to the fleet.'}
                    </p>
                    {!searchTerm && Object.values(filters).every(v => v === 'all' || v === 'name-asc') && (
                        <button onClick={() => navigate('/add-car')}
                            className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-5 py-2.5 rounded-xl font-bold transition-all">
                            <Plus size={20} />
                            Add New Car
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewCars;
