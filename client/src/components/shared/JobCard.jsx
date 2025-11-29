import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiDollarSign, FiClock, FiAward, FiCalendar, FiArrowRight } from 'react-icons/fi';
import StatusBadge from './StatusBadge';
import Avatar from './Avatar';

const JobCard = ({ job, linkTo }) => {
    return (
        <Link
            to={linkTo || `/worker/jobs/${job._id}`}
            className="group flex flex-col h-full bg-white rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                    {/* Company Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar
                            src={job.companyInfo?.logo}
                            name={job.companyInfo?.companyName || 'Unknown Company'}
                            type="company"
                            size="lg"
                            className="!rounded-xl flex-shrink-0"
                            shape="rounded-xl"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                                {job.companyInfo?.companyName || 'Unknown Company'}
                            </p>
                            {job.companyInfo && (
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                    <FiCalendar className="w-3 h-3" />
                                    {new Date(job.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Status Badge */}
                    <StatusBadge status={job.status} size="sm" />
                </div>

                {/* Job Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {job.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-2">
                    {job.description}
                </p>
            </div>

            {/* Card Body */}
            <div className="p-6 flex flex-col flex-1">
                {/* Tags */}
                {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                        {job.tags.slice(0, 3).map((tag, index) => (
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 border border-gray-200 truncate max-w-[150px]">
                                {tag}
                            </span>
                        ))}
                        {job.tags.length > 3 && (
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg bg-gray-50 text-gray-500">
                                +{job.tags.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Job Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                        <div className="flex items-center gap-2 text-green-700 mb-1">
                            <FiDollarSign className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wide">Budget</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">${job.salary}</p>
                        <p className="text-xs text-gray-600 mt-0.5 truncate max-w-[120px]" title={job.salaryType}>{job.salaryType}</p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-700 mb-1">
                            <FiClock className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wide">Deadline</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                            {job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }) : 'No Deadline'}
                        </p>
                        {job.deadline && (
                            <p className="text-xs text-gray-600 mt-0.5">
                                {new Date(job.deadline).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: true
                                })}
                            </p>
                        )}
                    </div>
                </div>

                {/* Experience Level */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <FiAward className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Level</p>
                            <p className="text-sm font-semibold text-gray-900 capitalize truncate max-w-[100px]">{job.experienceLevel}</p>
                        </div>
                    </div>

                    {/* View Details Arrow */}
                    <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm group-hover:gap-3 transition-all">
                        View Details
                        <FiArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default JobCard;
