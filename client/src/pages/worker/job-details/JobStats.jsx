import React from 'react';
import { FiDollarSign, FiClock, FiAward, FiCalendar } from 'react-icons/fi';

const JobStats = ({ job }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-8">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                    <FiDollarSign className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Budget</span>
                </div>
                <p className="text-xl font-bold text-gray-900">${job.salary}</p>
                <p className="text-xs text-gray-600 mt-0.5">{job.salaryType}</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                    <FiClock className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Duration</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
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
                </p>
                <p className="text-xs text-gray-600 mt-0.5">Project Timeline</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                    <FiAward className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Level</span>
                </div>
                <p className="text-xl font-bold text-gray-900 capitalize">{job.experienceLevel}</p>
                <p className="text-xs text-gray-600 mt-0.5">Experience Required</p>
            </div>

            {job.deadline && (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center gap-2 text-orange-700 mb-1">
                        <FiCalendar className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Deadline</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                        {new Date(job.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            )}
        </div>
    );
};

export default JobStats;
