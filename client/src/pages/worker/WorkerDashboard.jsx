import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { workerAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import {
  FiBriefcase, FiCheckCircle, FiClock, FiStar, FiTrendingUp,
  FiTrendingDown, FiAward, FiTarget, FiActivity, FiCalendar,
  FiDollarSign, FiArrowRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { calculateWorkerProfileCompletion } from '../../utils/profileCompletion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
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

  // Mock data for charts (replace with real data from backend)
  const applicationsTrend = [
    { month: 'Jan', applications: 4, accepted: 2 },
    { month: 'Feb', applications: 6, accepted: 3 },
    { month: 'Mar', applications: 8, accepted: 5 },
    { month: 'Apr', applications: 5, accepted: 3 },
    { month: 'May', applications: 7, accepted: 4 },
    { month: 'Jun', applications: 10, accepted: 6 },
  ];

  const earningsTrend = [
    { month: 'Jan', earnings: 1200 },
    { month: 'Feb', earnings: 1800 },
    { month: 'Mar', earnings: 2400 },
    { month: 'Apr', earnings: 1900 },
    { month: 'May', earnings: 2800 },
    { month: 'Jun', earnings: 3200 },
  ];

  const skillsData = [
    { name: 'JavaScript', value: 85, color: '#F7DF1E' },
    { name: 'React', value: 90, color: '#61DAFB' },
    { name: 'Node.js', value: 75, color: '#339933' },
    { name: 'Python', value: 70, color: '#3776AB' },
  ];

  const recentActivities = [
    { id: 1, action: 'Applied to Full Stack Developer position', time: '2 hours ago', icon: FiBriefcase, color: 'blue' },
    { id: 2, action: 'Completed project for TechCorp', time: '1 day ago', icon: FiCheckCircle, color: 'green' },
    { id: 3, action: 'Received 5-star review from ClientX', time: '2 days ago', icon: FiStar, color: 'yellow' },
    { id: 4, action: 'Updated profile skills', time: '3 days ago', icon: FiActivity, color: 'purple' },
  ];

  const upcomingDeadlines = [
    { id: 1, project: 'E-commerce Platform', deadline: '2 days', priority: 'high' },
    { id: 2, project: 'Mobile App UI', deadline: '5 days', priority: 'medium' },
    { id: 3, project: 'Dashboard Design', deadline: '1 week', priority: 'low' },
  ];

  const achievements = [
    { id: 1, title: 'Rising Star', description: 'Complete 5 jobs', unlocked: true, icon: '⭐' },
    { id: 2, title: 'Perfect Score', description: 'Maintain 5.0 rating', unlocked: true, icon: '🏆' },
    { id: 3, title: 'Speed Demon', description: 'Complete job in 24hrs', unlocked: false, icon: '⚡' },
    { id: 4, title: 'Century Club', description: 'Earn $10,000', unlocked: false, icon: '💰' },
  ];

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
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold shadow-xl backdrop-blur-sm">
                  {user?.name?.[0]?.toUpperCase() || 'W'}
                </div>
              )}
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
          <>
            {/* Enhanced Stats Grid with Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiBriefcase className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <FiTrendingUp className="h-4 w-4" />
                    <span className="text-sm font-semibold">+12%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {dashboardData.applications?.total || 0}
                </p>
                <Link to="/worker/applications" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
                  View all <FiArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="card group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiClock className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold">Same</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {dashboardData.applications?.pending || 0}
                </p>
                <div className="text-gray-400 text-sm">Awaiting response</div>
              </div>

              <div className="card group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiCheckCircle className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <FiTrendingUp className="h-4 w-4" />
                    <span className="text-sm font-semibold">+8%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Active Jobs</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {dashboardData.jobs?.active || 0}
                </p>
                <div className="text-gray-400 text-sm">Currently working</div>
              </div>

              <div className="card group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiAward className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <FiTrendingUp className="h-4 w-4" />
                    <span className="text-sm font-semibold">+15%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Completed Jobs</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {dashboardData.jobs?.completed || 0}
                </p>
                <div className="text-gray-400 text-sm">Total finished</div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Applications Trend Chart */}
              <div className="card">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiActivity className="text-primary-600" />
                  Applications Trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
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
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiDollarSign className="text-green-600" />
                  Earnings Trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={earningsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skills & Profile Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Completion */}
              {profileCompletion < 100 && (
                <div className="card lg:col-span-2 bg-gradient-to-br from-primary-50 to-white border border-primary-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <FiTarget className="text-primary-600" />
                        Complete Your Profile
                      </h2>
                      <p className="text-gray-600 text-sm">Unlock more opportunities by completing your profile!</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-primary-600">{profileCompletion}%</div>
                      <div className="text-sm text-gray-600">Complete</div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: `${profileCompletion}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <Link to="/worker/profile" className="btn-primary mt-4 inline-flex items-center gap-2">
                    Complete Profile <FiArrowRight />
                  </Link>
                </div>
              )}

              {/* Rating Card */}
              <div className="card bg-gradient-to-br from-yellow-50 to-white border border-yellow-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiStar className="text-yellow-500" />
                  Your Rating
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`h-7 w-7 ${star <= Math.round(dashboardData.profile?.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold text-gray-900">
                        {dashboardData.profile?.rating?.toFixed(1) || '0.0'}
                      </p>
                      <p className="text-sm text-gray-600">
                        / 5.0
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Based on {dashboardData.profile?.totalReviews || 0} reviews
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity & Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="card">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiActivity className="text-primary-600" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className={`h-10 w-10 rounded-full bg-${activity.color}-100 flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`h-5 w-5 text-${activity.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium text-sm">{activity.action}</p>
                        <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/worker/applications" className="btn-secondary w-full mt-4">
                  View All Activity
                </Link>
              </div>

              {/* Achievements */}
              <div className="card">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiAward className="text-primary-600" />
                  Achievements
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-xl text-center transition-all duration-300 ${achievement.unlocked
                          ? 'bg-gradient-to-br from-primary-50 to-white border-2 border-primary-200 hover:shadow-lg hover:-translate-y-1'
                          : 'bg-gray-50 border-2 border-gray-200 opacity-60'
                        }`}
                    >
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">{achievement.title}</h4>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                      {achievement.unlocked && (
                        <div className="mt-2">
                          <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Unlocked</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Deadlines */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiTarget className="text-primary-600" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link to="/worker/jobs" className="btn-primary w-full flex items-center justify-center gap-2">
                    <FiBriefcase /> Browse Available Jobs
                  </Link>
                  <Link to="/worker/applications" className="btn-secondary w-full flex items-center justify-center gap-2">
                    <FiCheckCircle /> View My Applications
                  </Link>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiCalendar className="text-primary-600" />
                  Upcoming Deadlines
                </h3>
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline) => (
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
                  ))}
                </div>
              </div>
            </div>
          </>
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