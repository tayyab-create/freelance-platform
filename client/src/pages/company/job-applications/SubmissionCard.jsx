import React, { useState } from 'react';
import { FiFileText, FiPaperclip, FiEye, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Button from '../../../components/common/Button';
import { StatusBadge } from '../../../components/shared';

const SubmissionCard = ({ submission, onViewSubmission }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!submission) return null;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Current Work</h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <FiFileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Work Submitted</h3>
                            <p className="text-sm text-gray-500">
                                Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <StatusBadge status={submission.status} />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className={`text-gray-600 italic whitespace-pre-line transition-all duration-300 ${!isExpanded && (submission.description || '').length > 200 ? 'max-h-20 overflow-hidden relative' : ''}`}>
                        <p>
                            {isExpanded || (submission.description || '').length <= 200
                                ? (submission.description || 'No description provided.')
                                : `${(submission.description || '').slice(0, 200)}...`}
                        </p>
                        {!isExpanded && (submission.description || '').length > 200 && (
                            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                        )}
                    </div>
                    {(submission.description || '').length > 200 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-2 inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors group text-sm"
                        >
                            <span>{isExpanded ? 'See Less' : 'See More'}</span>
                            {isExpanded ? (
                                <FiChevronUp className="w-3 h-3 transition-transform duration-200 group-hover:-translate-y-0.5" />
                            ) : (
                                <FiChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:translate-y-0.5" />
                            )}
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        {submission.files?.length > 0 && (
                            <div className="flex items-center gap-2">
                                <FiPaperclip className="w-4 h-4" />
                                {submission.files.length} Attachments
                            </div>
                        )}
                    </div>
                    <Button
                        variant="primary"
                        icon={FiEye}
                        onClick={onViewSubmission}
                    >
                        View Submission
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionCard;
