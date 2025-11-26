import React, { useEffect, useState } from 'react';
import { jobAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiBriefcase, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { SkeletonLoader, JobCard } from '../../components/shared';

const BrowseJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        experienceLevel: '',
    });
    const [showFilters, setShowFilters] = useState(false);

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

    const handleSearchChange = (e) => {
        setFilters({ ...filters, search: e.target.value });
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        setFilters({ search: '', category: '', experienceLevel: '' });
    };

    const hasActiveFilters = filters.search || filters.category || filters.experienceLevel;

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
                        <p className="text-lg text-gray-600">Discover your next opportunity</p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiSearch className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={handleSearchChange}
                                    placeholder="Search jobs by title, description, or skills..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-gray-700 placeholder:text-gray-400"
                                />
                            </div>

                            {/* Filter Toggle Button (Mobile) */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                            >
                                <FiFilter className="w-5 h-5" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                                )}
                            </button>

                            {/* Filters (Desktop) */}
                            <div className="hidden lg:flex items-center gap-3">
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-gray-700 font-medium bg-white"
                                >
                                    <option value="">All Categories</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="Mobile Development">Mobile Development</option>
                                    <option value="Design">Design</option>
                                    <option value="Writing">Writing</option>
                                </select>

                                <select
                                    value={filters.experienceLevel}
                                    onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-gray-700 font-medium bg-white"
                                >
                                    <option value="">All Levels</option>
                                    <option value="entry">Entry Level</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="expert">Expert</option>
                                </select>

                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                                    >
                                        <FiX className="w-4 h-4" />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Mobile Filters Dropdown */}
                        {showFilters && (
                            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 space-y-3">
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-gray-700 font-medium bg-white"
                                >
                                    <option value="">All Categories</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="Mobile Development">Mobile Development</option>
                                    <option value="Design">Design</option>
                                    <option value="Writing">Writing</option>
                                </select>

                                <select
                                    value={filters.experienceLevel}
                                    onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-gray-700 font-medium bg-white"
                                >
                                    <option value="">All Levels</option>
                                    <option value="entry">Entry Level</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="expert">Expert</option>
                                </select>

                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                                    >
                                        <FiX className="w-4 h-4" />
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Results Count */}
                    {!loading && (
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-600">
                                <span className="font-bold text-gray-900">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''} found
                            </p>
                        </div>
                    )}

                    {/* Jobs Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SkeletonLoader type="card" count={6} />
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                                <FiBriefcase className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                {hasActiveFilters
                                    ? "We couldn't find any jobs matching your criteria. Try adjusting your filters."
                                    : "There are no jobs available at the moment. Check back later for new opportunities."}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
                                >
                                    <FiX className="w-4 h-4" />
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <JobCard key={job._id} job={job} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BrowseJobs;
