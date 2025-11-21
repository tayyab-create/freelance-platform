import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiDollarSign, FiUsers, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MyJobs = () => {
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
      posted: 'badge-info',
      assigned: 'badge-warning',
      'in-progress': 'badge-warning',
      submitted: 'badge-pending',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    };
    return colors[status] || 'badge-info';
  };

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Posted Jobs</h1>
          <Link to="/company/post-job" className="btn-primary">
            Post New Job
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'posted', 'assigned', 'submitted', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No jobs found</p>
            <Link to="/company/post-job" className="btn-primary mt-4 inline-block">
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div key={job._id} className="card hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags?.slice(0, 4).map((tag, index) => (
                        <span key={index} className="badge badge-info text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiDollarSign className="h-4 w-4" />
                        <span>${job.salary}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiUsers className="h-4 w-4" />
                        <span>{job.totalApplications} Applications</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col items-end gap-2">
                    <span className={`badge ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                    <Link 
                      to={`/company/jobs/${job._id}`}
                      className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
                    >
                      <FiEye className="h-4 w-4" />
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