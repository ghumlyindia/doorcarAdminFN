import React, { useState } from 'react';
import { useAddCarMutation } from '../redux/apiSlice';
import { Upload, X, Check, AlertCircle, ClipboardList, Car, MapPin, DollarSign, CheckCircle, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AddCar = () => {
    const [addCar, { isLoading }] = useAddCarMutation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        brand: '', model: '', variant: '', year: new Date().getFullYear(), registrationNumber: '',
        category: '', fuelType: '', transmission: '', seats: 5, color: '', mileage: '', kmDriven: 0,
        city: '', area: '', pickupLocations: [], dropLocations: [],
        'pricing.perDay': '', securityDeposit: '', 'pricing.perHour': '', 'pricing.freeKmPerDay': 200, 'pricing.extraKmCharge': 10,
        'availability.status': 'available', condition: 'good', isFeatured: false,
        description: ''
    });

    const [thumbnail, setThumbnail] = useState(null);
    const [images, setImages] = useState([]);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [sameAsPickup, setSameAsPickup] = useState(false);

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

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 10) {
            toast.error('Maximum 10 images allowed');
            return;
        }
        setImages([...images, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
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
            // Copy pickup locations to drop locations
            setFormData({ ...formData, dropLocations: [...formData.pickupLocations] });
        } else {
            // Clear drop locations
            setFormData({ ...formData, dropLocations: [] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!thumbnail) {
            toast.error('Please upload a thumbnail');
            return;
        }

        const data = new FormData();
        // Append text fields
        Object.keys(formData).forEach(key => {
            if (key === 'pickupLocations') {
                data.append('pickupLocations', JSON.stringify(formData.pickupLocations));
            } else if (key === 'dropLocations') {
                data.append('dropLocations', JSON.stringify(formData.dropLocations));
            } else {
                data.append(key, formData[key]);
            }
        });

        // Auto-generate name from brand + model if needed, or let backend handle it.
        // The previous HTML didn't send 'name', but the backend might expect it or construct it.
        // Based on HTML analysis, it sends keys like 'pricing.perDay' directly.

        // Append files
        data.append('thumbnail', thumbnail);
        images.forEach(image => data.append('images', image));

        // Default ratings (matching the HTML script logic)
        data.append('rating[average]', '4.5');
        data.append('rating[count]', Math.floor(Math.random() * 50) + 10);

        try {
            await addCar(data).unwrap();
            toast.success('Car added successfully!');
            navigate('/cars');
        } catch (error) {
            console.error('Add car error:', error);
            toast.error(error.data?.error || error.data?.message || 'Failed to add car');
        }
    };

    return (
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Add New Vehicle</h2>
                    <p className="text-gray-500 text-sm mt-1">Fill in the details to list a car for rental</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Basic Information */}
                <section>
                    <div className="flex items-center gap-2 text-blue-800 mb-4 border-b pb-2">
                        <ClipboardList size={20} />
                        <h3 className="text-lg font-semibold">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                            <input type="text" name="brand" required onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Maruti" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                            <input type="text" name="model" required onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Swift" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                            <input type="text" name="variant" onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. VXi" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                            <input type="number" name="year" required min="2010" max="2030" defaultValue={2024} onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                            <input type="text" name="registrationNumber" onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. RJ14AB1234" />
                        </div>
                    </div>
                </section>

                {/* Category & Type */}
                <section>
                    <div className="flex items-center gap-2 text-blue-800 mb-4 border-b pb-2">
                        <Car size={20} />
                        <h3 className="text-lg font-semibold">Category & Specs</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select name="category" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none cursor-pointer">
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
                            <select name="fuelType" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none cursor-pointer">
                                <option value="">Select</option>
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="cng">CNG</option>
                                <option value="electric">Electric</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transmission *</label>
                            <select name="transmission" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none cursor-pointer">
                                <option value="">Select</option>
                                <option value="manual">Manual</option>
                                <option value="automatic">Automatic</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Seats *</label>
                            <input type="number" name="seats" required min="2" max="10" defaultValue={5} onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input type="text" name="color" onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" placeholder="e.g. Red" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (km/l)</label>
                            <input type="number" name="mileage" step="0.1" onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" placeholder="e.g. 18.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Driven (km)</label>
                            <input type="number" name="kmDriven" min="0" onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" placeholder="e.g. 50000" />
                        </div>
                    </div>
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
                            <input type="text" name="city" required onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Jaipur" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                            <input type="text" name="area" required onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Vaishali Nagar" />
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
                                        <input type="number" value={loc.coordinates.lat} onChange={(e) => handlePickupChange(index, 'coordinates.lat', e.target.value)}
                                            className="w-full px-3 py-2 border rounded outline-none text-sm" placeholder="26.9124" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Longitude</label>
                                        <input type="number" value={loc.coordinates.lng} onChange={(e) => handlePickupChange(index, 'coordinates.lng', e.target.value)}
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

                    {/* Same as Pickup Checkbox */}
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
                                        <input
                                            type="text"
                                            value={loc.name}
                                            onChange={(e) => handleDropChange(index, 'name', e.target.value)}
                                            disabled={sameAsPickup}
                                            className="w-full px-3 py-2 border rounded outline-none text-sm disabled:bg-gray-100"
                                            placeholder="e.g. Airport Terminal 1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Address</label>
                                        <input
                                            type="text"
                                            value={loc.address}
                                            onChange={(e) => handleDropChange(index, 'address', e.target.value)}
                                            disabled={sameAsPickup}
                                            className="w-full px-3 py-2 border rounded outline-none text-sm disabled:bg-gray-100"
                                            placeholder="Full address"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Latitude</label>
                                        <input
                                            type="number"
                                            value={loc.coordinates.lat}
                                            onChange={(e) => handleDropChange(index, 'coordinates.lat', e.target.value)}
                                            disabled={sameAsPickup}
                                            className="w-full px-3 py-2 border rounded outline-none text-sm disabled:bg-gray-100"
                                            placeholder="26.9124"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Longitude</label>
                                        <input
                                            type="number"
                                            value={loc.coordinates.lng}
                                            onChange={(e) => handleDropChange(index, 'coordinates.lng', e.target.value)}
                                            disabled={sameAsPickup}
                                            className="w-full px-3 py-2 border rounded outline-none text-sm disabled:bg-gray-100"
                                            placeholder="75.7873"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addDropLocation}
                        disabled={sameAsPickup}
                        className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                        + Add Drop Location
                    </button>
                </section>

                {/* Pricing */}
                <section>
                    <div className="flex items-center gap-2 text-blue-800 mb-4 border-b pb-2">
                        <DollarSign size={20} />
                        <h3 className="text-lg font-semibold">Pricing</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price / Day (200 km) *</label>
                            <input type="number" name="pricing.perDay" required onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="2000" />
                            <p className="text-xs text-gray-500 mt-1">400km (1.5x) & 1000km (2.25x) tiers are auto-calculated.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹) *</label>
                            <input type="number" name="securityDeposit" required onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="5000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Hour (₹)</label>
                            <input type="number" name="pricing.perHour" onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none"
                                placeholder="300" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Extra Km Charge (₹)</label>
                            <input type="number" name="pricing.extraKmCharge" defaultValue={10} onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                    </div>
                </section>

                {/* Availability & Description */}
                <section>
                    <div className="flex items-center gap-2 text-blue-800 mb-4 border-b pb-2">
                        <CheckCircle size={20} />
                        <h3 className="text-lg font-semibold">Status & Description</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select name="availability.status" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none">
                                <option value="available">Available</option>
                                <option value="booked">Booked</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                            <select name="condition" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none">
                                <option value="good">Good</option>
                                <option value="excellent">Excellent</option>
                                <option value="fair">Fair</option>
                            </select>
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="isFeatured" onChange={handleChange} className="w-5 h-5 accent-blue-600 rounded" />
                                <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" rows="3" onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter car description..." />
                    </div>
                </section>

                {/* Images */}
                <section>
                    <div className="flex items-center gap-2 text-blue-800 mb-4 border-b pb-2">
                        <Camera size={20} />
                        <h3 className="text-lg font-semibold">Images</h3>
                    </div>
                    <div className="space-y-6">
                        {/* Thumbnail */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image *</label>
                            <div className="flex items-start gap-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full md:w-1/2 text-center hover:bg-gray-50 transition">
                                    <input type="file" onChange={handleThumbnailChange} accept="image/*" className="hidden" id="thumb-upload" />
                                    <label htmlFor="thumb-upload" className="cursor-pointer flex flex-col items-center">
                                        <Upload className="text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500">{thumbnail ? thumbnail.name : 'Click to upload thumbnail'}</span>
                                    </label>
                                </div>
                                {thumbnailPreview && (
                                    <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-32 h-20 object-cover rounded-lg border" />
                                )}
                            </div>
                        </div>

                        {/* Gallery */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images (Max 10)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
                                <input type="file" onChange={handleImagesChange} accept="image/*" multiple className="hidden" id="imgs-upload" />
                                <label htmlFor="imgs-upload" className="cursor-pointer flex flex-col items-center">
                                    <Upload className="text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Click to upload multiple images</span>
                                </label>
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                                    {imagePreviews.map((src, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={src} alt="Preview" className="w-full h-24 object-cover rounded-lg border" />
                                            <button type="button" onClick={() => removeImage(idx)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition">
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
                    <button type="submit" disabled={isLoading}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2">
                        {isLoading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <><Check size={20} /> Add Vehicle</>}
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

export default AddCar;
