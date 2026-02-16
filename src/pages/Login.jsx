import React, { useState } from 'react';
import { useLoginMutation } from '../redux/apiSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [login, { isLoading }] = useLoginMutation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await login({ email, password }).unwrap();

            // Allow only admin login
            if (result.data.user.role !== 'admin') {
                toast.error('Access denied. Admin privileges required.');
                return;
            }

            // Store token and user
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));

            toast.success(`Welcome back, ${result.data.user.name}`);
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.data?.message || 'Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4 relative overflow-hidden">
            {/* Animated background accents */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-300/5 rounded-full blur-3xl animate-pulse"></div>

            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl relative z-10" style={{ border: "1px solid rgba(251, 191, 36, 0.2)" }}>
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <img
                            src="/images/doorcars-logo.png"
                            alt="DoorCars Logo"
                            className="h-16 w-auto object-contain"
                        />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">DoorCars</h1>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/30">
                        <Lock className="text-gray-900" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
                    <p className="text-gray-500 text-sm mt-2">Enter your credentials to access the panel</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                                placeholder="admin@doorcars.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-yellow-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <>
                                Sign In <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-xs text-gray-400">
                            Secure Admin Portal • DoorCars
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
