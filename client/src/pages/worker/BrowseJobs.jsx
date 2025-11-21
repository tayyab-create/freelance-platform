import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiDollarSign, FiClock, FiMapPin, FiBriefcase } from 'react-icons/fi';
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
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Browse Jobs</h1>

                {/* Filters */}
                <div className="card">
                    <div className="grid md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search jobs..."
                            className="input-field"
                        />
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
                    <div className="card text-center py-12">
                        <p className="text-gray-600">No jobs found matching your criteria</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <Link
                                key={job._id}
                                to={`/worker/jobs/${job._id}`}
                                className="card hover:shadow-lg transition block"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        {/* Company Info */}
                                        {job.companyInfo && (
                                            <div className="flex items-center gap-2 mb-3">
                                                {job.companyInfo.logo ? (
                                                    <img
                                                        src={job.companyInfo.logo}
                                                        alt={job.companyInfo.companyName}
                                                        className="h-8 w-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <FiBriefcase className="h-4 w-4 text-primary-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {job.companyInfo.companyName}
                                                    </p>
                                                    {job.companyInfo.tagline && (
                                                        <p className="text-xs text-gray-500">{job.companyInfo.tagline}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                                        <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {job.tags?.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="badge badge-info">
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
                                                <FiClock className="h-4 w-4" />
                                                <span>{job.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FiMapPin className="h-4 w-4" />
                                                <span className="capitalize">{job.experienceLevel}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-4">
                                        <span className="badge badge-success">{job.status}</span>
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

export default BrowseJobs;