import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workerAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiDollarSign, FiClock, FiBriefcase, FiEye, FiCheckCircle, FiFileText, FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await workerAPI.getMyApplications();
      setApplications(response.data.data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300',
      accepted: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300',
      rejected: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300',
      withdrawn: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300',
    };
    return colors[status] || 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300';
  };

  const getJobStatusColor = (status) => {
    const colors = {
      posted: 'badge-info',
      assigned: 'badge-warning',
      'in-progress': 'badge-warning',
      submitted: 'badge-pending',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    };
    return colors[status] || 'badge-info';
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-2 text-lg">Track all your job applications</p>
          </div>
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-3 rounded-2xl shadow-lg">
            <p className="text-white font-bold text-lg">{applications.length} Total Applications</p>
          </div>
        </div>

        {/* Filter Tabs - Premium */}
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
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                  <FiFileText className="h-10 w-10 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {filter === 'all' ? 'No Applications Yet' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Applications`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? "You haven't applied to any jobs yet. Start browsing available opportunities!"
                  : `You don't have any ${filter} applications at the moment.`}
              </p>
              {filter === 'all' && (
                <Link to="/worker/jobs" className="btn-primary inline-block">
                  Browse Available Jobs
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <div
                key={application._id}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-8 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                  <div className="flex-1 w-full">
                    {/* Company Info */}
                    {application.job?.companyInfo && (
                      <div className="flex items-center gap-3 mb-4">
                        {application.job.companyInfo.logo ? (
                          <img
                            src={application.job.companyInfo.logo}
                            alt={application.job.companyInfo.companyName}
                            className="h-14 w-14 rounded-xl object-cover shadow-md border-2 border-white group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform duration-300">
                            <FiBriefcase className="h-7 w-7 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {application.job.companyInfo.companyName}
                          </p>
                          {application.job.companyInfo.tagline && (
                            <p className="text-sm text-gray-600">{application.job.companyInfo.tagline}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Job Title */}
                    <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                      {application.job?.title || 'Job Title'}
                    </h3>

                    {/* Job Info - Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl border border-gray-200">
                        <FiDollarSign className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Original</p>
                          <p className="font-bold text-gray-900">${application.job?.salary}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-100 to-purple-100 rounded-xl border-2 border-primary-200">
                        <FiDollarSign className="h-5 w-5 text-primary-700" />
                        <div>
                          <p className="text-xs text-primary-600 font-semibold">Your Bid</p>
                          <p className="font-black text-primary-700">${application.proposedRate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border border-blue-200">
                        <FiClock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Applied</p>
                          <p className="font-bold text-gray-900 text-sm">{new Date(application.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Proposal Preview */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-5 mb-5 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FiFileText className="h-5 w-5 text-purple-600" />
                        <p className="font-bold text-gray-900">Your Proposal:</p>
                      </div>
                      <p className="text-gray-700 leading-relaxed line-clamp-2">{application.proposal}</p>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-3">
                      <span className={`px-5 py-2 text-sm font-bold rounded-xl border-2 shadow-sm ${getStatusColor(application.status)}`}>
                        Application: {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                      {application.job?.status && (
                        <span className={`badge ${getJobStatusColor(application.job.status)} text-sm px-4 py-2`}>
                          Job: {application.job.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col gap-3">
                    <Link
                      to={`/worker/jobs/${application.job?._id}`}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:shadow-lg transition-all group-hover:scale-105"
                    >
                      <FiEye className="h-5 w-5" />
                      View Job
                    </Link>
                  </div>
                </div>

                {/* Additional Info for Accepted Applications */}
                {application.status === 'accepted' && application.job?.status === 'assigned' && (
                  <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <FiCheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-green-800 mb-2 text-lg">
                          🎉 Congratulations! You've been assigned this job.
                        </p>
                        <Link
                          to="/worker/jobs/assigned"
                          className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold"
                        >
                          View in Assigned Jobs
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Info for Rejected Applications */}
                {application.status === 'rejected' && (
                  <div className="mt-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl">
                    <p className="text-red-800 font-semibold">
                      This application was not selected. Keep applying to other opportunities – your next success is just around the corner!
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;