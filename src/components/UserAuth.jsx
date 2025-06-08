import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react';

const UserAuth = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        email: '',
        password: '',
        name: ''
    });

    const baseURL = 'https://chatbackends-1.onrender.com';

    const validateForm = () => {
        const newErrors = {};
        if (!form.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid';

        if (!form.password) newErrors.password = 'Password is required';
        else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        if (!isLogin && !form.name) newErrors.name = 'Name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return;
        setLoading(true);
        setErrors({});

        const url = `${baseURL}/user/${isLogin ? 'login' : 'signup'}`;

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('username', data.name || form.name);
                    navigate('/home');
                    window.location.reload()
                } else {
                    setErrors({ submit: 'Login/signup succeeded but token missing.' });
                }
            } else {
                setErrors({ submit: data.message || 'Something went wrong' });
            }
        } catch (err) {
            console.error('Error in handleSubmit:', err);
            setErrors({ submit: 'Server error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };


    const toggleMode = (loginMode) => {
        setIsLogin(loginMode);
        setErrors({});
        setForm({ email: '', password: '', name: '' });
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
                <div className="relative z-10 text-center text-white px-8">
                    <div className="text-8xl mb-8 animate-pulse">🐦</div>
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Connect Globally
                    </h1>
                    <p className="text-xl text-gray-300 max-w-md mx-auto leading-relaxed">
                        Join millions in meaningful conversations and share your unique perspective with the world
                    </p>
                    <p className="text-xl text-gray-300 max-w-md mx-auto leading-relaxed">
                        Made By Aditya
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-gray-700/50">
                        <div className="flex">
                            <button
                                onClick={() => toggleMode(true)}
                                className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300 ${isLogin
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => toggleMode(false)}
                                className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300 ${!isLogin
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-900/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {isLogin ? 'Welcome Back!' : 'Join Us Today!'}
                            </h2>
                            <p className="text-gray-400 text-sm">
                                {isLogin ? 'Sign in to continue your journey' : 'Create your account to get started'}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${errors.name
                                                ? 'border-red-500 focus:ring-red-500/50'
                                                : 'border-gray-600 focus:ring-blue-500/50 focus:border-blue-500'
                                                }`}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${errors.email
                                            ? 'border-red-500 focus:ring-red-500/50'
                                            : 'border-gray-600 focus:ring-blue-500/50 focus:border-blue-500'
                                            }`}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={handleChange}
                                        className={`w-full pl-12 pr-12 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${errors.password
                                            ? 'border-red-500 focus:ring-red-500/50'
                                            : 'border-gray-600 focus:ring-blue-500/50 focus:border-blue-500'
                                            }`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                            </div>

                            {errors.submit && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <p className="text-red-400 text-sm text-center">{errors.submit}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                onClick={handleSubmit}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-gray-400 text-sm">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => toggleMode(!isLogin)}
                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                >
                                    {isLogin ? 'Sign up here' : 'Sign in here'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAuth;
