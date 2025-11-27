import React, { useState, useEffect } from 'react';
import { FiMessageCircle, FiPlay, FiUpload, FiBriefcase, FiClock, FiDollarSign, FiCalendar, FiFile, FiAward, FiCheckCircle, FiAlertCircle, FiPaperclip, FiDownload, FiAlertTriangle, FiStar } from 'react-icons/fi';
import { Modal, RevisionTimeline, StatusBadge, ReviewCard, ExpandableText } from '../../shared';
import { workerAPI } from '../../../services/api';

const JobDetailsModal = ({
    isOpen,
    onClose,
    selectedJob,
    handleStartConversation,
    handleStartJob,
    handleOpenSubmitModal,
    handleOpenReviewModal,
    loadingSubmission,
    submissionDetails,
    isDeadlineApproaching
}) => {
    const [reviewsData, setReviewsData] = useState(null);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        // Fetch reviews when modal opens and job is completed
        if (isOpen && selectedJob && selectedJob.status === 'completed') {
            fetchJobReviews();
        } else {
            // Clear reviews when modal closes or job changes
            setReviewsData(null);
        }
    }, [isOpen, selectedJob?._id, selectedJob?.status]);

    const fetchJobReviews = async () => {
        if (!selectedJob?._id) return;

        setLoadingReviews(true);
        try {
            const response = await workerAPI.getJobReviews(selectedJob._id);
            setReviewsData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            // Silent fail - reviews are optional
        } finally {
            setLoadingReviews(false);
        }
    };

    if (!selectedJob) return null;

    const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

    const getFullFileUrl = (fileUrl) => {
        if (!fileUrl) return '';
        if (fileUrl.startsWith('http')) {
            return fileUrl.replace('http://localhost:5000', API_BASE_URL);
        }
        return `${API_BASE_URL}${fileUrl}`;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Job Details"
            size="lg"
            footer={
                selectedJob && (
                    <div className="flex justify-between w-full gap-4">
                        <button
                            onClick={() => handleStartConversation(selectedJob)}
                            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <FiMessageCircle className="h-5 w-5" />
                            Message
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                            {selectedJob.status === 'assigned' && (
                                <button
                                    onClick={() => handleStartJob(selectedJob)}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30 flex items-center gap-2"
                                >
                                    <FiPlay className="h-5 w-5" />
                                    Start Working
                                </button>
                            )}
                            {(selectedJob.status === 'in-progress' || selectedJob.status === 'revision-requested') && (
                                <button
                                    onClick={() => handleOpenSubmitModal(selectedJob)}
                                    className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2"
                                >
                                    <FiUpload className="h-5 w-5" />
                                    {selectedJob.status === 'revision-requested' ? 'Submit Revision' : 'Submit Work'}
                                </button>
                            )}
                            {selectedJob.status === 'completed' && !reviewsData?.hasWorkerReviewed && (
                                <button
                                    onClick={() => handleOpenReviewModal(selectedJob)}
                                    className="px-6 py-2.5 rounded-xl bg-yellow-500 text-white font-bold hover:bg-yellow-600 transition-colors shadow-lg shadow-yellow-500/30 flex items-center gap-2"
                                >
                                    <FiStar className="h-5 w-5" />
                                    Review Company
                                </button>
                            )}
                        </div>
                    </div>
                )
            }
        >
            <div className="space-y-8">
                {/* Header with Company Info */}
                <div className="flex flex-col md:flex-row gap-6 pb-6 border-b border-gray-100">
                    <div className="flex-shrink-0">
                        {selectedJob.companyInfo?.logo ? (
                            <img
                                src={selectedJob.companyInfo.logo}
                                alt={selectedJob.companyInfo.companyName}
                                className="h-20 w-20 rounded-2xl object-cover border border-gray-100 shadow-sm"
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                                <FiBriefcase className="h-10 w-10" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start gap-4">
                            <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{selectedJob.title}</h2>
                            <StatusBadge status={selectedJob.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-gray-600">
                            <span className="font-bold text-gray-900">{selectedJob.companyInfo?.companyName}</span>
                            {selectedJob.companyInfo?.tagline && (
                                <>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-sm">{selectedJob.companyInfo.tagline}</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                            <FiClock className="h-4 w-4" />
                            <span>Assigned on {new Date(selectedJob.assignedDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <FiDollarSign className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Budget</span>
                        </div>
                        <p className="text-lg font-black text-gray-900">${selectedJob.salary}</p>
                        <p className="text-xs text-gray-500 capitalize">{selectedJob.salaryType}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <FiClock className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{selectedJob.duration || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <FiBriefcase className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Level</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 capitalize">{selectedJob.experienceLevel}</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${isDeadlineApproaching(selectedJob.deadline) && (selectedJob.status === 'assigned' || selectedJob.status === 'in-progress')
                        ? 'bg-red-50 border-red-100'
                        : 'bg-gray-50 border-gray-100'
                        }`}>
                        <div className={`flex items-center gap-2 mb-1 ${isDeadlineApproaching(selectedJob.deadline) && (selectedJob.status === 'assigned' || selectedJob.status === 'in-progress')
                            ? 'text-red-600'
                            : 'text-gray-500'
                            }`}>
                            <FiCalendar className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Deadline</span>
                        </div>
                        <div className="flex flex-col">
                            <p className={`text-lg font-bold ${isDeadlineApproaching(selectedJob.deadline) && (selectedJob.status === 'assigned' || selectedJob.status === 'in-progress')
                                ? 'text-red-700'
                                : 'text-gray-900'
                                }`}>
                                {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : 'None'}
                            </p>
                            {selectedJob.deadline && (
                                <p className={`text-xs ${isDeadlineApproaching(selectedJob.deadline) && (selectedJob.status === 'assigned' || selectedJob.status === 'in-progress')
                                    ? 'text-red-600'
                                    : 'text-gray-500'
                                    }`}>
                                    {new Date(selectedJob.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Revision Alert - For Revision Requested Jobs */}
                {selectedJob.status === 'revision-requested' && submissionDetails && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-100 rounded-full flex-shrink-0">
                                <FiAlertTriangle className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-orange-900 mb-2">Revision Requested</h3>
                                    <p className="text-sm text-orange-700">
                                        The client has requested changes to your submission. Please review the feedback and submit a revised version.
                                    </p>
                                </div>

                                {/* Client Feedback */}
                                <div>
                                    <label className="block text-sm font-bold text-orange-900 mb-2">Client's Feedback:</label>
                                    <div className="bg-white p-4 rounded-xl border border-orange-200">
                                        <ExpandableText
                                            text={submissionDetails.revisionFeedback}
                                            limit={200}
                                            textClassName="text-gray-700"
                                        />
                                    </div>
                                </div>

                                {/* New Deadline */}
                                {submissionDetails.revisionDeadline && (
                                    <div className="flex items-center gap-3 bg-orange-100 p-3 rounded-xl">
                                        <FiCalendar className="h-5 w-5 text-orange-600 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <span className="text-sm font-bold text-orange-900">New Deadline: </span>
                                            <span className="text-sm text-orange-700">
                                                {new Date(submissionDetails.revisionDeadline).toLocaleDateString()} at {new Date(submissionDetails.revisionDeadline).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Reference Attachments */}
                                {submissionDetails.revisionAttachments && submissionDetails.revisionAttachments.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-bold text-orange-900 mb-2">
                                            Reference Documents ({submissionDetails.revisionAttachments.length})
                                        </label>
                                        <div className="space-y-2">
                                            {submissionDetails.revisionAttachments.map((file, index) => (
                                                <a
                                                    key={index}
                                                    href={getFullFileUrl(file.fileUrl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    className="flex items-center justify-between bg-white p-3 rounded-xl border border-orange-200 hover:border-orange-300 hover:shadow-md transition-all group min-w-0"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors flex-shrink-0">
                                                            <FiFile className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors truncate" title={file.fileName}>
                                                                {file.fileName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <FiDownload className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0 ml-2" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Revision Count */}
                                {submissionDetails.revisionCount > 0 && (
                                    <div className="pt-3 border-t border-orange-200">
                                        <p className="text-sm text-orange-700">
                                            <span className="font-bold">Revision #{submissionDetails.revisionCount + 1}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Description */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FiFile className="h-5 w-5 text-gray-400" />
                        Job Description
                    </h3>
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                        <ExpandableText
                            text={selectedJob.description}
                            limit={300}
                            textClassName="text-gray-600 text-sm leading-relaxed"
                        />
                    </div>
                </div>

                {/* Skills & Tags */}
                {selectedJob.tags && selectedJob.tags.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <FiAward className="h-5 w-5 text-gray-400" />
                            Skills & Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedJob.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-white text-gray-700 border border-gray-200 shadow-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Job Attachments */}
                {selectedJob.attachments && selectedJob.attachments.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <FiPaperclip className="h-5 w-5 text-gray-400" />
                            Job Attachments
                        </h3>
                        <div className="space-y-2">
                            {selectedJob.attachments.map((file, index) => (
                                <a
                                    key={index}
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                                            <FiFile className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors truncate">
                                                {file.fileName}
                                            </p>
                                            {file.fileSize && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <FiDownload className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0 ml-2" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Revision History */}
                {submissionDetails && submissionDetails.revisionHistory && submissionDetails.revisionHistory.length > 0 && (
                    <div>
                        <RevisionTimeline
                            revisionHistory={submissionDetails.revisionHistory}
                            currentSubmission={submissionDetails}
                            userRole="worker"
                        />
                    </div>
                )}

                {/* Submission Details - For Submitted Jobs */}
                {selectedJob.status === 'submitted' && (
                    <div className="border-t border-gray-200 pt-6 mt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FiCheckCircle className="h-5 w-5 text-teal-500" />
                            Your Submission
                        </h3>
                        {loadingSubmission ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                            </div>
                        ) : submissionDetails ? (
                            <div className="space-y-4 bg-green-50/50 p-6 rounded-2xl border border-green-100">
                                <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
                                    <FiCheckCircle className="h-5 w-5" />
                                    Submitted on {new Date(submissionDetails.createdAt).toLocaleDateString()} at {new Date(submissionDetails.createdAt).toLocaleTimeString()}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <ExpandableText
                                            text={submissionDetails.description}
                                            limit={200}
                                            textClassName="text-gray-600 text-sm leading-relaxed"
                                        />
                                    </div>
                                </div>

                                {submissionDetails.links && submissionDetails.links.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Links</label>
                                        <div className="space-y-2">
                                            {submissionDetails.links.map((link, index) => (
                                                <a
                                                    key={index}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium break-all bg-white p-3 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors"
                                                >
                                                    <FiUpload className="h-4 w-4 flex-shrink-0" />
                                                    {link}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {submissionDetails.files && submissionDetails.files.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Attachments ({submissionDetails.files.length})</label>
                                        <div className="space-y-2">
                                            {submissionDetails.files.map((file, index) => (
                                                <a
                                                    key={index}
                                                    href={file.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                            <FiFile className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">
                                                            {file.fileName}
                                                        </span>
                                                    </div>
                                                    <FiUpload className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-green-200">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`px-3 py-1.5 rounded-lg font-bold ${submissionDetails.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            submissionDetails.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {submissionDetails.status === 'pending' ? 'Under Review' : submissionDetails.status.charAt(0).toUpperCase() + submissionDetails.status.slice(1)}
                                        </span>
                                        {submissionDetails.reviewedAt && (
                                            <span className="text-gray-500">
                                                Reviewed on {new Date(submissionDetails.reviewedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500">
                                <FiAlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">Unable to load submission details</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Completion Details - For Completed Jobs */}
                {selectedJob.status === 'completed' && (
                    <div className="border-t border-gray-200 pt-6 mt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FiCheckCircle className="h-5 w-5 text-green-600" />
                            Job Completed
                        </h3>
                        {loadingSubmission ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                            </div>
                        ) : submissionDetails ? (
                            <div className="space-y-6">
                                {/* Completion Success Banner */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-green-100 rounded-full">
                                            <FiCheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-green-900 mb-2">Successfully Completed!</h4>
                                            <div className="space-y-1 text-sm text-green-700">
                                                <p className="flex items-center gap-2">
                                                    <FiCalendar className="h-4 w-4" />
                                                    <span className="font-semibold">Submitted on:</span>
                                                    {new Date(submissionDetails.createdAt).toLocaleDateString()} at {new Date(submissionDetails.createdAt).toLocaleTimeString()}
                                                </p>
                                                {submissionDetails.reviewedAt && (
                                                    <p className="flex items-center gap-2">
                                                        <FiCheckCircle className="h-4 w-4" />
                                                        <span className="font-semibold">Approved on:</span>
                                                        {new Date(submissionDetails.reviewedAt).toLocaleDateString()} at {new Date(submissionDetails.reviewedAt).toLocaleTimeString()}
                                                    </p>
                                                )}
                                                {selectedJob.completedDate && (
                                                    <p className="flex items-center gap-2">
                                                        <FiCheckCircle className="h-4 w-4" />
                                                        <span className="font-semibold">Completed on:</span>
                                                        {new Date(selectedJob.completedDate).toLocaleDateString()} at {new Date(selectedJob.completedDate).toLocaleTimeString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submission Details */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                    <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <FiFile className="h-5 w-5 text-gray-400" />
                                        Your Submission
                                    </h4>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                <ExpandableText
                                                    text={submissionDetails.description}
                                                    limit={200}
                                                    textClassName="text-gray-600 text-sm leading-relaxed"
                                                />
                                            </div>
                                        </div>

                                        {submissionDetails.links && submissionDetails.links.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Links ({submissionDetails.links.length})</label>
                                                <div className="space-y-2">
                                                    {submissionDetails.links.map((link, index) => (
                                                        <a
                                                            key={index}
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium break-all bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors"
                                                        >
                                                            <FiUpload className="h-4 w-4 flex-shrink-0" />
                                                            {link}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {submissionDetails.files && submissionDetails.files.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Attachments ({submissionDetails.files.length})</label>
                                                <div className="space-y-2">
                                                    {submissionDetails.files.map((file, index) => (
                                                        <a
                                                            key={index}
                                                            href={file.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                                    <FiFile className="h-4 w-4" />
                                                                </div>
                                                                <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">
                                                                    {file.fileName}
                                                                </span>
                                                            </div>
                                                            <FiUpload className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Payment & Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
                                        <div className="flex items-center gap-2 text-green-600 mb-1">
                                            <FiDollarSign className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Payment</span>
                                        </div>
                                        <p className="text-2xl font-black text-green-700">${selectedJob.salary}</p>
                                        <p className="text-xs text-green-600 capitalize">{selectedJob.salaryType}</p>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                                            <FiClock className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                                        </div>
                                        <p className="text-lg font-bold text-blue-700">
                                            {selectedJob.assignedDate && selectedJob.completedDate
                                                ? `${Math.ceil((new Date(selectedJob.completedDate) - new Date(selectedJob.assignedDate)) / (1000 * 60 * 60 * 24))} days`
                                                : 'N/A'}
                                        </p>
                                        <p className="text-xs text-blue-600">From assignment to completion</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500">
                                <FiAlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">Unable to load completion details</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews Section - For Completed Jobs */}
                {selectedJob.status === 'completed' && (
                    <div className="border-t border-gray-200 pt-6 mt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FiStar className="h-5 w-5 text-yellow-500" />
                            Reviews
                        </h3>
                        {loadingReviews ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                            </div>
                        ) : reviewsData ? (
                            <div className="space-y-6">
                                {/* Review Status Banner */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-xl border ${reviewsData.hasWorkerReviewed
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-orange-50 border-orange-200'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <FiStar className={`h-4 w-4 ${reviewsData.hasWorkerReviewed ? 'text-green-600' : 'text-orange-600'}`} />
                                            <span className={`text-xs font-bold uppercase tracking-wider ${reviewsData.hasWorkerReviewed ? 'text-green-600' : 'text-orange-600'}`}>
                                                Your Review
                                            </span>
                                        </div>
                                        <p className={`text-sm font-semibold ${reviewsData.hasWorkerReviewed ? 'text-green-700' : 'text-orange-700'}`}>
                                            {reviewsData.hasWorkerReviewed ? 'Submitted' : 'Not yet submitted'}
                                        </p>
                                    </div>

                                    <div className={`p-4 rounded-xl border ${reviewsData.hasCompanyReviewed
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-gray-50 border-gray-200'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <FiStar className={`h-4 w-4 ${reviewsData.hasCompanyReviewed ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <span className={`text-xs font-bold uppercase tracking-wider ${reviewsData.hasCompanyReviewed ? 'text-blue-600' : 'text-gray-500'}`}>
                                                Company Review
                                            </span>
                                        </div>
                                        <p className={`text-sm font-semibold ${reviewsData.hasCompanyReviewed ? 'text-blue-700' : 'text-gray-500'}`}>
                                            {reviewsData.hasCompanyReviewed ? 'Received' : 'Pending'}
                                        </p>
                                    </div>
                                </div>

                                {/* Display Reviews */}
                                <div className="grid gap-4">
                                    {/* Worker's Review */}
                                    {reviewsData.workerReview ? (
                                        <ReviewCard
                                            review={reviewsData.workerReview}
                                            reviewerType="worker"
                                            reviewerName="You"
                                            reviewerLogo={reviewsData.workerReview.workerInfo?.profilePicture}
                                        />
                                    ) : (
                                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
                                            <FiStar className="h-12 w-12 text-orange-400 mx-auto mb-3" />
                                            <h4 className="text-lg font-bold text-orange-900 mb-2">
                                                Review the Company
                                            </h4>
                                            <p className="text-sm text-orange-700 mb-4">
                                                Share your experience to help other freelancers
                                            </p>
                                            <button
                                                onClick={() => handleOpenReviewModal(selectedJob)}
                                                className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
                                            >
                                                Write Review
                                            </button>
                                        </div>
                                    )}

                                    {/* Company's Review */}
                                    {reviewsData.companyReview ? (
                                        <ReviewCard
                                            review={reviewsData.companyReview}
                                            reviewerType="company"
                                            reviewerName={reviewsData.companyReview.companyInfo?.companyName || selectedJob.companyInfo?.companyName || 'Company'}
                                            reviewerLogo={reviewsData.companyReview.companyInfo?.logo || selectedJob.companyInfo?.logo}
                                        />
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                                            <FiBriefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                            <h4 className="text-base font-bold text-gray-700 mb-2">
                                                Awaiting Company Review
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                The company hasn't reviewed your work yet
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500">
                                <FiAlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">Unable to load reviews</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default JobDetailsModal;
