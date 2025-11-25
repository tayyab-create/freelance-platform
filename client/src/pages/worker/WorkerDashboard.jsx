import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { workerAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { StatCard, SkeletonLoader, Avatar } from '../../components/shared';
import {
  FiBriefcase, FiCheckCircle, FiClock, FiStar, FiActivity, FiCalendar,
  FiDollarSign, FiArrowRight, FiAward, FiTarget
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { calculateWorkerProfileCompletion } from '../../utils/profileCompletion';
import {
  LineChart, Line, AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, Legend, XAxis, YAxis
} from 'recharts';

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
        {/* Enhanced Header with Profile Picture */}
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 right-20 w-40 h-40 bg-white opacity-5 rounded-full"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                src={user?.profilePhoto}
                name={user?.name || 'Worker'}
                size="2xl"
                className="border-4 border-white shadow-xl"
              />
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {user?.name || dashboardData.profile?.name || 'Worker'}! 👋
                </h1>
                <p className="text-primary-100 text-lg">Here's your performance overview</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">${(dashboardData.earnings?.total || 0).toLocaleString()}</div>
              <div className="text-primary-100 text-sm">Total Earnings</div>
            </div>
          </div>
        </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                  title="Applications"
                  value={dashboardData.applications?.total || 0}
                  change={dashboardData.trends?.applications || 0}
                  trend={dashboardData.trends?.applications >= 0 ? "up" : "down"}
                  icon={FiBriefcase}
                  gradient="from-blue-500 to-cyan-500"
                />

                <StatCard
                  title="Jobs Completed"
                  value={dashboardData.jobs?.completed || 0}
                  change={dashboardData.trends?.completedJobs || 0}
                  trend={dashboardData.trends?.completedJobs >= 0 ? "up" : "down"}
                  icon={FiCheckCircle}
                  gradient="from-green-500 to-emerald-500"
                />

                <StatCard
                  title="Active Jobs"
                  value={dashboardData.jobs?.active || 0}
                  change={dashboardData.trends?.activeJobs || 0}
                  trend={dashboardData.trends?.activeJobs >= 0 ? "up" : "down"}
                  icon={FiClock}
                  gradient="from-purple-500 to-pink-500"
                />

                <StatCard
                  title="Avg Rating"
                  value={dashboardData.profile?.rating?.toFixed(1) || '0.0'}
                  icon={FiStar}
                  gradient="from-yellow-500 to-orange-500"
                />
              </div>

              {/* Charts */}
              <div className="space-y-8">
                {/* Applications Trend Chart */}
                <div className="card">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FiActivity className="text-primary-600" />
                    Applications Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={applicationsTrend}>
                      <defs>
                        <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="applications" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorApplications)" name="Applications" />
                      <Area type="monotone" dataKey="accepted" stroke="#10b981" fillOpacity={1} fill="url(#colorAccepted)" name="Accepted" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Earnings Trend Chart */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <FiDollarSign className="text-green-600" />
                      Earnings Trend
                    </h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">${(dashboardData.earnings?.total || 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Earned</div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={earningsTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        formatter={(value) => `$${value.toLocaleString()}`}
                        labelStyle={{ color: '#111827' }}
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="earnings"
                        name="Earnings ($)"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Upcoming Deadlines */}
                <div className="card">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiCalendar className="text-primary-600" />
                    Upcoming Deadlines
                  </h3>
                  <div className="space-y-3">
                    {upcomingDeadlines.length > 0 ? (
                      upcomingDeadlines.map((deadline) => (
                        <div key={deadline.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{deadline.project}</p>
                            <p className="text-xs text-gray-600 mt-1">Due in {deadline.deadline}</p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full ${deadline.priority === 'high' ? 'bg-red-100 text-red-700' :
                            deadline.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                            {deadline.priority}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-2">No upcoming deadlines</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar (1/3 width) */}
            <div className="space-y-8">
              {/* Profile Completion - Only show if not 100% */}
              {profileCompletion < 100 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
                    <span className="text-lg font-bold text-gray-900">{profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-[#8b5cf6] h-6 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  <Link to="/worker/profile" className="text-sm text-primary-600 font-medium mt-3 inline-block hover:underline">
                    Complete Profile &rarr;
                  </Link>
                </div>
              )}

              {/* Rating Card */}
              <div className="bg-[#FFFBEB] p-6 rounded-2xl shadow-sm border border-yellow-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                  <FiStar className="text-yellow-500 fill-current" />
                  Your Rating
                </h3>

                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`h-8 w-8 ${star <= Math.round(dashboardData.profile?.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-black text-gray-900">
                    {dashboardData.profile?.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-gray-500 font-medium">/ 5.0</span>
                </div>

                <p className="text-gray-600 font-medium">
                  Based on {dashboardData.profile?.totalReviews || 0} reviews
                </p>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiTarget className="text-primary-600" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link to="/worker/jobs" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    <FiBriefcase /> Browse Available Jobs
                  </Link>
                  <Link to="/worker/applications" className="btn-secondary w-full flex items-center justify-center gap-2 py-3">
                    <FiCheckCircle /> View My Applications
                  </Link>
                </div>
              </div>

              {/* Achievements */}
              <div className="card">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiAward className="text-primary-600" />
                  Achievements
                </h3>
                <div className="space-y-4">
                  {achievements.slice(0, 2).map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-xl flex items-center gap-4 transition-all duration-300 ${achievement.unlocked
                        ? 'bg-gradient-to-br from-primary-50 to-white border border-primary-200'
                        : 'bg-gray-50 border border-gray-200 opacity-60'
                        }`}
                    >
                      <div className="text-3xl">{achievement.icon}</div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{achievement.title}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Recent Activity */}
              <div className="card">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiActivity className="text-primary-600" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => {
                      let icon = FiActivity;
                      let color = 'blue';

                      if (activity.type === 'application') {
                        icon = FiBriefcase;
                        color = 'blue';
                      } else if (activity.type === 'job_completed') {
                        icon = FiCheckCircle;
                        color = 'green';
                      } else if (activity.type === 'review') {
                        icon = FiStar;
                        color = 'yellow';
                      }

                      const Icon = icon;

                      return (
                        <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-5 w-5 text-${color}-600`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium text-sm">{activity.action}</p>
                            <p className="text-gray-500 text-xs mt-1">{new Date(activity.time).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
                <Link
                  to="/worker/applications"
                  className="mt-4 w-full py-2.5 flex items-center justify-center gap-2 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-primary-600 hover:border-primary-200 transition-all duration-200"
                >
                  View All Activity
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              </div>
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