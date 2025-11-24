import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiBriefcase, FiUsers, FiCheckCircle, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { calculateCompanyProfileCompletion } from '../../utils/profileCompletion';

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

  const statCards = [
    {
      title: 'Total Jobs Posted',
      value: stats?.jobs?.total || 0,
      icon: FiBriefcase,
      color: 'blue',
      link: '/company/jobs',
    },
    {
      title: 'Active Jobs',
      value: stats?.jobs?.active || 0,
      icon: FiClock,
      color: 'yellow',
    },
    {
      title: 'Assigned Jobs',
      value: stats?.jobs?.assigned || 0,
      icon: FiUsers,
      color: 'purple',
    },
    {
      title: 'Completed Jobs',
      value: stats?.jobs?.completed || 0,
      icon: FiCheckCircle,
      color: 'green',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="card">
          <div className="flex items-center gap-4">
            {/* Profile Picture or Avatar */}
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {user?.name?.[0]?.toUpperCase() || 'C'}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || stats?.profile?.name || 'Company'}!
              </h1>
              <p className="text-gray-600 mt-1">Manage your jobs and find the best talent</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="card hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
              {stat.link && (
                <Link to={stat.link} className="text-primary-600 text-sm mt-4 inline-block hover:underline">
                  View Details →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Total Applications */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Applications Received</h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {stats?.applications?.total || 0}
              </p>
            </div>
            <FiUsers className="h-16 w-16 text-primary-200" />
          </div>
        </div>

        {/* Profile Status */}
        {calculateCompanyProfileCompletion(stats.profile) < 100 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Profile Status</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Profile Completion</span>
                  <span className="text-sm font-medium">{calculateCompanyProfileCompletion(stats.profile)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${calculateCompanyProfileCompletion(stats.profile)}%` }}></div>
                </div>
              </div>
              <Link to="/company/profile" className="btn-primary">
                Complete Profile
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/company/post-job" className="btn-primary w-full">
                Post a New Job
              </Link>
              <Link to="/company/jobs" className="btn-secondary w-full">
                View My Jobs
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4">Company Rating</h3>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary-600">
                  {stats?.profile?.rating?.toFixed(1) || '0.0'}
                </p>
                <p className="text-sm text-gray-600 mt-1">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;