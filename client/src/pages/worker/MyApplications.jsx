import React, { useEffect, useState } from 'react';
import { workerAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiBriefcase, FiClock, FiCheckCircle, FiX, FiAlertCircle, FiFileText, FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PageHeader, EmptyState, SkeletonLoader } from '../../components/shared';
import ApplicationCard from '../../components/shared/ApplicationCard';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletedCount, setDeletedCount] = useState(0);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await workerAPI.getMyApplications();
      setApplications(response.data.data);
      if (response.data.deletedCount) {
        setDeletedCount(response.data.deletedCount);
      }
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter(app => app.status === filter);

  // Count applications by status
  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <PageHeader
          title="My Applications"
          subtitle="Track all your job applications"
          breadcrumbs={[
            { label: 'Dashboard', href: '/worker/dashboard' },
            { label: 'Applications' }
          ]}
          actions={
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-3 rounded-2xl shadow-lg">
              <p className="text-white font-bold text-lg">{applications.length} Total</p>
            </div>
          }
        />

        {/* Deleted Jobs Notification */}
        {deletedCount > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <span className="font-bold">{deletedCount} application(s)</span> were removed because the job postings were deleted by the admin or company.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDeletedCount(0)}
              className="ml-auto pl-3 text-red-500 hover:text-red-700 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Simple Stats Row */}
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FiBriefcase className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</p>
                <p className="text-lg font-bold text-gray-900">{counts.all}</p>
              </div>
            </div>
            <div className="w-px bg-gray-100 h-10"></div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                <FiClock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending</p>
                <p className="text-lg font-bold text-gray-900">{counts.pending}</p>
              </div>
            </div>
            <div className="w-px bg-gray-100 h-10 hidden sm:block"></div>
            <div className="flex items-center gap-2 hidden sm:flex">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <FiCheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Accepted</p>
                <p className="text-lg font-bold text-gray-900">{counts.accepted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6">
          <div className="flex gap-3 overflow-x-auto">
            {[
              { key: 'all', label: 'All', icon: FiFileText },
              { key: 'pending', label: 'Pending', icon: FiClock },
              { key: 'accepted', label: 'Accepted', icon: FiCheckCircle },
              { key: 'rejected', label: 'Rejected', icon: FiAward }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${filter === key
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30 scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${filter === key ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <SkeletonLoader type="card" count={6} />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={FiBriefcase}
            title={filter === 'all' ? "No applications yet" : `No ${filter} applications`}
            description={filter === 'all'
              ? "You haven't applied to any jobs yet. Start browsing available jobs!"
              : `You don't have any ${filter} applications.`
            }
            actionLabel="Browse Jobs"
            onAction={() => window.location.href = '/worker/jobs'}
            secondaryActionLabel={filter !== 'all' ? "Show All" : undefined}
            onSecondaryAction={filter !== 'all' ? () => setFilter('all') : undefined}
          />
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <ApplicationCard key={application._id} application={application} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;