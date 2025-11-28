import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMe } from "./redux/slices/authSlice";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MyApplications from "./pages/worker/MyApplications";
import AssignedJobs from "./pages/worker/AssignedJobs";
import WorkerProfile from "./pages/worker/WorkerProfile";
import CompanyProfile from "./pages/company/CompanyProfile";
import Submissions from "./pages/company/Submissions";
import MyReviews from "./pages/worker/MyReviews";
import CompanyReviews from "./pages/company/MyReviews";
import {
  FiArrowRight, FiCheckCircle, FiShield, FiUsers, FiStar, FiTrendingUp, FiMenu,
  FiCode, FiPenTool, FiMonitor, FiSmartphone, FiDatabase, FiLayout, FiGlobe, FiPieChart
} from 'react-icons/fi';

import Messages from "./pages/shared/Messages";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PendingApproval from "./pages/auth/PendingApproval";
import OnboardingStatus from "./pages/auth/OnboardingStatus";

// Worker Pages
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import BrowseJobs from "./pages/worker/BrowseJobs";
import SavedSearches from "./pages/worker/SavedSearches";
import JobDetails from "./pages/worker/JobDetails";
import AssignedJobDetails from "./pages/worker/AssignedJobDetails";
import WorkerOnboarding from "./pages/worker/WorkerOnboarding";

// Company Pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import PostJob from "./pages/company/PostJob";
import MyJobs from "./pages/company/MyJobs";
import JobApplications from "./pages/company/JobApplications";
import SubmissionDetails from "./pages/company/SubmissionDetails";
import CompanyOnboarding from "./pages/company/CompanyOnboarding";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingApprovals from "./pages/admin/PendingApprovals";
import AllUsers from "./pages/admin/AllUsers";
import ManageJobs from "./pages/admin/ManageJobs";

import ScrollToTop from "./components/shared/ScrollToTop";

