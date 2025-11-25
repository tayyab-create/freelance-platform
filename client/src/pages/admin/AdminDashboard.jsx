import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { StatCard, SkeletonLoader } from '../../components/shared';
import {
  FiUsers, FiBriefcase, FiFileText, FiClock, FiCheckCircle,
  FiXCircle, FiActivity, FiArrowRight, FiShield, FiDollarSign
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
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

  // Prepare chart data
  const userDistributionData = [
    { name: 'Workers', value: stats?.users?.workers || 0, color: '#8b5cf6' }, // Purple
    { name: 'Companies', value: stats?.users?.companies || 0, color: '#3b82f6' }, // Blue
  ].filter(item => item.value > 0);

  const jobStatusData = [
    { name: 'Active', value: stats?.jobs?.active || 0, color: '#10b981' }, // Green
    { name: 'Completed', value: stats?.jobs?.completed || 0, color: '#6366f1' }, // Indigo
  ].filter(item => item.value > 0);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      icon: FiUsers,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-white',
      borderColor: 'border-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Pending Approvals',
      value: stats?.users?.pending || 0,
      icon: FiClock,
      color: 'yellow',
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'from-yellow-50 to-white',
      borderColor: 'border-yellow-500',
      link: '/admin/pending',
    },
    {
      title: 'Total Jobs',
      value: stats?.jobs?.total || 0,
      icon: FiBriefcase,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-white',
      borderColor: 'border-purple-500',
      link: '/admin/jobs',
    },
    {
      title: 'Total Applications',
      value: stats?.applications?.total || 0,
      icon: FiFileText,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-white',
      borderColor: 'border-green-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Enhanced Header */}
        <div className="card bg-gradient-to-r from-red-600 to-rose-700 text-white overflow-hidden relative shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 right-20 w-40 h-40 bg-white opacity-5 rounded-full"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-2xl bg-white/20 flex items-center justify-center text-white text-4xl font-bold shadow-2xl backdrop-blur-sm border-2 border-white/30">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2 tracking-tight">
                  Welcome back, {user?.name || 'Admin'}! 👋
                </h1>
                <p className="text-red-100 text-lg font-medium">Platform Overview & Management</p>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-4xl font-black">{stats?.users?.pending || 0}</div>
              <div className="text-red-100 font-medium">Pending Approvals</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={FiUsers}
            gradient="from-blue-500 to-cyan-500"
          />

          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={FiClock}
            gradient="from-yellow-500 to-orange-500"
          />

          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={FiBriefcase}
            gradient="from-green-500 to-emerald-500"
          />

          <StatCard
            title="Total Revenue"
            value={`$${stats.revenue}`}
            icon={FiDollarSign}
            gradient="from-purple-500 to-pink-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Distribution */}
            <div className="card">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FiUsers className="text-blue-600" />
                User Distribution
              </h3>
              <div className="flex flex-col md:flex-row items-center justify-around h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Job Status */}
            <div className="card">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FiBriefcase className="text-green-600" />
                Job Overview
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobStatusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                      {jobStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="card bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FiShield className="text-red-500" />
                Admin Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/admin/pending"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-yellow-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FiClock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">Review Pending</p>
                    <p className="text-xs text-gray-400">{stats?.users?.pending || 0} waiting</p>
                  </div>
                  <FiArrowRight className="ml-auto text-gray-400 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  to="/admin/users"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FiUsers className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">Manage Users</p>
                    <p className="text-xs text-gray-400">View all accounts</p>
                  </div>
                  <FiArrowRight className="ml-auto text-gray-400 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  to="/admin/jobs"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FiBriefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">Manage Jobs</p>
                    <p className="text-xs text-gray-400">View all postings</p>
                  </div>
                  <FiArrowRight className="ml-auto text-gray-400 group-hover:text-white transition-colors" />
                </Link>
              </div>
            </div>

            {/* Platform Health / Summary */}
            <div className="card border-2 border-gray-100">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Platform Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-green-600" />
                    <span className="font-medium text-gray-700">Approved Users</span>
                  </div>
                  <span className="font-bold text-green-700">{stats?.users?.approved || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FiXCircle className="text-red-600" />
                    <span className="font-medium text-gray-700">Rejected Users</span>
                  </div>
                  <span className="font-bold text-red-700">{stats?.users?.rejected || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;