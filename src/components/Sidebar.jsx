import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, Settings, LogOut, ChevronLeft, ChevronRight, Users, Calendar } from 'lucide-react';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Users', path: '/users' },
        { icon: Calendar, label: 'Bookings', path: '/bookings' },
        { icon: Car, label: 'Car Management', path: '/cars' },
        // { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const sidebarWidth = isCollapsed ? 'w-20' : 'w-72';

    return (
        <aside
            className={`${sidebarWidth} bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white min-h-screen flex flex-col shadow-2xl transition-all duration-300 relative z-20`}
        >
            {/* Header / Logo */}
            <div className="h-20 flex items-center justify-center border-b border-yellow-500/20 relative overflow-hidden">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-transparent"></div>

                {!isCollapsed ? (
                    <div className="flex items-center gap-3 px-6 relative z-10 ">
                        <img
                            src="/images/doorcars-logo.png"
                            alt="DoorCars Logo"
                            className="h-10 w-auto object-contain brightness-0 invert"
                        />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                            DoorCars
                        </h1>
                    </div>
                ) : (
                    <div className="w-12 h-12 flex items-center justify-center brightness-0 invert">
                        <img
                            src="/images/doorcars-logo.png"
                            alt="DoorCars Logo"
                            className="h-10 w-10 object-contain"
                        />
                    </div>
                )}
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-24 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 p-1 rounded-full shadow-lg hover:from-yellow-500 hover:to-yellow-600 transition-all hover:scale-110 z-50 border-2 border-white"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/30'
                                : 'text-gray-400 hover:bg-yellow-400/10 hover:text-yellow-300 hover:shadow-md'
                            }`
                        }
                    >
                        <div className={`flex items-center justify-center transition-all ${isCollapsed ? 'w-full' : ''}`}>
                            <item.icon size={22} className={`shrink-0 transition-colors ${!isCollapsed && 'group-hover:text-yellow-300'}`} />
                        </div>

                        {!isCollapsed && (
                            <span className="font-medium tracking-wide whitespace-nowrap">{item.label}</span>
                        )}

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-3 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-yellow-400/30">
                                {item.label}
                                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-yellow-400/30"></div>
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-yellow-500/20 bg-gray-900/50">
                <button
                    onClick={() => {
                        // Handle logout logic here if needed
                        // For now just redirect or clear token
                        localStorage.removeItem('adminToken');
                        window.location.href = '/login';
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
                    {!isCollapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