function App() {
  const dispatch = useDispatch();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMe());
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-500 selection:text-white">
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <div className="min-h-screen flex flex-col">
              {/* Navbar */}
              <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/50 py-3 shadow-sm'
                : 'bg-transparent border-transparent py-6'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 ${isScrolled
                        ? 'bg-primary-600 text-white shadow-primary-500/20'
                        : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
                        }`}>
                        <span className="font-bold text-xl">F</span>
                      </div>
                      <span className={`text-2xl font-bold tracking-tight transition-colors ${isScrolled ? 'text-gray-900' : 'text-white'
                        }`}>Freelance</span>
                    </Link>

                    {/* Center Nav Items */}
                    <div className={`hidden md:flex items-center gap-8 font-medium transition-colors ${isScrolled ? 'text-gray-600' : 'text-gray-300'
                      }`}>
                      <a href="#talent" className={`hover:text-primary-500 transition-colors ${!isScrolled && 'hover:text-white'}`}>Find Talent</a>
                      <a href="#work" className={`hover:text-primary-500 transition-colors ${!isScrolled && 'hover:text-white'}`}>Find Work</a>
                      <a href="#why" className={`hover:text-primary-500 transition-colors ${!isScrolled && 'hover:text-white'}`}>Why Us</a>
                      <a href="#enterprise" className={`hover:text-primary-500 transition-colors ${!isScrolled && 'hover:text-white'}`}>Enterprise</a>
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-4">
                      <Link
                        to="/login"
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${isScrolled
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-white hover:bg-white/10'
                          }`}
                      >
                        Log In
                      </Link>
                      <Link
                        to="/register"
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 ${isScrolled
                          ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20'
                          : 'bg-white text-primary-600 hover:bg-gray-50'
                          }`}
                      >
                        Get Started
                      </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className={`md:hidden p-2 rounded-lg ${isScrolled ? 'text-gray-900' : 'text-white'
                      }`}>
                      <FiMenu className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </nav>

              {/* Hero Section */}
              <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0f172a]">
                {/* Dynamic Background */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[128px] animate-pulse"></div>
                  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[128px] animate-pulse delay-1000"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[128px]"></div>
                  {/* Grid Pattern */}
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div className="text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary-200 text-sm font-medium mb-8 backdrop-blur-sm animate-fade-in">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live: 500+ New Jobs Posted Today
                      </div>
                      <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-[1.1] animate-slide-up">
                        Work Without <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Boundaries.</span>
                      </h1>
                      <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed animate-slide-up animation-delay-200">
                        The next-generation platform connecting visionary companies with world-class talent. Secure, fast, and premium.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-400">
                        <Link to="/register" className="btn-primary px-8 py-4 text-lg flex items-center justify-center gap-2 group shadow-purple-500/25 shadow-xl hover:shadow-2xl hover:shadow-purple-500/40">
                          Start Hiring
                          <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/login" className="px-8 py-4 text-lg font-medium text-white border border-white/20 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                          Find Work
                        </Link>
                      </div>

                      {/* Mini Trust Strip */}
                      <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-8 text-gray-500 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <div className="font-bold text-xl">GOOGLE</div>
                        <div className="font-bold text-xl">META</div>
                        <div className="font-bold text-xl">NETFLIX</div>
                        <div className="font-bold text-xl">AIRBNB</div>
                      </div>
                    </div>

                    {/* Right Visual - Floating UI Composition */}
                    <div className="relative hidden lg:block h-[600px] w-full perspective-1000">
                      {/* Floating Card 1: Profile */}
                      <div className="absolute top-10 right-10 w-72 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl transform rotate-y-12 rotate-z-6 hover:rotate-0 transition-all duration-700 z-20 animate-float">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-400"></div>
                          <div>
                            <div className="h-3 w-24 bg-white/20 rounded mb-2"></div>
                            <div className="h-2 w-16 bg-white/10 rounded"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-full bg-white/10 rounded"></div>
                          <div className="h-2 w-5/6 bg-white/10 rounded"></div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <div className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70">UI Design</div>
                          <div className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70">React</div>
                        </div>
                      </div>

                      {/* Floating Card 2: Success Notification */}
                      <div className="absolute top-1/2 left-0 w-64 bg-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -translate-y-1/2 -rotate-z-3 z-30 animate-float animation-delay-2000">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <FiCheckCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">Payment Received</div>
                            <div className="text-sm text-gray-500">$4,500.00</div>
                          </div>
                        </div>
                      </div>

                      {/* Floating Card 3: Job Stats */}
                      <div className="absolute bottom-20 right-20 w-80 bg-[#1e293b] border border-white/10 p-6 rounded-2xl shadow-2xl transform rotate-x-12 rotate-z-3 z-10 animate-float animation-delay-4000">
                        <div className="flex justify-between items-center mb-6">
                          <div className="text-white font-bold">Project Growth</div>
                          <FiTrendingUp className="text-green-400 w-5 h-5" />
                        </div>
                        <div className="flex items-end gap-3 h-32">
                          <div className="w-1/5 bg-indigo-500/30 rounded-t-lg h-[40%]"></div>
                          <div className="w-1/5 bg-indigo-500/50 rounded-t-lg h-[60%]"></div>
                          <div className="w-1/5 bg-indigo-500/70 rounded-t-lg h-[50%]"></div>
                          <div className="w-1/5 bg-indigo-500/90 rounded-t-lg h-[80%]"></div>
                          <div className="w-1/5 bg-indigo-500 rounded-t-lg h-[100%] shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Find Talent */}
              <div id="talent" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse Talent by Category</h2>
                    <p className="text-xl text-gray-500">Find the perfect professional for any project.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { icon: FiCode, label: 'Development', color: 'text-blue-600', bg: 'bg-blue-50' },
                      { icon: FiPenTool, label: 'Design', color: 'text-pink-600', bg: 'bg-pink-50' },
                      { icon: FiMonitor, label: 'Marketing', color: 'text-orange-600', bg: 'bg-orange-50' },
                      { icon: FiSmartphone, label: 'Mobile Apps', color: 'text-green-600', bg: 'bg-green-50' },
                      { icon: FiDatabase, label: 'Data Science', color: 'text-purple-600', bg: 'bg-purple-50' },
                      { icon: FiLayout, label: 'Product Mgmt', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { icon: FiGlobe, label: 'Translation', color: 'text-teal-600', bg: 'bg-teal-50' },
                      { icon: FiPieChart, label: 'Finance', color: 'text-red-600', bg: 'bg-red-50' },
                    ].map((cat, i) => (
                      <div key={i} className="group p-6 rounded-2xl border border-gray-100 hover:border-primary-100 hover:shadow-xl transition-all duration-300 cursor-pointer text-center">
                        <div className={`w-14 h-14 mx-auto ${cat.bg} ${cat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <cat.icon className="w-7 h-7" />
                        </div>
                        <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{cat.label}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION: Find Work */}
              <div id="work" className="py-24 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-purple-600 rounded-[2rem] transform rotate-3 opacity-10"></div>
                      <div className="relative bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100">
                        {/* Mock Job Card */}
                        <div className="space-y-6">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                              <div className="w-12 h-12 rounded-lg bg-gray-100"></div>
                              <div className="flex-1">
                                <div className="h-3 w-32 bg-gray-200 rounded mb-2"></div>
                                <div className="h-2 w-20 bg-gray-100 rounded"></div>
                              </div>
                              <div className="text-right">
                                <div className="h-3 w-16 bg-primary-100 rounded mb-2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="order-1 lg:order-2">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
                        For Freelancers
                      </div>
                      <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Find great work, <br /> grow your career</h2>
                      <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        Meet clients you’re excited to work with and take your career or business to new heights.
                      </p>
                      <ul className="space-y-4 mb-10">
                        {[
                          'Find opportunities for every stage of your freelance career',
                          'Control when, where, and how you work',
                          'Explore different ways to earn'
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-gray-700">
                            <FiCheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                        Find Opportunities
                        <FiArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Why Us (Bento Grid) */}
              <div id="why" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">scale up</span></h2>
                    <p className="text-xl text-gray-600">Powerful features designed for modern teams and ambitious freelancers.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {/* Large Card */}
                    <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mb-6">
                          <FiShield className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise-Grade Security</h3>
                        <p className="text-gray-600 text-lg max-w-md">
                          Your data and payments are protected by industry-leading encryption. We hold payments in escrow until you're 100% satisfied.
                        </p>
                      </div>
                      <div className="absolute bottom-8 right-8 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12">
                        <FiShield className="w-48 h-48" />
                      </div>
                    </div>

                    {/* Tall Card */}
                    <div className="md:row-span-2 bg-[#0f172a] rounded-3xl p-8 border border-gray-800 shadow-xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-900/50"></div>
                      <div className="relative z-10 h-full flex flex-col">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm">
                          <FiUsers className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Global Talent Pool</h3>
                        <p className="text-gray-400 text-lg mb-8">
                          Access vetted professionals from over 100 countries.
                        </p>

                        {/* Animated List */}
                        <div className="mt-auto space-y-3">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm transform translate-x-0 group-hover:translate-x-2 transition-transform" style={{ transitionDelay: `${i * 100}ms` }}>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                              <div className="h-2 w-20 bg-white/20 rounded"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Small Card 1 */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                      <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                        <FiCheckCircle className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Assured</h3>
                      <p className="text-gray-600">Review work before releasing funds.</p>
                    </div>

                    {/* Small Card 2 */}
                    <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-3xl p-8 shadow-lg text-white group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm">
                          <FiStar className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Top Rated</h3>
                        <p className="text-primary-100">Work with the top 1% of talent.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Enterprise */}
              <div id="enterprise" className="py-24 bg-[#0f172a] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-900/20 rounded-full blur-[128px]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="md:w-1/2">
                      <div className="text-primary-400 font-bold tracking-wider uppercase mb-4">Enterprise Suite</div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Scale your workforce <br /> with confidence.
                      </h2>
                      <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                        Get a dedicated hiring platform tailored to your organization's needs. Compliance, security, and scalability built-in.
                      </p>
                      <div className="grid grid-cols-2 gap-6 mb-10">
                        <div>
                          <div className="text-3xl font-bold text-white mb-1">90%</div>
                          <div className="text-sm text-gray-500">Faster Hiring</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-white mb-1">24/7</div>
                          <div className="text-sm text-gray-500">Premium Support</div>
                        </div>
                      </div>
                      <button className="bg-white text-[#0f172a] px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                        Contact Sales
                      </button>
                    </div>
                    <div className="md:w-1/2">
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                          <div>
                            <div className="font-bold text-lg">Enterprise Dashboard</div>
                            <div className="text-sm text-gray-400">Team Management</div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="h-16 bg-white/5 rounded-xl w-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-gradient-to-br from-primary-900 to-[#0f172a] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-500/30 rounded-full blur-[100px]"></div>
                      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="relative z-10">
                      <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to start your journey?</h2>
                      <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Join thousands of companies and freelancers building the future together.
                      </p>
                      <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-[#0f172a] bg-white rounded-2xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl">
                        Get Started for Free
                        <FiArrowRight className="ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/worker/reviews"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <MyReviews />
            </ProtectedRoute>
          }
        />
        {/* Worker Routes */}
        <Route
          path="/worker/dashboard"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/jobs"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <BrowseJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/jobs/:id"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <JobDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/saved-searches"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <SavedSearches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/browse-jobs"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <BrowseJobs />
            </ProtectedRoute>
          }
        />
        {/* Company Routes */}
        <Route
          path="/company/dashboard"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/post-job"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/jobs"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <MyJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/jobs/:id"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <JobApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/submissions"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <Submissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/submissions/:submissionId"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <SubmissionDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/reviews"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <CompanyReviews />
            </ProtectedRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pending"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PendingApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AllUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/applications"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/jobs/assigned"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <AssignedJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/jobs/assigned/:jobId"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <AssignedJobDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/profile"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <WorkerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/profile"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <CompanyProfile />
            </ProtectedRoute>
          }
        />

        {/* Message Routes */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute allowedRoles={["worker", "company"]}>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/messages"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/messages"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <Messages />
            </ProtectedRoute>
          }
        />
        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center px-4">
              <div className="text-center">
                <h1 className="text-8xl font-display font-bold text-gradient mb-4">
                  404
                </h1>
                <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
                <a href="/" className="btn-primary inline-block">
                  <span>Go Home</span>
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
