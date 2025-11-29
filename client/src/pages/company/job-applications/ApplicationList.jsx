import React from 'react';
import {
    FiUser,
    FiStar,
    FiFileText,
    FiPaperclip,
    FiDownload,
    FiMessageCircle,
    FiCheckCircle
} from 'react-icons/fi';
import Button from '../../../components/common/Button';
import { StatusBadge, ExpandableText, Avatar } from '../../../components/shared';

const ApplicationList = ({
    applications,
    job,
    handleMessageWorker,
    handleAssignJobClick,
    messagingWorker,
    assigningTo,
    searchQuery
}) => {
    if (applications.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-6">
                    <FiFileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {searchQuery ? 'No matching applications' : 'No Applications Yet'}
                </h3>
                <p className="text-gray-500">
                    {searchQuery ? 'Try adjusting your search' : 'Applications will appear here when workers apply to this job'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {applications.map((application) => (
                <div
                    key={application._id}
                    className={`bg-white rounded-2xl border ${application.status === 'accepted' ? 'border-green-200 ring-4 ring-green-50' : 'border-gray-200'} overflow-hidden hover:shadow-lg transition-all duration-300`}
                >
                    {/* Applicant Header */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <Avatar
                                    src={application.workerInfo?.profilePicture}
                                    name={application.workerInfo?.fullName || 'Worker'}
                                    size="custom"
                                    className="w-16 h-16 !rounded-full"
                                    shape="circle"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {application.workerInfo?.fullName || 'Worker'}
                                        </h3>
                                        <p className="text-gray-500">{application.worker?.email}</p>
                                    </div>
                                    <StatusBadge status={application.status} />
                                </div>

                                {application.workerInfo && (
                                    <div className="flex items-center gap-4 text-sm mt-2">
                                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg">
                                            <FiStar className="w-4 h-4 fill-current" />
                                            <span className="font-bold">
                                                {application.workerInfo.averageRating?.toFixed(1) || '0.0'}
                                            </span>
                                            <span className="text-yellow-600/70">
                                                ({application.workerInfo.totalReviews || 0} reviews)
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        {/* Proposal */}
                        <div className="p-6 md:col-span-2">
                            <div className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FiFileText className="w-4 h-4" />
                                Cover Letter
                            </div>
                            <ExpandableText
                                text={application.proposal}
                                limit={300}
                                textClassName="text-gray-700 leading-relaxed"
                            />

                            {/* Skills */}
                            {application.workerInfo?.skills && application.workerInfo.skills.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Skills</div>
                                    <div className="flex flex-wrap gap-2">
                                        {application.workerInfo.skills.slice(0, 10).map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            {application.attachments && application.attachments.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <FiPaperclip className="w-4 h-4" />
                                        Attachments
                                    </div>
                                    <div className="space-y-2">
                                        {application.attachments.map((file, index) => (
                                            <a
                                                key={index}
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-white hover:bg-indigo-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all group"
                                            >
                                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                                    <FiDownload className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                                        {file.fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Download'}
                                                    </p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rate & Actions */}
                        <div className="p-6 bg-gray-50/50 flex flex-col justify-between">
                            <div className="mb-6">
                                <div className="text-sm text-gray-500 font-medium mb-1">Proposed Rate</div>
                                <div className="text-3xl font-bold text-gray-900">${application.proposedRate}</div>
                                <div className="text-sm text-gray-500">Total amount</div>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    variant="secondary"
                                    icon={FiMessageCircle}
                                    onClick={() => handleMessageWorker(application.worker._id)}
                                    loading={messagingWorker === application.worker._id}
                                    disabled={messagingWorker !== null}
                                    className="w-full justify-center"
                                >
                                    Message
                                </Button>

                                {application.status === 'pending' && job?.status === 'posted' && (
                                    <Button
                                        variant="primary"
                                        icon={FiCheckCircle}
                                        onClick={() => handleAssignJobClick(application.worker._id, application._id)}
                                        loading={assigningTo === application._id}
                                        disabled={assigningTo !== null}
                                        className="w-full justify-center"
                                    >
                                        Assign Job
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ApplicationList;
