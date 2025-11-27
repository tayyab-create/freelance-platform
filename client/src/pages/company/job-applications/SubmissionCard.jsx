import React from 'react';
import { FiFileText, FiPaperclip, FiEye } from 'react-icons/fi';
import Button from '../../../components/common/Button';
import { StatusBadge } from '../../../components/shared';

const SubmissionCard = ({ submission, onViewSubmission }) => {
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
                    <p className="text-gray-600 italic line-clamp-2">
                        "{submission.description || 'No description provided.'}"
                    </p>
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
