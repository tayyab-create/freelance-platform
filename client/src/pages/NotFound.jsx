import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiSearch } from 'react-icons/fi';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center px-4 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[128px]"></div>
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Floating 404 */}
                <div className="mb-12 relative">
                    <h1 className="text-[12rem] md:text-[16rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 leading-none animate-float">
                        404
                    </h1>

                    {/* Floating Elements */}
                    <div className="absolute top-0 left-1/4 w-8 h-8 bg-purple-500/30 rounded-full blur-md animate-float animation-delay-1000"></div>
                    <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-pink-500/30 rounded-full blur-md animate-float animation-delay-2000"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-6 h-6 bg-indigo-500/30 rounded-full blur-md animate-float animation-delay-3000"></div>
                </div>

                {/* Message */}
                <div className="mb-12 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        The page you're looking for seems to have wandered off into the digital void.
                        Don't worry, we'll help you find your way back!
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Link
                        to="/"
                        className="group px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3"
                    >
                        <FiHome className="group-hover:-translate-y-0.5 transition-transform" />
                        Go Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="group px-8 py-4 bg-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all transform hover:scale-105 backdrop-blur-sm border border-white/20 flex items-center justify-center gap-3"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>
                </div>

                {/* Quick Links */}
                <div className="glass-card p-8 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <FiSearch className="text-purple-400" />
                        <h3 className="text-xl font-bold text-white">Quick Links</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link
                            to="/worker/jobs"
                            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-gray-300 hover:text-white border border-white/10 hover:border-purple-500/50"
                        >
                            Browse Jobs
                        </Link>
                        <Link
                            to="/worker/dashboard"
                            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-gray-300 hover:text-white border border-white/10 hover:border-purple-500/50"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/messages"
                            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-gray-300 hover:text-white border border-white/10 hover:border-purple-500/50"
                        >
                            Messages
                        </Link>
                        <Link
                            to="/worker/profile"
                            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-gray-300 hover:text-white border border-white/10 hover:border-purple-500/50"
                        >
                            Profile
                        </Link>
                    </div>
                </div>

                {/* Error Code */}
                <p className="mt-8 text-sm text-gray-600 font-mono">
                    ERROR_CODE: PAGE_NOT_FOUND_404
                </p>
            </div>
        </div>
    );
};

export default NotFound;
