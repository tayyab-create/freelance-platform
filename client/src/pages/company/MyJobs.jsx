import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiDollarSign, FiUsers, FiEye, FiPlus, FiBriefcase, FiCheckCircle, FiClock, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PageHeader, EmptyState, SkeletonLoader, StatusBadge } from '../../components/shared';
import { useNavigate } from 'react-router-dom';

const MyJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await companyAPI.getMyJobs();
      setJobs(response.data.data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      posted: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300',
      assigned: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300',
      'in-progress': 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300',
      submitted: 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border-indigo-300',
      completed: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300',
      cancelled: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300';
  };

  const filteredJobs = filter === 'all'
    ? jobs
    : jobs.filter(job => job.status === filter);

  // Count jobs by status
  const counts = {
    all: jobs.length,
    posted: jobs.filter(j => j.status === 'posted').length,
    assigned: jobs.filter(j => j.status === 'assigned').length,
    submitted: jobs.filter(j => j.status === 'submitted').length,
    completed: jobs.filter(j => j.status === 'completed').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <PageHeader
              title="My Jobs"
              subtitle="Manage your job postings"
              actions={
                <Link to="/company/post-job" className="btn-primary">
                  <FiPlus className="w-5 h-5" />
                  <span>Post New Job</span>
                </Link>
              }
            />
          </div>
        </div>

        {/* Filter Tabs - Premium */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6">
          <div className="flex gap-3 overflow-x-auto">
            {[
              { key: 'all', label: 'All', icon: FiBriefcase },
              { key: 'posted', label: 'Posted', icon: FiFileText },
              { key: 'assigned', label: 'Assigned', icon: FiClock },
              { key: 'submitted', label: 'Submitted', icon: FiCheckCircle },
              { key: 'completed', label: 'Completed', icon: FiCheckCircle }
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

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                  <FiBriefcase className="h-10 w-10 text-gray-400" />
                </div>
              </div>
              <EmptyState
                icon={FiBriefcase}
                title="No jobs posted yet"
                description="Start by posting your first job to find talented freelancers."
                actionLabel="Post a Job"
                onAction={() => navigate('/company/post-job')}
              />
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? "Start hiring talented workers by posting your first job!"
                  : `You don't have any ${filter} jobs at the moment.`}
              </p>
              {filter === 'all' && (
                <Link to="/company/post-job" className="btn-primary inline-block">
                  Post Your First Job
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-8 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                  <div className="flex-1 w-full">
                    {/* Job Title */}
                    <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-gray-700 line-clamp-2 mb-5 leading-relaxed text-lg">{job.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {job.tags?.slice(0, 5).map((tag, index) => (
                        <span
                          key={index}
                          className="px-4 py-1.5 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 text-blue-700 border border-blue-200/50 shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Job Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-200">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                          <FiDollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold uppercase">Budget</p>
                          <p className="text-xl font-black text-gray-900">${job.salary}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-200">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                          <FiUsers className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold uppercase">Applications</p>
                          <p className="text-xl font-black text-gray-900">{job.totalApplications || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="flex flex-col gap-3 items-stretch">
                    <span className={`px-5 py-2.5 text-sm font-bold rounded-xl border-2 shadow-sm ${getStatusColor(job.status)} uppercase text-center`}>
                      {job.status}
                    </span>
                    <Link
                      to={`/company/jobs/${job._id}`}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:shadow-lg transition-all group-hover:scale-105"
                    >
                      <FiEye className="h-5 w-5" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyJobs;