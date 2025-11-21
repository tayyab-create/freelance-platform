import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workerAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiBriefcase, FiCheckCircle, FiClock, FiStar, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

const WorkerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await workerAPI.getDashboard();
      console.log('Dashboard response:', response.data);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Dashboard Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load dashboard';
      setError(errorMessage);
      toast.error(errorMessage);
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="card text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchDashboard} className="btn-primary">
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="card text-center py-12">
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <FiUser className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {dashboardData.profile?.name || 'Worker'}!
              </h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your account</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData.applications?.total || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FiBriefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Link to="/worker/applications" className="text-primary-600 text-sm mt-4 inline-block hover:underline">
              View Details →
            </Link>
          </div>

          <div className="card hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData.applications?.pending || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <FiClock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData.jobs?.active || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed Jobs</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData.jobs?.completed || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <FiCheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Status */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Profile Status</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Profile Completion</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <Link to="/worker/profile" className="btn-primary">
              Complete Profile
            </Link>
          </div>
        </div>

        {/* Quick Actions & Rating */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/worker/jobs" className="btn-secondary w-full">
                Browse Available Jobs
              </Link>
              <Link to="/worker/applications" className="btn-secondary w-full">
                View My Applications
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4">Your Rating</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(dashboardData.profile?.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {dashboardData.profile?.rating?.toFixed(1) || '0.0'}
                </p>
                <p className="text-sm text-gray-600">
                  {dashboardData.profile?.totalReviews || 0} reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkerDashboard;