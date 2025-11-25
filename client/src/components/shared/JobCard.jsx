import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiDollarSign, FiClock, FiMapPin } from 'react-icons/fi';
import StatusBadge from './StatusBadge';

const JobCard = ({ job, linkTo }) => {
    return (
        <Link
            to={linkTo || `/worker/jobs/${job._id}`}
            className="block bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group flex flex-col h-full"
        >
            {/* Card Header: Company Info + Status */}
            <div className="flex justify-between items-start mb-4">
                {/* Company Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                    {job.companyInfo ? (
                        <>
                            {job.companyInfo.logo ? (
                                <img
                                    src={job.companyInfo.logo}
                                    alt={job.companyInfo.companyName}
                                    className="h-12 w-12 rounded-xl object-cover shadow-md border-2 border-white flex-shrink-0"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md border-2 border-white flex-shrink-0">
                                    <FiBriefcase className="h-6 w-6 text-white" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-bold text-gray-900 text-base truncate">
                                    {job.companyInfo.companyName}
                                </p>
                                {job.companyInfo.tagline && (
                                    <p className="text-xs text-gray-500 truncate">{job.companyInfo.tagline}</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                <FiBriefcase className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="font-bold text-gray-500">Unknown Company</p>
                        </div>
                    )}
                </div>

                {/* Status & Date */}
                <div className="flex flex-col items-end flex-shrink-0">
                    <StatusBadge status={job.status} size="sm" />
                    <div className="text-xs text-gray-500 mt-1">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* Job Title */}
            <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                {job.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-5 line-clamp-2 leading-relaxed text-sm flex-grow">
                {job.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
                {job.tags?.slice(0, 3).map((tag, index) => (
                    <span
                        key={index}
                        className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 border border-blue-100"
                    >
                        {tag}
                    </span>
                ))}
                {job.tags?.length > 3 && (
                    <span className="px-3 py-1 text-xs font-bold rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
                        +{job.tags.length - 3}
                    </span>
                )}
            </div>

            {/* Job Metadata */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                        <FiDollarSign className="h-3.5 w-3.5 text-green-700" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Budget</p>
                        <p className="text-sm font-bold text-gray-900">${job.salary}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                        <FiClock className="h-3.5 w-3.5 text-blue-700" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Duration</p>
                        <p className="text-sm font-bold text-gray-900">{job.duration}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                        <FiMapPin className="h-3.5 w-3.5 text-purple-700" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Level</p>
                        <p className="text-sm font-bold text-gray-900 capitalize">{job.experienceLevel}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default JobCard;
