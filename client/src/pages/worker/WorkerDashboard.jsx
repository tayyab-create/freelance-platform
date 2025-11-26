import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { workerAPI } from '../../services/api';
import { calculateWorkerProfileCompletion } from '../../utils/profileCompletion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import DashboardHeader from '../../components/worker/dashboard/DashboardHeader';
import StatsOverview from '../../components/worker/dashboard/StatsOverview';
import ApplicationsTrendChart from '../../components/worker/dashboard/ApplicationsTrendChart';
import EarningsTrendChart from '../../components/worker/dashboard/EarningsTrendChart';
import UpcomingDeadlines from '../../components/worker/dashboard/UpcomingDeadlines';
import ProfileCompletionWidget from '../../components/worker/dashboard/ProfileCompletionWidget';
import RatingCard from '../../components/worker/dashboard/RatingCard';
import QuickActions from '../../components/worker/dashboard/QuickActions';
import Achievements from '../../components/worker/dashboard/Achievements';
import RecentActivity from '../../components/worker/dashboard/RecentActivity';
import { PageHeader } from '../../components/shared';
import { getWorkerBreadcrumbs } from '../../utils/breadcrumbUtils';

const WorkerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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
        <div className="space-y-6">
          <SkeletonLoader type="card" count={1} />
          <SkeletonLoader type="stat" count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonLoader type="card" count={2} />
          </div>
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

  // Use real data from backend
  const applicationsTrend = dashboardData.applicationsTrend || [];
  const earningsTrend = dashboardData.earningsTrend || [];
  // Limit to 5 recent activities
  const recentActivities = (dashboardData.recentActivities || []).slice(0, 3);
  const upcomingDeadlines = dashboardData.upcomingDeadlines || [];
  const achievements = dashboardData.achievements || [];

  const profileCompletion = calculateWorkerProfileCompletion(dashboardData.profile);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <PageHeader
          breadcrumbs={getWorkerBreadcrumbs('dashboard')}
        />

        {/* Enhanced Header with Profile Picture */}
        <DashboardHeader user={user} dashboardData={dashboardData} />

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['overview', 'analytics', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Grid */}
              <StatsOverview dashboardData={dashboardData} />

              {/* Charts */}
              <div className="space-y-8">
                {/* Applications Trend Chart */}
                <ApplicationsTrendChart data={applicationsTrend} />

                {/* Earnings Trend Chart */}
                <EarningsTrendChart data={earningsTrend} totalEarnings={dashboardData.earnings?.total} />

                {/* Upcoming Deadlines */}
                <UpcomingDeadlines deadlines={upcomingDeadlines} />
              </div>
            </div>

            {/* Right Column - Sidebar (1/3 width) */}
            <div className="space-y-8">
              {/* Profile Completion - Only show if not 100% */}
              <ProfileCompletionWidget completion={profileCompletion} />

              {/* Rating Card */}
              <RatingCard rating={dashboardData.profile?.rating} totalReviews={dashboardData.profile?.totalReviews} />

              {/* Quick Actions */}
              <QuickActions />

              {/* Achievements */}
              <Achievements achievements={achievements} />

              {/* Recent Activity */}
              <RecentActivity activities={recentActivities} />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Analytics Dashboard - Coming Soon</h2>
            <p className="text-gray-600">Advanced analytics and insights will be available here.</p>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Activity Timeline - Coming Soon</h2>
            <p className="text-gray-600">Detailed activity timeline will be available here.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkerDashboard;