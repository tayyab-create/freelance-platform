import React from 'react';
import { FiBriefcase, FiCalendar, FiDollarSign, FiAlertCircle, FiMessageCircle, FiPlay, FiUpload, FiCheckCircle } from 'react-icons/fi';
import { StatusBadge } from '../../shared';

const JobCard = ({
    job,
    handleViewDetails,
    handleStartConversation,
    handleStartJob,
    handleOpenSubmitModal,
    isDeadlineApproaching
}) => {
    return (
        <div
            onClick={() => handleViewDetails(job)}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden cursor-pointer"
        >
            {/* Deadline Indicator Strip - Only show for active jobs */}
            {isDeadlineApproaching(job.deadline) && (job.status === 'assigned' || job.status === 'in-progress') && (
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Company Logo */}
                <div className="flex-shrink-0">
                    {job.companyInfo?.logo ? (
                        <img
                            src={job.companyInfo.logo}
                            alt={job.companyInfo.companyName}
                            className="h-14 w-14 rounded-xl object-cover border border-gray-100"
                        />
                    ) : (
                        <div className="h-14 w-14 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                            <FiBriefcase className="h-6 w-6" />
                        </div>
                    )}
                </div>

                {/* Middle: Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                            {job.title}
                        </h3>
                        <StatusBadge status={job.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-4">
                        <span className="font-medium text-gray-900">{job.companyInfo?.companyName || 'Confidential Client'}</span>
                        <span className="text-gray-300 hidden md:inline">•</span>
                        <div className="flex items-center gap-1.5">
                            <FiCalendar className="h-4 w-4" />
                            <span>Assigned {new Date(job.assignedDate).toLocaleDateString()}</span>
                        </div>
                        <span className="text-gray-300 hidden md:inline">•</span>
                        <div className="flex items-center gap-1.5">
                            <FiDollarSign className="h-4 w-4" />
                            <span className="font-medium text-gray-900">${job.salary}</span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md uppercase">{job.salaryType}</span>
                        </div>
                    </div>

                    {/* Deadline Warning Inline - Only show for active jobs */}
                    {isDeadlineApproaching(job.deadline) && (job.status === 'assigned' || job.status === 'in-progress') && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium mb-4">
                            <FiAlertCircle className="h-4 w-4" />
                            Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </div>
                    )}

                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                        {job.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={(e) => handleStartConversation(job, e)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <FiMessageCircle className="h-4 w-4" />
                            Message Company
                        </button>

                        {job.status === 'assigned' && (
                            <button
                                onClick={(e) => handleStartJob(job, e)}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 shadow-md shadow-purple-500/20 transition-all"
                            >
                                <FiPlay className="h-4 w-4" />
                                Start Working
                            </button>
                        )}

                        {(job.status === 'in-progress' || job.status === 'revision-requested') && (
                            <button
                                onClick={(e) => handleOpenSubmitModal(job, e)}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all"
                            >
                                <FiUpload className="h-4 w-4" />
                                {job.status === 'revision-requested' ? 'Submit Revision' : 'Submit Work'}
                            </button>
                        )}

                        {job.status === 'submitted' && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-sm font-bold">
                                <FiCheckCircle className="h-4 w-4" />
                                Submitted - Under Review
                            </div>
                        )}

                        {job.status === 'completed' && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 border border-green-200 text-green-800 text-sm font-bold">
                                <FiCheckCircle className="h-4 w-4" />
                                Completed
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCard;
