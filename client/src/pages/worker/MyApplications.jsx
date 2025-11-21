import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workerAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiDollarSign, FiClock, FiBriefcase, FiEye } from 'react-icons/fi';
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
      pending: 'badge-warning',
      accepted: 'badge-success',
      rejected: 'badge-danger',
      withdrawn: 'badge-danger',
    };
    return colors[status] || 'badge-info';
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-gray-600 mt-2">Track all your job applications</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'accepted', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'You haven\'t applied to any jobs yet' 
                : `No ${filter} applications`}
            </p>
            <Link to="/worker/jobs" className="btn-primary inline-block">
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application._id} className="card hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {/* Company Info */}
                    {application.job?.companyInfo && (
                      <div className="flex items-center gap-2 mb-3">
                        {application.job.companyInfo.logo ? (
                          <img 
                            src={application.job.companyInfo.logo} 
                            alt={application.job.companyInfo.companyName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <FiBriefcase className="h-4 w-4 text-primary-600" />
                          </div>
                        )}
                        <p className="text-sm font-semibold text-gray-900">
                          {application.job.companyInfo.companyName}
                        </p>
                      </div>
                    )}

                    {/* Job Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {application.job?.title || 'Job Title'}
                    </h3>
                    
                    {/* Job Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <FiDollarSign className="h-4 w-4" />
                        <span>Original: ${application.job?.salary}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiDollarSign className="h-4 w-4 text-primary-600" />
                        <span className="font-semibold text-primary-600">
                          Your Bid: ${application.proposedRate}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock className="h-4 w-4" />
                        <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Proposal Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Your Proposal:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{application.proposal}</p>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`badge ${getStatusColor(application.status)}`}>
                        Application: {application.status}
                      </span>
                      {application.job?.status && (
                        <span className={`badge ${getJobStatusColor(application.job.status)}`}>
                          Job: {application.job.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="ml-4">
                    <Link 
                      to={`/worker/jobs/${application.job?._id}`}
                      className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
                    >
                      <FiEye className="h-4 w-4" />
                      View Job
                    </Link>
                  </div>
                </div>

                {/* Additional Info for Accepted Applications */}
                {application.status === 'accepted' && application.job?.status === 'assigned' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-800 mb-2">
                      🎉 Congratulations! You've been assigned this job.
                    </p>
                    <Link 
                      to="/worker/jobs/assigned" 
                      className="text-sm text-green-700 hover:text-green-800 underline"
                    >
                      View in Assigned Jobs →
                    </Link>
                  </div>
                )}

                {/* Additional Info for Rejected Applications */}
                {application.status === 'rejected' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      This application was not selected. Keep applying to other opportunities!
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