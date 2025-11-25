import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiDollarSign, FiClock, FiMapPin, FiBriefcase, FiSearch, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';

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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Browse Jobs</h1>
                        <p className="text-gray-600 text-lg">Discover your next opportunity</p>
                    </div>
                    <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-3 rounded-2xl shadow-lg">
                        <p className="text-white font-bold text-lg">{jobs.length} Jobs Available</p>
                    </div>
                </div>

                {/* Filters - Premium Card */}
                <div className="bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg">
                            <FiFilter className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900">Filter Jobs</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search jobs..."
                                className="input-field pl-12"
                            />
                        </div>
                        <select
                            name="category"
                            value={filters.category}
                            onChange={handleFilterChange}
                            className="input-field"
                        >
                            <option value="">All Categories</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Mobile Development">Mobile Development</option>
                            <option value="Design">Design</option>
                            <option value="Writing">Writing</option>
                        </select>
                        <select
                            name="experienceLevel"
                            value={filters.experienceLevel}
                            onChange={handleFilterChange}
                            className="input-field"
                        >
                            <option value="">All Levels</option>
                            <option value="entry">Entry Level</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                </div>

                {/* Jobs List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                                    <FiBriefcase className="h-10 w-10 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
                            <p className="text-gray-600">No jobs found matching your criteria. Try adjusting your filters.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
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
                                        <span className="badge badge-success text-sm px-4 py-2 shadow-md capitalize">
                                            {job.status}
                                        </span>
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