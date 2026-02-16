import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetUserByIdQuery, useUpdateUserStatusMutation, useVerifyUserDocumentMutation } from '../redux/apiSlice';
import { Mail, Phone, Calendar, ArrowLeft, Shield, CheckCircle, XCircle, FileText, User as UserIcon, X, Check, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, error } = useGetUserByIdQuery(id);
    const [updateUserStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation();
    const [verifyUserDocument, { isLoading: isVerifying }] = useVerifyUserDocumentMutation();
    const [selectedImage, setSelectedImage] = useState(null);

    const [rejectionModal, setRejectionModal] = useState({ isOpen: false, type: null });
    const [rejectionReason, setRejectionReason] = useState('');

    const user = data?.data;

    const handleStatusToggle = async () => {
        if (window.confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this user?`)) {
            try {
                await updateUserStatus({ id: user._id, isActive: !user.isActive }).unwrap();
                toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
            } catch (err) {
                toast.error('Failed to update user status');
            }
        }
    };

    const handleVerifyDocument = async (type, status, reason = '') => {
        try {
            await verifyUserDocument({ id: user._id, type, status, rejectionReason: reason }).unwrap();
            toast.success(`Document ${status === 'verified' ? 'verified' : 'rejected'} successfully`);
            if (status === 'rejected') {
                setRejectionModal({ isOpen: false, type: null });
                setRejectionReason('');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update verification status');
        }
    };

    const openRejectionModal = (type) => {
        setRejectionModal({ isOpen: true, type });
        setRejectionReason('');
    };

    if (isLoading) return <div className="p-10 text-center">Loading user details...</div>;
    if (error || !user) return <div className="p-10 text-center text-red-500">User not found</div>;

    const documents = user.documents || {};

    return (
        <>
            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                        <img
                            src={selectedImage.startsWith('http') ? selectedImage : `http://localhost:5000/${selectedImage.replace(/\\/g, '/')}`}
                            alt="Document Preview"
                            className="max-w-full max-h-[85vh] object-contain"
                            onError={(e) => {
                                // e.target.style.display = 'none';
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {rejectionModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-scale-up">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Document</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Please provide a reason for rejecting the {rejectionModal.type === 'drivingLicense' ? 'Driving License' : 'Aadhaar Card'}.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none mb-4"
                            rows={4}
                            placeholder="Enter rejection reason..."
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setRejectionModal({ isOpen: false, type: null })}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleVerifyDocument(rejectionModal.type, 'rejected', rejectionReason)}
                                disabled={!rejectionReason.trim() || isVerifying}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isVerifying ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in relative">
                {/* Back Button */}
                <button onClick={() => navigate('/users')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-4">
                    <ArrowLeft size={18} /> Back to Users
                </button>

                {/* Header Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-4xl font-bold shadow-lg shadow-blue-200">
                        {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="text-center md:text-left flex-1 space-y-1">
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500 text-sm">
                            <span className="flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
                            {user.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {user.phone}</span>}
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-3 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.isEmailVerified ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                                {user.isEmailVerified ? 'Email Verified' : 'Email Pending'}
                            </span>

                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.isDocumentVerified ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                    {user.isDocumentVerified ? 'Documents Verified' : 'Documents Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                            <UserIcon size={20} className="text-blue-600" />
                            <h2 className="font-semibold text-gray-800">Personal Details</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Joined Date</p>
                                    <p className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Role</p>
                                    <p className="text-sm font-medium capitalize">{user.role}</p>
                                </div>
                                {user.dateOfBirth && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                                        <p className="text-sm font-medium">{new Date(user.dateOfBirth).toLocaleDateString()}</p>
                                    </div>
                                )}
                                {user.gender && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Gender</p>
                                        <p className="text-sm font-medium capitalize">{user.gender}</p>
                                    </div>
                                )}
                            </div>
                            {user.address && (user.address.street || user.address.city || user.address.state || user.address.pincode) && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">Address Details</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {user.address.street && (
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-500 mb-1">Street</p>
                                                <p className="text-sm font-medium">{user.address.street}</p>
                                            </div>
                                        )}
                                        {user.address.city && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">City</p>
                                                <p className="text-sm font-medium">{user.address.city}</p>
                                            </div>
                                        )}
                                        {user.address.state && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">State</p>
                                                <p className="text-sm font-medium">{user.address.state}</p>
                                            </div>
                                        )}
                                        {user.address.pincode && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Pincode</p>
                                                <p className="text-sm font-medium">{user.address.pincode}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                            <Shield size={20} className="text-indigo-600" />
                            <h2 className="font-semibold text-gray-800">Documents</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Driving License */}
                            <div className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-100 gap-4">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <FileText size={20} className="text-gray-400" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-gray-700">Driving License</p>
                                                {documents.drivingLicense?.verified === 'verified' && (
                                                    <CheckCircle size={14} className="text-green-500" />
                                                )}
                                                {documents.drivingLicense?.verified === 'rejected' && (
                                                    <XCircle size={14} className="text-red-500" />
                                                )}
                                            </div>
                                            <p className={`text-xs ${documents.drivingLicense?.verified === 'verified' ? 'text-green-600' :
                                                documents.drivingLicense?.verified === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                                                }`}>
                                                {documents.drivingLicense ?
                                                    (documents.drivingLicense.verified === 'verified' ? 'Verified' :
                                                        documents.drivingLicense.verified === 'rejected' ? 'Rejected' : 'Pending Review')
                                                    : 'Not Uploaded'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {documents.drivingLicense && documents.drivingLicense.verified !== 'verified' && (
                                            documents.drivingLicense.frontImage || documents.drivingLicense.backImage ? (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleVerifyDocument('drivingLicense', 'verified')}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium transition"
                                                        title="Approve Document"
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => openRejectionModal('drivingLicense')}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium transition"
                                                        title="Reject Document"
                                                    >
                                                        <X size={14} /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No Document Uploaded</span>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Image Grid */}
                                {(documents.drivingLicense?.frontImage || documents.drivingLicense?.backImage) && (
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        {documents.drivingLicense.frontImage && (
                                            <div className="relative group">
                                                <p className="text-xs text-gray-500 mb-1 pl-1">Front Side</p>
                                                <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white">
                                                    <img
                                                        src={documents.drivingLicense.frontImage.startsWith('http') ? documents.drivingLicense.frontImage : `http://localhost:5000/${documents.drivingLicense.frontImage.replace(/\\/g, '/')}`}
                                                        alt="DL Front"
                                                        className="w-full h-32 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            onClick={() => setSelectedImage(documents.drivingLicense.frontImage)}
                                                            className="p-2 bg-white/90 rounded-full text-gray-900 hover:scale-110 transition-transform"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {documents.drivingLicense.backImage && (
                                            <div className="relative group">
                                                <p className="text-xs text-gray-500 mb-1 pl-1">Back Side</p>
                                                <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white">
                                                    <img
                                                        src={documents.drivingLicense.backImage.startsWith('http') ? documents.drivingLicense.backImage : `http://localhost:5000/${documents.drivingLicense.backImage.replace(/\\/g, '/')}`}
                                                        alt="DL Back"
                                                        className="w-full h-32 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            onClick={() => setSelectedImage(documents.drivingLicense.backImage)}
                                                            className="p-2 bg-white/90 rounded-full text-gray-900 hover:scale-110 transition-transform"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {documents.drivingLicense?.verified === 'rejected' && documents.drivingLicense.rejectionReason && (
                                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 mt-1">
                                        <span className="font-semibold">Reason:</span> {documents.drivingLicense.rejectionReason}
                                    </div>
                                )}
                            </div>

                            {/* Aadhaar */}
                            <div className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-100 gap-4">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <FileText size={20} className="text-gray-400" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-gray-700">Aadhaar Card</p>
                                                {documents.aadhaar?.verified === 'verified' && (
                                                    <CheckCircle size={14} className="text-green-500" />
                                                )}
                                                {documents.aadhaar?.verified === 'rejected' && (
                                                    <XCircle size={14} className="text-red-500" />
                                                )}
                                            </div>
                                            <p className={`text-xs ${documents.aadhaar?.verified === 'verified' ? 'text-green-600' :
                                                documents.aadhaar?.verified === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                                                }`}>
                                                {documents.aadhaar ?
                                                    (documents.aadhaar.verified === 'verified' ? 'Verified' :
                                                        documents.aadhaar.verified === 'rejected' ? 'Rejected' : 'Pending Review')
                                                    : 'Not Uploaded'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {documents.aadhaar && documents.aadhaar.verified !== 'verified' && (
                                            documents.aadhaar.frontImage || documents.aadhaar.backImage || documents.aadhaar.image ? (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleVerifyDocument('aadhaar', 'verified')}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium transition"
                                                        title="Approve Document"
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => openRejectionModal('aadhaar')}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium transition"
                                                        title="Reject Document"
                                                    >
                                                        <X size={14} /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No Document Uploaded</span>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Image Grid */}
                                {(documents.aadhaar?.frontImage || documents.aadhaar?.backImage || documents.aadhaar?.image) && (
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        {/* Support legacy 'image' field or new 'frontImage' */}
                                        {(documents.aadhaar.frontImage || documents.aadhaar.image) && (
                                            <div className="relative group">
                                                <p className="text-xs text-gray-500 mb-1 pl-1">Front Side</p>
                                                <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white">
                                                    <img
                                                        src={(documents.aadhaar.frontImage || documents.aadhaar.image).startsWith('http') ? (documents.aadhaar.frontImage || documents.aadhaar.image) : `http://localhost:5000/${(documents.aadhaar.frontImage || documents.aadhaar.image).replace(/\\/g, '/')}`}
                                                        alt="Aadhaar Front"
                                                        className="w-full h-32 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            onClick={() => setSelectedImage(documents.aadhaar.frontImage || documents.aadhaar.image)}
                                                            className="p-2 bg-white/90 rounded-full text-gray-900 hover:scale-110 transition-transform"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {documents.aadhaar.backImage && (
                                            <div className="relative group">
                                                <p className="text-xs text-gray-500 mb-1 pl-1">Back Side</p>
                                                <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white">
                                                    <img
                                                        src={documents.aadhaar.backImage.startsWith('http') ? documents.aadhaar.backImage : `http://localhost:5000/${documents.aadhaar.backImage.replace(/\\/g, '/')}`}
                                                        alt="Aadhaar Back"
                                                        className="w-full h-32 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            onClick={() => setSelectedImage(documents.aadhaar.backImage)}
                                                            className="p-2 bg-white/90 rounded-full text-gray-900 hover:scale-110 transition-transform"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {documents.aadhaar?.verified === 'rejected' && documents.aadhaar.rejectionReason && (
                                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 mt-1">
                                        <span className="font-semibold">Reason:</span> {documents.aadhaar.rejectionReason}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                        <Shield size={20} className="text-red-500" />
                        <h2 className="font-semibold text-gray-800">Security & Account Status</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-800">Account Status</p>
                            <p className="text-sm text-gray-500">{user.isActive ? 'Active and accessible' : 'Account deactivated'}</p>
                        </div>
                        <button
                            onClick={handleStatusToggle}
                            disabled={isUpdating}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'} ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isUpdating ? 'Updating...' : (user.isActive ? 'Deactivate Account' : 'Activate Account')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserDetails;
