import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, User } from 'lucide-react';

const Layout = () => {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar - Fixed/Sticky */}
            <div className="h-full">
                <Sidebar />
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 shrink-0 z-10 border-b border-yellow-100">
                    <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-gray-400 hover:text-yellow-500 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-gray-900 shadow-md">
                                <User size={18} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Admin User</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
