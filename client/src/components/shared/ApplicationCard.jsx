import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiDollarSign, FiClock, FiEye, FiCheckCircle } from 'react-icons/fi';
import StatusBadge from './StatusBadge';

const ApplicationCard = ({ application, onViewJob }) => {
    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            accepted: 'bg-green-50 text-green-700 border-green-200',
            rejected: 'bg-red-50 text-red-700 border-red-200',
            withdrawn: 'bg-gray-50 text-gray-700 border-gray-200',
        };
        return colors[status] || 'bg-blue-50 text-blue-700 border-blue-200';
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Company Logo */}
                <div className="flex-shrink-0">
                    {application.job?.companyInfo?.logo ? (
                        <img
                            src={application.job.companyInfo.logo}
                            alt={application.job.companyInfo.companyName}
                            className="h-16 w-16 rounded-xl object-cover border border-gray-100"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                            <FiBriefcase className="h-8 w-8" />
                        </div>
                    )}
                </div>

                {/* Middle: Job Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500 font-medium">
                            Applied on {new Date(application.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
                        {application.job?.title || 'Job Title'}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 truncate">
                        {application.job?.companyInfo?.companyName || 'Unknown Company'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2 min-w-0">
                            <FiDollarSign className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">Bid: <span className="font-bold text-gray-900">${application.proposedRate}</span></span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                            <FiDollarSign className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">Budget: <span className="font-medium">${application.job?.salary}</span></span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col items-end justify-center gap-3 min-w-[160px]">
                    <button
                        onClick={() => onViewJob(application)}
                        className="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <FiEye className="h-4 w-4" />
                        View Job
                    </button>

                    {application.status === 'accepted' && application.job?.status && (
                        <div className="w-full">
                            <StatusBadge
                                status={application.job.status}
                                size="md"
                                className="!w-full !flex !justify-center"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Rejection Message (Subtle) */}
            {application.status === 'rejected' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 italic">
                        Application was not selected. Don't give up!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ApplicationCard;
