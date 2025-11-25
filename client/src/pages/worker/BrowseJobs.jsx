import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiDollarSign, FiClock, FiMapPin, FiBriefcase, FiSearch, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PageHeader, FilterBar, EmptyState, SkeletonLoader, StatusBadge } from '../../components/shared';

const BrowseJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        experienceLevel: '',
    });

    useEffect(() => {
        fetchJobs();
    }, [filters]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await jobAPI.getAllJobs(filters);
            setJobs(response.data.data);
        } catch (error) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-8">
                {/* Header */}
                <PageHeader
                    title="Browse Jobs"
                    subtitle="Discover your next opportunity"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/worker/dashboard' },
                        { label: 'Browse Jobs' }
                    ]}
                    actions={
                        <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-3 rounded-2xl shadow-lg">
                            <p className="text-white font-bold text-lg">{jobs.length} Jobs Available</p>
                        </div>
                    }
                />

                {/* Filters - Premium Card */}
                <FilterBar
                    onSearch={(query) => setFilters({ ...filters, search: query })}
                    onFilterChange={(newFilters) => {
                        setFilters({ ...filters, ...newFilters });
                    }}
                    filters={[
                        {
                            key: 'category',
                            label: 'Category',
                            type: 'select',
                            options: [
                                { label: 'Web Development', value: 'Web Development' },
                                { label: 'Mobile Development', value: 'Mobile Development' },
                                { label: 'Design', value: 'Design' },
                                { label: 'Writing', value: 'Writing' }
                            ]
                        },
                        {
                            key: 'experienceLevel',
                            label: 'Experience Level',
                            type: 'select',
                            options: [
                                { label: 'Entry Level', value: 'entry' },
                                { label: 'Intermediate', value: 'intermediate' },
                                { label: 'Expert', value: 'expert' }
                            ]
                        }
                    ]}
                    searchPlaceholder="Search jobs by title or description..."
                />

                {/* Jobs List */}
                {loading ? (
                    <SkeletonLoader type="card" count={6} />
                ) : jobs.length === 0 ? (
                    <EmptyState
                        icon={FiBriefcase}
                        title="No jobs available"
                        description="There are no jobs matching your criteria. Try adjusting your filters or check back later."
                        actionLabel="Clear Filters"
                        onAction={() => setFilters({ search: '', category: '', experienceLevel: '' })}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <Link
                                key={job._id}
                                to={`/worker/jobs/${job._id}`}
                                className="block bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                            >
                                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                                    <div className="flex-1 w-full">
                                        {/* Company Info */}
                                        {job.companyInfo && (
                                            <div className="flex items-center gap-3 mb-4">
                                                {job.companyInfo.logo ? (
                                                    <img
                                                        src={job.companyInfo.logo}
                                                        alt={job.companyInfo.companyName}
                                                        className="h-12 w-12 rounded-xl object-cover shadow-md border-2 border-white group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform duration-300">
                                                        <FiBriefcase className="h-6 w-6 text-white" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900 text-base">
                                                        {job.companyInfo.companyName}
                                                    </p>
                                                    {job.companyInfo.tagline && (
                                                        <p className="text-sm text-gray-600">{job.companyInfo.tagline}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                                            {job.title}
                                        </h3>
                                        <p className="text-gray-700 mb-5 line-clamp-2 leading-relaxed">
                                            {job.description}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-5">
                                            {job.tags?.slice(0, 4).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-1.5 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 text-blue-700 border border-blue-200/50 shadow-sm hover:shadow-md transition-all"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Job Metadata */}
                                        <div className="flex flex-wrap gap-6 text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                                                    <FiDollarSign className="h-4 w-4 text-green-700" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-semibold uppercase">Budget</p>
                                                    <p className="font-bold text-gray-900">${job.salary}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                                                    <FiClock className="h-4 w-4 text-blue-700" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-semibold uppercase">Duration</p>
                                                    <p className="font-bold text-gray-900">{job.duration}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                                                    <FiMapPin className="h-4 w-4 text-purple-700" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-semibold uppercase">Level</p>
                                                    <p className="font-bold text-gray-900 capitalize">{job.experienceLevel}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex flex-col items-end gap-3">
                                        <StatusBadge status={job.status} size="sm" />
                                        <div className="text-sm text-gray-500">
                                            Posted {new Date(job.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Arrow */}
                                <div className="mt-4 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-primary-600 font-bold flex items-center gap-2">
                                        View Details
                                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BrowseJobs;