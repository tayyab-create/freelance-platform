import React, { useState } from 'react';
import {
    FiAlertTriangle,
    FiCheckCircle,
    FiFile,
    FiPaperclip,
    FiCalendar,
    FiChevronDown,
    FiChevronUp,
    FiDownload
} from 'react-icons/fi';

const RevisionTimeline = ({ revisionHistory, currentSubmission, userRole = 'worker' }) => {
    const [expandedItems, setExpandedItems] = useState({});
    const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

    const getFullFileUrl = (fileUrl) => {
        if (!fileUrl) return '';
        if (fileUrl.startsWith('http')) {
            return fileUrl.replace('http://localhost:5000', API_BASE_URL);
        }
        return `${API_BASE_URL}${fileUrl}`;
    };

    const toggleExpand = (index) => {
        setExpandedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    if (!revisionHistory || revisionHistory.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider px-3">
                    Revision Timeline
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-200 via-blue-200 to-green-200"></div>

                {/* Timeline Items */}
                <div className="space-y-6">
                    {revisionHistory.map((revision, index) => {
                        const isExpanded = expandedItems[index];
                        const revisionNumber = index + 1;

                        return (
                            <div key={index} className="relative pl-14">
                                {/* Timeline Dot */}
                                <div className="absolute left-3.5 top-3 w-5 h-5 rounded-full bg-orange-500 border-4 border-white shadow-lg flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                </div>

                                {/* Content Card */}
                                <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                                    {/* Header */}
                                    <button
                                        onClick={() => toggleExpand(index)}
                                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-100 rounded-lg">
                                                <FiAlertTriangle className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-gray-900">Revision #{revisionNumber}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {new Date(revision.submittedAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        {isExpanded ? (
                                            <FiChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <FiChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 pt-2 space-y-4 border-t border-gray-100">
                                            {/* Client Feedback */}
                                            {revision.feedback && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                        {userRole === 'worker' ? 'Client Feedback' : 'Your Feedback'}
                                                    </label>
                                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                            {revision.feedback}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Deadline */}
                                            {revision.revisionDeadline && (
                                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <FiCalendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                    <div>
                                                        <span className="text-xs font-bold text-blue-900 mr-2">Deadline:</span>
                                                        <span className="text-sm text-blue-700">
                                                            {new Date(revision.revisionDeadline).toLocaleDateString('en-US', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Worker's Submission */}
                                            {revision.description && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                        {userRole === 'worker' ? 'Your Submission' : 'Worker Submission'}
                                                    </label>
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                            {revision.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Submitted Files */}
                                            {revision.files && revision.files.length > 0 && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                        Submitted Files ({revision.files.length})
                                                    </label>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {revision.files.map((file, fileIndex) => (
                                                            <a
                                                                key={fileIndex}
                                                                href={getFullFileUrl(file.fileUrl)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group"
                                                            >
                                                                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                                                    <FiFile className="w-4 h-4 text-blue-600" />
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 flex-1 truncate">
                                                                    {file.fileName}
                                                                </span>
                                                                <FiDownload className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Reference Documents */}
                                            {revision.attachments && revision.attachments.length > 0 && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                        {userRole === 'worker' ? 'Client Reference Documents' : 'Your Reference Documents'} ({revision.attachments.length})
                                                    </label>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {revision.attachments.map((file, fileIndex) => (
                                                            <a
                                                                key={fileIndex}
                                                                href={getFullFileUrl(file.fileUrl)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download
                                                                className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:border-purple-400 hover:shadow-md transition-all group"
                                                            >
                                                                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                                                    <FiPaperclip className="w-4 h-4 text-purple-600" />
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 flex-1 truncate">
                                                                    {file.fileName}
                                                                </span>
                                                                <FiDownload className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Current/Latest Submission Indicator */}
                    <div className="relative pl-14">
                        <div className="absolute left-3.5 top-3 w-5 h-5 rounded-full bg-green-500 border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                            <FiCheckCircle className="w-3 h-3 text-white" />
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-green-900">Current Submission</h4>
                                    <p className="text-xs text-green-700 mt-0.5">
                                        {currentSubmission?.status === 'revision-requested'
                                            ? 'Awaiting revision'
                                            : currentSubmission?.status === 'submitted'
                                            ? 'Under review'
                                            : 'Latest version'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevisionTimeline;
