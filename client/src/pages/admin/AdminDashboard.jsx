import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiUsers, FiBriefcase, FiFileText, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      icon: FiUsers,
      color: 'blue',
      link: '/admin/users',
    },
    {
      title: 'Pending Approvals',
      value: stats?.users?.pending || 0,
      icon: FiClock,
      color: 'yellow',
      link: '/admin/pending',
    },
    {
      title: 'Total Jobs',
      value: stats?.jobs?.total || 0,
      icon: FiBriefcase,
      color: 'purple',
    },
    {
      title: 'Total Applications',
      value: stats?.applications?.total || 0,
      icon: FiFileText,
      color: 'green',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your freelance platform</p>
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

        {/* User Breakdown */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Workers</h3>
            <p className="text-3xl font-bold text-primary-600">{stats?.users?.workers || 0}</p>
            <p className="text-sm text-gray-600 mt-2">
              {stats?.users?.approved || 0} Approved
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Companies</h3>
            <p className="text-3xl font-bold text-primary-600">{stats?.users?.companies || 0}</p>
            <p className="text-sm text-gray-600 mt-2">
              {stats?.users?.approved || 0} Approved
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Job Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active:</span>
                <span className="font-semibold">{stats?.jobs?.active || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-semibold">{stats?.jobs?.completed || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/admin/pending" className="btn-primary">
              Review Pending Approvals
            </Link>
            <Link to="/admin/users" className="btn-secondary">
              Manage All Users
            </Link>
            <Link to="/admin/users?status=rejected" className="btn-secondary">
              View Rejected Users
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;