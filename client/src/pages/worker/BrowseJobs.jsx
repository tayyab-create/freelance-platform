import React, { useEffect, useState } from 'react';
import { jobAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiBriefcase } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PageHeader, FilterBar, EmptyState, SkeletonLoader, JobCard } from '../../components/shared';

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

                {/* Filters */}
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
                            <JobCard key={job._id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BrowseJobs;