import React, { useState } from 'react';
import { useGetUsersQuery, useVerifyUserDocumentMutation } from '../redux/apiSlice';
import { Search, Mail, Phone, Calendar, ChevronRight, Check, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Users = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const { data, isLoading, error } = useGetUsersQuery({ search: searchTerm, page, limit });
    const [verifyUserDocument] = useVerifyUserDocumentMutation();
    const [verifyingId, setVerifyingId] = useState(null);

    // Reset page when search changes
    React.useEffect(() => {
        setPage(1);
    }, [searchTerm, limit]);

    const handleVerifyGlobal = async (e, userId, currentStatus) => {
        e.stopPropagation(); // Prevent row click navigation
        setVerifyingId(userId);
        try {
            await verifyUserDocument({ id: userId, type: 'global', status: !currentStatus }).unwrap();
            toast.success(`User documents ${!currentStatus ? 'verified' : 'unverified'} successfully`);
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setVerifyingId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    };

    if (isLoading) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading users...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center p-8 bg-red-50 rounded-xl border border-red-100 max-w-md">
                <div className="text-red-500 font-bold mb-2">Error loading users</div>
                <p className="text-gray-600 text-sm">Please check your connection and try again.</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage registered users</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex-1 md:flex-none flex items-center px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="bg-transparent outline-none text-sm w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">S.No & User</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data?.data?.map((user, index) => (
                                <tr key={user._id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => navigate(`/users/${user._id}`)}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 flex items-center justify-center font-bold text-gray-500">
                                                {(page - 1) * limit + index + 1}.
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{user.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail size={14} className="text-gray-400" /> {user.email}
                                            </div>
                                            {user.phone && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone size={14} className="text-gray-400" /> {user.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-2 items-start">
                                            <span className={`w-fit px-2.5 py-1 rounded-full text-xs font-medium ${user.isEmailVerified ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                                {user.isEmailVerified ? 'Email Verified' : 'Email Pending'}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <span className={`w-fit px-2.5 py-1 rounded-full text-xs font-medium ${user.isDocumentVerified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {user.isDocumentVerified ? 'Docs Verified' : 'Docs Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                            {user.isActive ? 'Active' : 'Deactivated'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar size={14} />
                                            {formatDate(user.createdAt)}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="p-2 text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 rounded-full transition-all inline-block">
                                            <ChevronRight size={20} />
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {data?.data?.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination & Limit Controls */}
                <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <span>Showing {data?.data?.length} of {data?.total} users</span>

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
            </div>
        </div>
    );
};

export default Users;
