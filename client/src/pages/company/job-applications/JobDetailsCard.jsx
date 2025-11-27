import React, { useState } from 'react';
import {
    FiCalendar,
    FiDollarSign,
    FiClock,
    FiBriefcase,
    FiUser,
    FiPaperclip,
    FiDownload,
    FiChevronDown,
    FiChevronUp
} from 'react-icons/fi';
import { StatusBadge } from '../../../components/shared';

const JobDetailsCard = ({ job, applicationCount }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!job) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                        <StatusBadge status={job.status} />
                    </div>
                    <div className="prose prose-gray max-w-none">
                        <div className={`text-gray-600 leading-relaxed whitespace-pre-line transition-all duration-300 ${!isExpanded && job.description.length > 500 ? 'max-h-32 overflow-hidden relative' : ''}`}>
                            <p>
                                {isExpanded || job.description.length <= 500
                                    ? job.description
                                    : `${job.description.slice(0, 500)}...`}
                            </p>
                            {!isExpanded && job.description.length > 500 && (
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                            )}
                        </div>
                        {job.description.length > 500 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-2 inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors group"
                            >
                                <span>{isExpanded ? 'See Less' : 'See More'}</span>
                                {isExpanded ? (
                                    <FiChevronUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                                ) : (
                                    <FiChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                    <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Posted</div>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        {new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-8 border-t border-gray-100">
                <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                        <FiDollarSign className="w-4 h-4" />
                        Budget
                    </div>
                    <div className="text-lg font-bold text-gray-900">${job.salary}</div>
                    <div className="text-xs text-gray-500">{job.salaryType}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                        <FiClock className="w-4 h-4" />
                        Duration
                    </div>
                    <div className="text-lg font-bold text-gray-900">
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
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                        <FiBriefcase className="w-4 h-4" />
                        Experience
                    </div>
                    <div className="text-lg font-bold text-gray-900 capitalize">{job.experienceLevel}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                        <FiCalendar className="w-4 h-4" />
                        Deadline
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                        {job.deadline ? (
                            <div className="flex flex-col">
                                <span>{new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span className="text-xs text-gray-500 font-normal">
                                    {new Date(job.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ) : 'No Deadline'}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                        <FiUser className="w-4 h-4" />
                        Applications
                    </div>
                    <div className="text-lg font-bold text-gray-900">{applicationCount}</div>
                </div>
            </div>

            {/* Attachments */}
            {job.attachments && job.attachments.length > 0 && (
                <div className="pt-8 mt-8 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-700 text-sm font-bold uppercase tracking-wider mb-4">
                        <FiPaperclip className="w-4 h-4" />
                        Job Attachments
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {job.attachments.map((file, index) => (
                            <a
                                key={index}
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all group"
                            >
                                <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                    <FiDownload className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                        {file.fileName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Download'}
                                    </p>
                                </div>
                                <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDetailsCard;
