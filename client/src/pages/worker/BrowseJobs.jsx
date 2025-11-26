import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiBriefcase, FiBookmark } from 'react-icons/fi';
import toast from '../../utils/toast';
import { SkeletonLoader, JobCard, PageHeader } from '../../components/shared';
import EnhancedFilterBar from '../../components/shared/EnhancedFilterBar';
import SaveSearchButton from '../../components/shared/SaveSearchButton';
import { NoJobsFound } from '../../components/shared/EmptyState';

const BrowseJobs = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        experienceLevel: '',
        salaryMin: '',
        salaryMax: '',
        location: '',
        remoteOnly: false,
        sortBy: 'newest'
    });
    const [initialLoad, setInitialLoad] = useState(true);

    // Load filters from URL query params on mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlFilters = {
            search: params.get('search') || '',
            category: params.get('category') || '',
            experienceLevel: params.get('experienceLevel') || '',
            salaryMin: params.get('salaryMin') || '',
            salaryMax: params.get('salaryMax') || '',
            location: params.get('location') || '',
            remoteOnly: params.get('remoteOnly') === 'true',
            sortBy: params.get('sortBy') || 'newest'
        };
        setFilters(urlFilters);
        setInitialLoad(false);
    }, [location.search]);

    // Fetch jobs when filters change (after initial load)
    useEffect(() => {
        if (!initialLoad) {
            fetchJobs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Use useCallback to prevent re-creating the function on every render
    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    const handleSearchChange = useCallback((searchQuery) => {
        setFilters(prev => ({ ...prev, search: searchQuery }));
    }, []);

    const clearFilters = () => {
        const clearedFilters = {
            search: '',
            category: '',
            experienceLevel: '',
            salaryMin: '',
            salaryMax: '',
            location: '',
            remoteOnly: false,
            sortBy: 'newest'
        };
        setFilters(clearedFilters);
        navigate('/worker/browse-jobs'); // Clear URL params
    };

    const hasActiveFilters = Object.values(filters).some(value => {
        if (typeof value === 'boolean') return value;
        return value && value !== 'newest'; // 'newest' is the default sort
    });

    const handleSavedSearchCreated = () => {
        toast.success('You can access this search from your Saved Searches page');
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
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/worker/saved-searches')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all shadow-sm"
                            >
                                <FiBookmark className="w-4 h-4" />
                                <span className="hidden sm:inline">Saved Searches</span>
                            </button>
                            <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-3 rounded-2xl shadow-lg">
                                <p className="text-white font-bold text-lg">{jobs.length} Available</p>
                            </div>
                        </div>
                    }
                />

                {/* Enhanced Filter Bar */}
                <EnhancedFilterBar
                    onSearch={handleSearchChange}
                    onFilterChange={handleFilterChange}
                    searchPlaceholder="Search jobs by title, company, or keywords..."
                    showSalaryFilter={true}
                    showLocationFilter={true}
                    showRemoteFilter={true}
                    showSortOptions={true}
                    initialFilters={filters}
                />

                {/* Save Search Button */}
                {hasActiveFilters && (
                    <div className="flex justify-end">
                        <SaveSearchButton
                            filters={filters}
                            onSaved={handleSavedSearchCreated}
                        />
                    </div>
                )}

                {/* Results Count */}
                {!loading && (
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600">
                            <span className="font-bold text-gray-900">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''} found
                            {hasActiveFilters && ' matching your filters'}
                        </p>
                    </div>
                )}

                {/* Jobs Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SkeletonLoader type="card" count={6} />
                    </div>
                ) : jobs.length === 0 ? (
                    <NoJobsFound
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={clearFilters}
                    />
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
