import React, { useEffect, useState } from 'react';
import { jobAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiBriefcase, FiSearch, FiFilter, FiX, FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { SkeletonLoader, JobCard, PageHeader, Select } from '../../components/shared';

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
                            <p className="text-white font-bold text-lg">{jobs.length} Available</p>
                        </div>
                    }
                />

                {/* Search & Filter Bar */}
                <div className="flex flex-col gap-4">
                    {/* Search Input */}
                    <div className="relative w-full lg:w-96">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={handleSearchChange}
                            placeholder="Search jobs by title or company..."
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all shadow-sm"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-1.5 overflow-x-auto w-full lg:w-auto">
                            <div className="flex gap-1 min-w-max">
                                <button
                                    onClick={() => handleFilterChange('category', '')}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${!filters.category
                                        ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                                        : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                >
                                    All Categories
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${!filters.category ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {jobs.length}
                                    </span>
                                </button>
                                {['Web Development', 'Mobile Development', 'Design', 'Writing'].map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleFilterChange('category', category)}
                                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap ${filters.category === category
                                            ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                                            : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Experience Level Filter */}
                        <div className="flex items-center gap-3">
                            <Select
                                value={filters.experienceLevel}
                                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                                icon={FiAward}
                                options={[
                                    { value: '', label: 'All Levels' },
                                    { value: 'entry', label: 'Entry Level' },
                                    { value: 'intermediate', label: 'Intermediate' },
                                    { value: 'expert', label: 'Expert' }
                                ]}
                            />

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                                >
                                    <FiX className="w-4 h-4" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                {!loading && (
                    <div className="flex items-center justify-between">
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
        </DashboardLayout>
    );
};

export default BrowseJobs;
