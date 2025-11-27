import React from 'react';
import { FiTrendingUp, FiCheckCircle, FiBriefcase, FiClock, FiUser } from 'react-icons/fi';
import { StatusBadge } from '../../../components/shared';

const JobInsights = ({ job }) => {
    return (
        <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl border border-blue-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FiTrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Job Insights</h3>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <FiCheckCircle className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Status</span>
                    </div>
                    <StatusBadge status={job.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-blue-50 shadow-sm">
                        <div className="text-xs text-gray-500 font-medium mb-1">Job Type</div>
                        <div className="font-bold text-gray-900 capitalize flex items-center gap-1.5">
                            <FiBriefcase className="w-3.5 h-3.5 text-gray-400" />
                            {job.salaryType}
                        </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-blue-50 shadow-sm">
                        <div className="text-xs text-gray-500 font-medium mb-1">Posted</div>
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <FiClock className="w-3.5 h-3.5 text-gray-400" />
                            {(() => {
                                const days = Math.floor((new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));
                                if (days === 0) return 'Today';
                                if (days === 1) return 'Yesterday';
                                return `${days} days ago`;
                            })()}
                        </div>
                    </div>
                </div>

                {job.applicantCount !== undefined && (
                    <div className="p-3 bg-white rounded-xl border border-blue-50 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Competition</span>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                {job.applicantCount > 10 ? 'High' : 'Low'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[...Array(Math.min(3, job.applicantCount || 0))].map((_, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                                        <FiUser className="w-4 h-4" />
                                    </div>
                                ))}
                                {(job.applicantCount || 0) > 3 && (
                                    <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600">
                                        +{job.applicantCount - 3}
                                    </div>
                                )}
                            </div>
                            <div className="text-sm">
                                <span className="font-bold text-gray-900">{job.applicantCount}</span>
                                <span className="text-gray-500 ml-1">Applicants</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobInsights;
