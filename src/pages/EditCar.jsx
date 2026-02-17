import React, { useState, useEffect } from 'react';
import { useGetCarsQuery, useUpdateCarMutation } from '../redux/apiSlice';
import { Upload, X, Check, ClipboardList, Car, MapPin, DollarSign, CheckCircle, Camera, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';


const CarFormSkeleton = () => (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-pulse">
        <div className="flex justify-between items-center mb-6">
            <div>
                <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
        </div>

        <div className="space-y-8">
            {/* Basic Info Skeleton */}
            <section>
                <div className="h-8 w-40 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i}>
                            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                            <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Category & Specs Skeleton */}
            <section>
                <div className="h-8 w-40 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i}>
                            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                            <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Location Skeleton */}
            <section>
                <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                    <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                </div>
            </section>

            {/* Images Skeleton */}
            <section>
                <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-40 w-full bg-gray-200 rounded-lg border-2 border-dashed border-gray-300"></div>
            </section>
        </div>
    </div>
);

const EditCar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { car, isLoading: isFetching } = useGetCarsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            car: data?.data?.find((c) => c._id === id),
            isLoading: !data,
        }),
    });

    // Fallback if car not found in cache (e.g. direct link) - ideally use useGetCarByIdQuery but for now we reuse list
    // Actually, let's just push for a robust solution: if car is undefined, maybe fetch list again or separate endpoint? 
    // For now, let's rely on the list being cached or fetched.

    const [updateCar, { isLoading: isUpdating }] = useUpdateCarMutation();

    const [formData, setFormData] = useState({
        brand: '', model: '', variant: '', year: new Date().getFullYear(), registrationNumber: '',
        category: '', fuelType: '', transmission: '', seats: 5, color: '', mileage: '', kmDriven: 0,
        city: '', area: '', pickupLocations: [], dropLocations: [],
        'pricing.perDay': '', securityDeposit: '', 'pricing.perHour': '', 'pricing.freeKmPerDay': 200, 'pricing.extraKmCharge': 10,
        'availability.status': 'available', condition: 'good', isFeatured: false,
        description: ''
    });

    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [existingThumbnail, setExistingThumbnail] = useState(null);

    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);

    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [sameAsPickup, setSameAsPickup] = useState(false);

    useEffect(() => {
        if (car) {
            setFormData({
                brand: car.brand || '',
                model: car.model || '',
                variant: car.variant || '',
                year: car.year || '',
                registrationNumber: car.registrationNumber || '',
                category: car.category || '',
                fuelType: car.fuelType || '',
                transmission: car.transmission || '',
                seats: car.seats || 5,
                color: car.color || '',
                mileage: car.mileage || '',
                kmDriven: car.kmDriven || 0,
                city: car.city || '',
                area: car.area || '',
                'pricing.perDay': car.pricing?.perDay || '',
                securityDeposit: car.securityDeposit || '',
                'pricing.perHour': car.pricing?.perHour || '',
                'pricing.freeKmPerDay': car.pricing?.freeKmPerDay || '',
                'pricing.extraKmCharge': car.pricing?.extraKmCharge || '',
                'availability.status': car.availability?.status || 'available',
                condition: car.condition || 'good',
                isFeatured: car.isFeatured || false,

                description: car.description || '',
                pickupLocations: car.pickupLocations || [],
                dropLocations: car.dropLocations || []
            });
            setExistingThumbnail(car.thumbnail);
            setExistingImages(car.images || []);
        }
    }, [car]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleNewImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (existingImages.length - imagesToDelete.length + newImages.length + files.length > 10) {
            toast.error('Maximum 10 images allowed (including existing ones)');
            return;
        }
        setNewImages([...newImages, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews([...newImagePreviews, ...newPreviews]);
    };

    const removeNewImage = (index) => {
        setNewImages(newImages.filter((_, i) => i !== index));
        setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageId) => {
        setImagesToDelete([...imagesToDelete, imageId]);
        setExistingImages(existingImages.filter(img => img._id !== imageId));
    };

    const addPickupLocation = () => {
        setFormData({
            ...formData,
            pickupLocations: [...formData.pickupLocations, { name: '', address: '', coordinates: { lat: '', lng: '' } }]
        });
    };

    const removePickupLocation = (index) => {
        const updatedLocations = formData.pickupLocations.filter((_, i) => i !== index);
        setFormData({ ...formData, pickupLocations: updatedLocations });
    };

    const handlePickupChange = (index, field, value) => {
        const updatedLocations = [...formData.pickupLocations];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            updatedLocations[index][parent][child] = value;
        } else {
            updatedLocations[index][field] = value;
        }
        setFormData({ ...formData, pickupLocations: updatedLocations });
    };

    // Drop Location Handlers
    const addDropLocation = () => {
        setFormData({
            ...formData,
            dropLocations: [...formData.dropLocations, { name: '', address: '', coordinates: { lat: '', lng: '' } }]
        });
    };

    const removeDropLocation = (index) => {
        const updatedLocations = formData.dropLocations.filter((_, i) => i !== index);
        setFormData({ ...formData, dropLocations: updatedLocations });
    };

    const handleDropChange = (index, field, value) => {
        const updatedLocations = [...formData.dropLocations];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            updatedLocations[index][parent][child] = value;
        } else {
            updatedLocations[index][field] = value;
        }
        setFormData({ ...formData, dropLocations: updatedLocations });
    };

    // Same as Pickup Handler
    const handleSameAsPickup = (checked) => {
        setSameAsPickup(checked);
        if (checked) {
            setFormData({ ...formData, dropLocations: [...formData.pickupLocations] });
        } else {
            setFormData({ ...formData, dropLocations: [] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'pickupLocations') {
                data.append('pickupLocations', JSON.stringify(formData.pickupLocations));
            } else if (key === 'dropLocations') {
                data.append('dropLocations', JSON.stringify(formData.dropLocations));
            } else {
                data.append(key, formData[key]);
            }
        });

        if (thumbnail) {
            data.append('thumbnail', thumbnail);
        }

        newImages.forEach(image => data.append('images', image));

        // Append images to delete correctly (as array items)
        imagesToDelete.forEach(id => data.append('imagesToDelete', id));

        try {
            await updateCar({ id, formData: data }).unwrap();
            toast.success('Car updated successfully!');
            navigate('/cars');
        } catch (error) {
            console.error('Update car error:', error);
            toast.error(error.data?.error || error.data?.message || 'Failed to update car');
        }
    };

    if (isFetching && !car) return <CarFormSkeleton />;
    if (!car) return <div className="text-center p-10 text-red-500">Car not found!</div>;

    return (
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Edit Vehicle</h2>
                    <p className="text-gray-500 text-sm mt-1">Update details for {car.brand} {car.model}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Reuse the sections from AddCar - ideally componentize, but for speed repeating structure */}

                {/* Basic Information */}
                <section>
                    <div className="flex items-center gap-2 text-blue-800 mb-4 border-b pb-2">
                        <ClipboardList size={20} />
                        <h3 className="text-lg font-semibold">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                            <input type="text" name="brand" value={formData.brand} required onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" placeholder="e.g. Maruti" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                            <input type="text" name="model" value={formData.model} required onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" placeholder="e.g. Swift" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                            <input type="text" name="variant" value={formData.variant} onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                            <input type="number" name="year" value={formData.year} required onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                            <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                    </div>
                </section>

                {/* Category & Specs */}
                <section>
                    <div className="flex items-center gap-2 text-blue-800 mb-4 border-b pb-2">
                        <Car size={20} />
                        <h3 className="text-lg font-semibold">Category & Specs</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select name="category" value={formData.category} required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none">
                                <option value="">Select</option>
                                <option value="hatchback">Hatchback</option>
                                <option value="sedan">Sedan</option>
                                <option value="suv">SUV</option>
                                <option value="muv">MUV</option>
                                <option value="luxury">Luxury</option>
                                <option value="electric">Electric</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type *</label>
                            <select name="fuelType" value={formData.fuelType} required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none">
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="cng">CNG</option>
                                <option value="electric">Electric</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transmission *</label>
                            <select name="transmission" value={formData.transmission} required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none">
                                <option value="manual">Manual</option>
                                <option value="automatic">Automatic</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Seats *</label>
                            <input type="number" name="seats" value={formData.seats} required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input type="text" name="color" value={formData.color} onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
                            <input type="number" name="mileage" value={formData.mileage} onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Driven (km)</label>
                            <input type="number" name="kmDriven" value={formData.kmDriven} min="0" onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                    </div>
                </section>

                {/* Pickup Locations */}
                <section>
                    <div className="flex items-center gap-2 text-blue-800 mb-4 border-b pb-2">
                        <MapPin size={20} />
                        <h3 className="text-lg font-semibold">Pickup Locations</h3>
                    </div>

                    <div className="space-y-4 mb-4">
                        {formData.pickupLocations.map((loc, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                                <button type="button" onClick={() => removePickupLocation(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                    <X size={18} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Location Name</label>
                                        <input type="text" value={loc.name} onChange={(e) => handlePickupChange(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 border rounded outline-none text-sm" placeholder="e.g. Airport Terminal 1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Address</label>
                                        <input type="text" value={loc.address} onChange={(e) => handlePickupChange(index, 'address', e.target.value)}
                                            className="w-full px-3 py-2 border rounded outline-none text-sm" placeholder="Full address" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Latitude</label>
                                        <input type="number" value={loc.coordinates?.lat || ''} onChange={(e) => handlePickupChange(index, 'coordinates.lat', e.target.value)}
                                            className="w-full px-3 py-2 border rounded outline-none text-sm" placeholder="26.9124" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Longitude</label>
                                        <input type="number" value={loc.coordinates?.lng || ''} onChange={(e) => handlePickupChange(index, 'coordinates.lng', e.target.value)}
                                            className="w-full px-3 py-2 border rounded outline-none text-sm" placeholder="75.7873" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button type="button" onClick={addPickupLocation}
                        className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition flex items-center gap-1">
                        + Add Pickup Location
                    </button>
                </section>

                {/* Drop Locations */}
                <section>
                    <div className="flex items-center gap-2 text-blue-800 mb-4 border-b pb-2">
                        <MapPin size={20} />
                        <h3 className="text-lg font-semibold">Drop Locations</h3>
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sameAsPickup}
                                onChange={(e) => handleSameAsPickup(e.target.checked)}
                                className="w-4 h-4 accent-blue-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Same as Pickup Locations</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1 ml-6">Enable this to automatically copy pickup locations to drop locations</p>
                    </div>

                    <div className="space-y-4 mb-4">
                        {formData.dropLocations.map((loc, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                                <button type="button" onClick={() => removeDropLocation(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                    <X size={18} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Location Name</label>
                                        <input type="text" value={loc.name} onChange={(e) => handleDropChange(index, 'name', e.target.value)}
                                            disabled={sameAsPickup}
                                            className="w-full px-3 py-2 border rounded outline-none text-sm disabled:bg-gray-100" placeholder="e.g. Airport Terminal 1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Address</label>
                                        <input type="text" value={loc.address} onChange={(e) => handleDropChange(index, 'address', e.target.value)}
                                            disabled={sameAsPickup}
                                            className="w-full px-3 py-2 border rounded outline-none text-sm disabled:bg-gray-100" placeholder="Full address" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Latitude</label>
                                        <input type="number" value={loc.coordinates?.lat || ''} onChange={(e) => handleDropChange(index, 'coordinates.lat', e.target.value)}
                                            disabled={sameAsPickup}
                                            className="w-full px-3 py-2 border rounded outline-none text-sm disabled:bg-gray-100" placeholder="26.9124" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Longitude</label>
                                        <input type="number" value={loc.coordinates?.lng || ''} onChange={(e) => handleDropChange(index, 'coordinates.lng', e.target.value)}
                                            disabled={sameAsPickup}
                                            className="w-full px-3 py-2 border rounded outline-none text-sm disabled:bg-gray-100" placeholder="75.7873" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button type="button" onClick={addDropLocation}
                        disabled={sameAsPickup}
                        className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                        + Add Drop Location
                    </button>
                </section>

                {/* Location */}
                <section>
                    <div className="flex items-center gap-2 text-blue-800 mb-4 border-b pb-2">
                        <MapPin size={20} />
                        <h3 className="text-lg font-semibold">Location</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                            <input type="text" name="city" value={formData.city} required onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                            <input type="text" name="area" value={formData.area} required onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                    </div>
                </section>

                {/* Pricing, Status, Description... omitted brevity but included in valid code */}
                <section>
                    <div className="flex items-center gap-2 text-blue-800 mb-4 border-b pb-2">
                        <DollarSign size={20} />
                        <h3 className="text-lg font-semibold">Pricing</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price / Day (200 km) *</label>
                            <input type="number" name="pricing.perDay" value={formData['pricing.perDay']} required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
                            <p className="text-xs text-gray-500 mt-1">400km (1.5x) & 1000km (2.25x) tiers are auto-calculated.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deposit *</label>
                            <input type="number" name="securityDeposit" value={formData.securityDeposit} required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price/Hour</label>
                            <input type="number" name="pricing.perHour" value={formData['pricing.perHour']} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Extra Km Charge</label>
                            <input type="number" name="pricing.extraKmCharge" value={formData['pricing.extraKmCharge']} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2 text-blue-800 mb-4 border-b pb-2">
                        <CheckCircle size={20} />
                        <h3 className="text-lg font-semibold">Status & Description</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select name="availability.status" value={formData['availability.status']} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none">
                                <option value="available">Available</option>
                                <option value="booked">Booked</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                            <select name="condition" value={formData.condition} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none">
                                <option value="good">Good</option>
                                <option value="excellent">Excellent</option>
                                <option value="fair">Fair</option>
                            </select>
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 accent-blue-600 rounded" />
                                <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" value={formData.description} rows="3" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
                    </div>
                </section>

                {/* Images Section with Edit Capabilities */}
                <section>
                    <div className="flex items-center gap-2 text-blue-800 mb-4 border-b pb-2">
                        <Camera size={20} />
                        <h3 className="text-lg font-semibold">Images</h3>
                    </div>
                    <div className="space-y-6">
                        {/* Thumbnail */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                            <div className="flex items-start gap-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full md:w-1/2 text-center hover:bg-gray-50 transition">
                                    <input type="file" onChange={handleThumbnailChange} accept="image/*" className="hidden" id="thumb-edit" />
                                    <label htmlFor="thumb-edit" className="cursor-pointer flex flex-col items-center">
                                        <Upload className="text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500">Change Thumbnail</span>
                                    </label>
                                </div>
                                <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden border">
                                    <img
                                        src={thumbnailPreview || existingThumbnail || 'https://via.placeholder.com/150'}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Existing Gallery */}
                        {existingImages.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Existing Gallery Images</label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {existingImages.map((img) => (
                                        <div key={img._id} className="relative group">
                                            <img src={img.url} alt="Gallery" className="w-full h-24 object-cover rounded-lg border" />
                                            <button type="button" onClick={() => removeExistingImage(img._id)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Gallery Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Add More Images</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition">
                                <input type="file" onChange={handleNewImagesChange} accept="image/*" multiple className="hidden" id="imgs-edit" />
                                <label htmlFor="imgs-edit" className="cursor-pointer flex flex-col items-center">
                                    <Upload className="text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Upload new images to append</span>
                                </label>
                            </div>
                            {newImagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                                    {newImagePreviews.map((src, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={src} alt="Preview" className="w-full h-24 object-cover rounded-lg border" />
                                            <button type="button" onClick={() => removeNewImage(idx)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <div className="pt-4 flex gap-4">
                    <button type="submit" disabled={isUpdating}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2">
                        {isUpdating ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <><Check size={20} /> Update Vehicle</>}
                    </button>
                    <button type="button" onClick={() => navigate('/cars')}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditCar;
