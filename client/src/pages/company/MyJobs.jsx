import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiPlus, FiBriefcase, FiUsers, FiDollarSign, FiClock, FiArrowRight, FiMoreHorizontal, FiTrendingUp, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { SkeletonLoader, StatusBadge, PageHeader } from '../../components/shared';

// Helper icon component since we are using it in stats
const FiCheckCircle = ({ className }) => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

const MyJobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredJobs = jobs
        .filter(job => filter === 'all' || job.status === filter)
        .filter(job => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                job.title?.toLowerCase().includes(query) ||
                job.description?.toLowerCase().includes(query)
            );
        });

    const counts = {
        all: jobs.length,
        posted: jobs.filter(j => j.status === 'posted').length,
        assigned: jobs.filter(j => j.status === 'assigned').length,
        completed: jobs.filter(j => j.status === 'completed').length,
    };

    const filterOptions = [
        {
            key: 'status', label: 'Status', type: 'select', options: [
                { value: 'posted', label: 'Open' },
                { value: 'assigned', label: 'In Progress' },
                { value: 'completed', label: 'Completed' }
            ]
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-8">
                {/* Header */}
                <PageHeader
                    title="My Jobs"
                    subtitle="Manage your job postings and applications"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/company/dashboard' },
                        { label: 'My Jobs' }
                    ]}
                    actions={
                        <Link
                            to="/company/post-job"
                            className="btn-primary inline-flex items-center gap-2 px-6 py-3 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transform hover:-translate-y-0.5 transition-all"
                        >
                            <FiPlus className="w-5 h-5" />
                            Post New Job
                        </Link>
                    }
                />

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                <FiBriefcase className="w-5 h-5" />
                            </div>
                            <span className="text-gray-500 text-sm font-medium">Total Jobs</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{counts.all}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <FiTrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-gray-500 text-sm font-medium">Open</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{counts.posted}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <FiUsers className="w-5 h-5" />
                            </div>
                            <span className="text-gray-500 text-sm font-medium">In Progress</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{counts.assigned}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <FiCheckCircle className="w-5 h-5" />
                            </div>
                            <span className="text-gray-500 text-sm font-medium">Completed</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{counts.completed}</div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search Input */}
                    <div className="relative w-full md:w-96">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search jobs by title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all shadow-sm"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-1.5 overflow-x-auto w-full md:w-auto">
                        <div className="flex gap-1 min-w-max">
                            {[
                                { key: 'all', label: 'All Jobs' },
                                { key: 'posted', label: 'Open' },
                                { key: 'assigned', label: 'In Progress' },
                                { key: 'completed', label: 'Completed' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${filter === tab.key
                                        ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                                        : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${filter === tab.key ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {counts[tab.key] || 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Jobs Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SkeletonLoader type="card" count={6} />
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 mb-6">
                            <FiBriefcase className="w-10 h-10 text-primary-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {searchQuery ? 'No matching jobs' : filter === 'all' ? 'No jobs yet' : `No ${filter} jobs`}
                        </h3>
                        <p className="text-gray-500 mb-8">
                            {searchQuery
                                ? 'Try adjusting your search'
                                : filter === 'all'
                                    ? 'Post your first job to get started'
                                    : 'No jobs in this category'}
                        </p>
                        {filter === 'all' && !searchQuery && (
                            <Link
                                to="/company/post-job"
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <FiPlus className="w-5 h-5" />
                                Post Your First Job
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map(job => (
                            <Link
                                key={job._id}
                                to={`/company/jobs/${job._id}`}
                                className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                            >
                                {/* Decorative Gradient Blob */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />

                                <div className="relative">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <StatusBadge status={job.status} size="sm" />
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                            <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                                        </div>
                                    </div>

                                    {/* Title & Desc */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors" title={job.title}>
                                            {job.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 h-10">
                                            {job.description}
                                        </p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-sm group-hover:border-gray-100 border border-transparent transition-all">
                                            <div className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wide">Applications</div>
                                            <div className="flex items-center gap-1.5">
                                                <FiUsers className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="text-sm font-bold text-gray-900">{job.totalApplications || 0}</span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-sm group-hover:border-gray-100 border border-transparent transition-all">
                                            <div className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wide">Budget</div>
                                            <div className="flex items-center gap-1.5">
                                                <FiDollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="text-sm font-bold text-gray-900">${job.salary}</span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-sm group-hover:border-gray-100 border border-transparent transition-all">
                                            <div className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wide">Duration</div>
                                            <div className="flex items-center gap-1.5">
                                                <FiClock className="w-3.5 h-3.5 text-orange-500" />
                                                <span className="text-sm font-bold text-gray-900 truncate" title={job.duration}>
                                                    {(() => {
                                                        if (!job.deadline) return job.duration || 'N/A';

                                                        const now = new Date();
                                                        const deadlineDate = new Date(job.deadline);
                                                        const diffTime = deadlineDate - now;

                                                        if (diffTime <= 0) return 'Expired';

                                                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                                        const months = Math.floor(diffDays / 30);
                                                        const days = diffDays % 30;

                                                        let durationStr = '';
                                                        if (months > 0) {
                                                            durationStr += `${months} month${months > 1 ? 's' : ''}`;
                                                        }
                                                        if (days > 0) {
                                                            if (durationStr) durationStr += ', ';
                                                            durationStr += `${days} day${days > 1 ? 's' : ''}`;
                                                        }
                                                        if (!durationStr) {
                                                            durationStr = 'Less than a day';
                                                        }

                                                        return durationStr;
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex gap-2 text-xs font-medium text-gray-400">
                                            <FiClock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                            {job.deadline ? (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-bold">Due {new Date(job.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                    <span className="text-[10px] text-gray-500">{new Date(job.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            ) : (
                                                <span>Posted {new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider group-hover:text-primary-500 transition-colors">
                                            {job.salaryType}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MyJobs;
