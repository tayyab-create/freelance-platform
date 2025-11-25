import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { StatCard, SkeletonLoader } from '../../components/shared';

import {
  FiBriefcase, FiUsers, FiCheckCircle, FiClock, FiPlus,
  FiTrendingUp, FiActivity, FiStar, FiArrowRight, FiFileText
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { calculateCompanyProfileCompletion } from '../../utils/profileCompletion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CompanyDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await companyAPI.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  // Prepare data for charts
  const jobStatusData = [
    { name: 'Active', value: stats?.jobs?.active || 0, color: '#3b82f6' }, // Blue
    { name: 'Assigned', value: stats?.jobs?.assigned || 0, color: '#8b5cf6' }, // Purple
    { name: 'Completed', value: stats?.jobs?.completed || 0, color: '#10b981' }, // Green
  ].filter(item => item.value > 0);

  const statCards = [
    {
      title: 'Total Jobs Posted',
      value: stats?.jobs?.total || 0,
      icon: FiBriefcase,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-white',
      borderColor: 'border-blue-500',
      link: '/company/jobs',
    },
    {
      title: 'Active Jobs',
      value: stats?.jobs?.active || 0,
      icon: FiClock,
      color: 'yellow',
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'from-yellow-50 to-white',
      borderColor: 'border-yellow-500',
      link: '/company/jobs',
    },
    {
      title: 'Assigned Jobs',
      value: stats?.jobs?.assigned || 0,
      icon: FiUsers,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-white',
      borderColor: 'border-purple-500',
      link: '/company/jobs',
    },
    {
      title: 'Completed Jobs',
      value: stats?.jobs?.completed || 0,
      icon: FiCheckCircle,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-white',
      borderColor: 'border-green-500',
      link: '/company/jobs?status=completed',
    },
  ];

  const profileCompletion = calculateCompanyProfileCompletion(stats.profile);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Enhanced Header */}
        <div className="card bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden relative shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 right-20 w-40 h-40 bg-white opacity-5 rounded-full"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="h-24 w-24 rounded-2xl object-cover border-4 border-white/30 shadow-2xl"
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-white/20 flex items-center justify-center text-white text-4xl font-bold shadow-2xl backdrop-blur-sm border-2 border-white/30">
                  {user?.name?.[0]?.toUpperCase() || 'C'}
                </div>
              )}
              <div>
                <h1 className="text-4xl font-black mb-2 tracking-tight">
                  Welcome back, {user?.name || stats?.profile?.name || 'Company'}! 👋
                </h1>
                <p className="text-blue-100 text-lg font-medium">Manage your jobs and find the best talent</p>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-4xl font-black">{stats?.applications?.total || 0}</div>
              <div className="text-blue-100 font-medium">Total Applications</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`card group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${stat.bgGradient} border-l-4 ${stat.borderColor}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                {stat.link && (
                  <Link to={stat.link} className={`text-${stat.color}-600 hover:bg-${stat.color}-50 p-2 rounded-full transition-colors`}>
                    <FiArrowRight className="h-5 w-5" />
                  </Link>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">{stat.title}</p>
              <p className="text-4xl font-black text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Status Chart */}
          <div className="lg:col-span-2 card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FiActivity className="text-blue-600" />
              Job Distribution
            </h3>
            {jobStatusData.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center justify-around">
                <div className="h-64 w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={jobStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {jobStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  {jobStatusData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-semibold text-gray-700">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{item.value} Jobs</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <FiBriefcase className="h-12 w-12 mb-2 opacity-50" />
                <p>No job data available yet</p>
              </div>
            )}
          </div>

          {/* Quick Actions & Profile Status */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="card bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FiStar className="text-yellow-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/company/post-job"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FiPlus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">Post New Job</p>
                    <p className="text-xs text-gray-400">Find talent</p>
                  </div>
                  <FiArrowRight className="ml-auto text-gray-400 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  to="/company/jobs"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FiBriefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">Manage Jobs</p>
                    <p className="text-xs text-gray-400">View all listings</p>
                  </div>
                  <FiArrowRight className="ml-auto text-gray-400 group-hover:text-white transition-colors" />
                </Link>
              </div>
            </div>

            {/* Profile Completion */}
            {profileCompletion < 100 && (
              <div className="card border-2 border-blue-100 bg-blue-50/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Profile Status</h3>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    {profileCompletion}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                <Link to="/company/profile" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Complete Profile <FiArrowRight />
                </Link>
              </div>
            )}

            {/* Company Rating */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Company Rating</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`h-6 w-6 ${star <= Math.round(stats?.profile?.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-3xl font-black text-gray-900">
                    {stats?.profile?.rating?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-sm text-gray-500">Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;