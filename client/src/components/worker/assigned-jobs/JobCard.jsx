import React from 'react';
import { FiBriefcase, FiCalendar, FiDollarSign, FiAlertCircle, FiMessageCircle, FiPlay, FiUpload, FiCheckCircle, FiClock, FiStar, FiArrowRight, FiInfo } from 'react-icons/fi';
import { StatusBadge } from '../../shared';

const JobCard = ({
    job,
    handleViewDetails,
    handleStartConversation,
    handleStartJob,
    handleOpenSubmitModal,
    isDeadlineApproaching
}) => {
    const hasUrgentDeadline = isDeadlineApproaching(job.deadline) &&
        (job.status === 'assigned' || job.status === 'in-progress');

    // Render star rating
    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    const renderDynamicStatusBox = () => {
        switch (job.status) {
            case 'completed':
                return (
                    <div className="bg-blue-50 rounded-xl p-2.5 border border-blue-100">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 text-blue-700">
                                <FiCheckCircle className="w-4 h-4" />
                                <span className="text-xs font-semibold">Completed</span>
                            </div>
                            {job.clientRating && (
                                <div className="flex items-center gap-1 bg-white/80 px-1.5 py-0.5 rounded-md shadow-sm" title="Client Rating">
                                    <FiStar className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-bold text-blue-900">{job.clientRating}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                            {job.completedDate
                                ? new Date(job.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                : 'Recently'
                            }
                        </p>
                        <p className="text-xs text-gray-600">
                            {job.assignedDate && job.completedDate
                                ? `${Math.ceil((new Date(job.completedDate) - new Date(job.assignedDate)) / (1000 * 60 * 60 * 24))} day project`
                                : 'Finished'
                            }
                        </p>
                    </div>
                );
            case 'submitted':
                return (
                    <div className="bg-teal-50 rounded-xl p-2.5 border border-teal-100">
                        <div className="flex items-center gap-2 text-teal-700 mb-1">
                            <FiClock className="w-4 h-4" />
                            <span className="text-xs font-semibold">Submitted</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                            Under Review
                        </p>
                        <p className="text-xs text-gray-600">
                            Pending approval
                        </p>
                    </div>
                );
            case 'revision-requested':
                return (
                    <div className="bg-orange-50 rounded-xl p-2.5 border border-orange-100">
                        <div className="flex items-center gap-2 text-orange-700 mb-1">
                            <FiAlertCircle className="w-4 h-4" />
                            <span className="text-xs font-semibold">Revision</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                            Action Needed
                        </p>
                        <p className="text-xs text-gray-600">
                            Check feedback
                        </p>
                    </div>
                );
            default: // assigned, in-progress
                return (
                    <div className={`rounded-xl p-2.5 border ${hasUrgentDeadline
                        ? 'bg-red-50 border-red-100'
                        : 'bg-gray-50 border-gray-100'
                        }`}>
                        <div className={`flex items-center gap-2 mb-1 ${hasUrgentDeadline ? 'text-red-700' : 'text-gray-700'}`}>
                            <FiClock className="w-4 h-4" />
                            <span className="text-xs font-semibold">Deadline</span>
                        </div>
                        <p className={`text-sm font-bold ${hasUrgentDeadline ? 'text-red-700' : 'text-gray-900'}`}>
                            {job.deadline
                                ? new Date(job.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                : 'No deadline'
                            }
                        </p>
                        {job.deadline && (
                            <p className={`text-xs ${hasUrgentDeadline ? 'text-red-600' : 'text-gray-600'}`}>
                                {Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days left
                            </p>
                        )}
                    </div>
                );
        }
    };

    return (
        <div
            onClick={() => handleViewDetails(job)}
            className={`group flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${hasUrgentDeadline
                ? 'bg-red-50/30 border-red-200 hover:border-red-300 hover:shadow-lg hover:shadow-red-100'
                : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-xl'
                }`}
        >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                    {/* Company Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {job.companyInfo?.logo ? (
                            <img
                                src={job.companyInfo.logo}
                                alt={job.companyInfo.companyName}
                                className="h-12 w-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                                <FiBriefcase className="h-6 w-6 text-white" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                                {job.companyInfo?.companyName || 'Confidential Client'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <FiCalendar className="w-3 h-3" />
                                Assigned {new Date(job.assignedDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        <StatusBadge status={job.status} size="sm" />
                        {hasUrgentDeadline && (
                            <div className="group/tooltip relative">
                                <FiInfo className="w-4 h-4 text-red-500 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                                    Urgent: Due {new Date(job.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Job Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {job.title}
                </h3>

                {/* Company Rating - if exists */}
                {job.companyRating && job.companyRating > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                        {renderStars(job.companyRating)}
                        <span className="text-xs font-medium text-gray-600">
                            {job.companyRating.toFixed(1)} rating
                        </span>
                    </div>
                )}

                {/* Job Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {job.description}
                </p>
            </div>

            {/* Card Body */}
            <div className="p-4 flex flex-col flex-1">
                {/* Job Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-green-50 rounded-xl p-2.5 border border-green-100">
                        <div className="flex items-center gap-2 text-green-700 mb-1">
                            <FiDollarSign className="w-4 h-4" />
                            <span className="text-xs font-semibold">Payment</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">${job.salary}</p>
                        <p className="text-xs text-gray-600 capitalize">{job.salaryType}</p>
                    </div>

                    {renderDynamicStatusBox()}
                </div>

                {/* Action Buttons */}
                <div className="mt-auto space-y-2">
                    {/* Primary Action */}
                    {job.status === 'assigned' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleStartJob(job, e); }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors shadow-md"
                        >
                            <FiPlay className="w-4 h-4" />
                            Start Working
                        </button>
                    )}

                    {(job.status === 'in-progress' || job.status === 'revision-requested') && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleOpenSubmitModal(job, e); }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-md"
                        >
                            <FiUpload className="w-4 h-4" />
                            {job.status === 'revision-requested' ? 'Submit Revision' : 'Submit Work'}
                        </button>
                    )}

                    {job.status === 'submitted' && (
                        <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-100 border-2 border-teal-200 text-teal-700 font-semibold">
                            <FiCheckCircle className="w-4 h-4" />
                            Under Review
                        </div>
                    )}

                    {job.status === 'completed' && (
                        <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-100 border-2 border-green-200 text-green-700 font-semibold">
                            <FiCheckCircle className="w-4 h-4" />
                            Completed
                        </div>
                    )}

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleStartConversation(job, e); }}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm"
                        >
                            <FiMessageCircle className="w-4 h-4" />
                            Message
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleViewDetails(job); }}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm"
                        >
                            Details
                            <FiArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCard;
