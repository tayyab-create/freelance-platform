import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import {
    FiUser,
    FiClock,
    FiFileText,
    FiExternalLink,
    FiFile,
    FiCheckCircle,
    FiRefreshCw,
    FiDownload,
    FiCalendar,
    FiPaperclip,
    FiDollarSign,
    FiBriefcase,
    FiArrowRight,
    FiChevronDown,
    FiChevronUp,
    FiX,
    FiArrowLeft
} from 'react-icons/fi';
import { StatusBadge, Avatar, RevisionTimeline, PageHeader, SkeletonLoader, ConfirmationModal, SuccessAnimation } from '../../components/shared';
import RequestRevisionModal from '../../components/company/RequestRevisionModal';
import { companyAPI } from '../../services/api';
import { toast } from '../../utils/toast';

const SubmissionDetails = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();

    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Modals
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [requestingRevision, setRequestingRevision] = useState(false);
    const [submissionToApprove, setSubmissionToApprove] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchSubmissionDetails();
    }, [submissionId]);

    const fetchSubmissionDetails = async () => {
        try {
            setLoading(true);
            const response = await companyAPI.getSubmissionById(submissionId);
            setSubmission(response.data.data);
        } catch (error) {
            toast.error('Failed to load submission details');
            // Redirect back to submissions page after 2 seconds
            setTimeout(() => navigate('/company/submissions'), 2000);
        } finally {
            setLoading(false);
        }
    };

    const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

    const getFullFileUrl = (fileUrl) => {
        if (!fileUrl) return '';
        if (fileUrl.startsWith('http')) {
            return fileUrl.replace('http://localhost:5000', API_BASE_URL);
        }
        return `${API_BASE_URL}${fileUrl}`;
    };

    const isImageFile = (file) => {
        if (file.fileType) {
            return file.fileType.startsWith('image/');
        }
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        return imageExtensions.some(ext => file.fileName?.toLowerCase().endsWith(ext));
    };

    const handleApproveClick = () => {
        setSubmissionToApprove(submission.job._id);
    };

    const handleApproveConfirm = async () => {
        const jobId = submissionToApprove;
        setProcessing(true);
        setSubmissionToApprove(null);

        try {
            await companyAPI.completeJob(jobId);
            setShowSuccess(true);
            // Redirect after success animation
            setTimeout(() => navigate('/company/submissions'), 2000);
        } catch (error) {
            toast.error('Failed to complete job');
        } finally {
            setProcessing(false);
        }
    };

    const handleRequestRevision = () => {
        setShowRevisionModal(true);
    };

    const submitRevisionRequest = async (revisionData) => {
        if (!submission) return;

        setRequestingRevision(true);
        try {
            await companyAPI.requestRevision(submission.job._id, revisionData);
            toast.success('Revision requested successfully!');
            setShowRevisionModal(false);
            fetchSubmissionDetails(); // Refresh to show updated status
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to request revision');
        } finally {
            setRequestingRevision(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-8 pb-8">
                    <SkeletonLoader type="page" />
                </div>
            </DashboardLayout>
        );
    }

    if (!submission) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Submission not found</h2>
                    <Button onClick={() => navigate('/company/submissions')}>
                        Back to Submissions
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-8">
                {/* Header */}
                <PageHeader
                    title="Submission Review"
                    subtitle={submission.job?.title}
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/company/dashboard' },
                        { label: 'Submissions', href: '/company/submissions' },
                        { label: 'Review' }
                    ]}
                    actions={
                        <button
                            onClick={() => navigate('/company/submissions')}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Back to Submissions
                        </button>
                    }
                />

                {/* Main Content */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-8 border-b border-gray-100">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {submission.job?.title}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="font-medium text-gray-700">Job ID:</span>
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {submission.job?._id?.slice(-8)}
                                </span>
                            </div>
                        </div>
                        <StatusBadge status={submission.status} size="lg" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
                        {/* Left Column: Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FiFileText className="w-4 h-4 text-gray-400" />
                                    Submission Notes
                                </h3>
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <div className={`text-gray-700 leading-relaxed whitespace-pre-wrap transition-all duration-300 ${!isExpanded && (submission.description || '').length > 500 ? 'max-h-60 overflow-hidden relative' : ''}`}>
                                        {submission.description || (
                                            <span className="text-gray-400 italic">No description provided.</span>
                                        )}
                                        {!isExpanded && (submission.description || '').length > 500 && (
                                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                                        )}
                                    </div>
                                    {(submission.description || '').length > 500 && (
                                        <button
                                            onClick={() => setIsExpanded(!isExpanded)}
                                            className="mt-4 inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors group"
                                        >
                                            <span>{isExpanded ? 'See Less' : 'See More'}</span>
                                            {isExpanded ? (
                                                <FiChevronUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                                            ) : (
                                                <FiChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* External Links */}
                            {submission.links && submission.links.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <FiExternalLink className="w-4 h-4 text-gray-400" />
                                        External Links
                                    </h3>
                                    <div className="space-y-2">
                                        {submission.links.map((link, index) => (
                                            <a
                                                key={index}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                    <FiExternalLink className="w-5 h-5" />
                                                </div>
                                                <span className="text-blue-600 font-medium truncate flex-1 group-hover:underline">
                                                    {link}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Attachments Grid */}
                            {submission.files && submission.files.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <FiPaperclip className="w-4 h-4 text-gray-400" />
                                        Attachments ({submission.files.length})
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {submission.files.map((file, index) => {
                                            const fileUrl = getFullFileUrl(file.fileUrl);
                                            const isImage = isImageFile(file);

                                            return (
                                                <div
                                                    key={index}
                                                    className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                                                >
                                                    {isImage ? (
                                                        <div
                                                            className="aspect-[4/3] bg-gray-100 cursor-pointer overflow-hidden relative"
                                                            onClick={() => setPreviewImage(fileUrl)}
                                                        >
                                                            <img
                                                                src={fileUrl}
                                                                alt={file.fileName}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                        </div>
                                                    ) : (
                                                        <div className="aspect-[4/3] bg-gray-50 flex flex-col items-center justify-center p-4 group-hover:bg-gray-100 transition-colors">
                                                            <FiFile className="w-10 h-10 text-gray-400 mb-2 group-hover:text-gray-600 transition-colors" />
                                                            <span className="text-xs text-gray-500 uppercase font-bold">
                                                                {file.fileName.split('.').pop()}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="p-3">
                                                        <p className="text-sm font-medium text-gray-900 truncate mb-2" title={file.fileName}>
                                                            {file.fileName}
                                                        </p>
                                                        <a
                                                            href={fileUrl}
                                                            download
                                                            className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg transition-colors border border-gray-100"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <FiDownload className="w-3 h-3" />
                                                            Download
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Meta Info */}
                        <div className="space-y-6">
                            {/* Worker Profile Card */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                    Submitted By
                                </h3>
                                <div className="flex items-center gap-4 mb-4">
                                    {submission.workerInfo?.profilePicture ? (
                                        <Avatar
                                            src={submission.workerInfo.profilePicture}
                                            name={submission.workerInfo.fullName}
                                            size="lg"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600 font-bold text-lg">
                                            {submission.workerInfo?.fullName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-base font-bold text-gray-900 truncate">
                                            {submission.workerInfo?.fullName || 'Freelancer'}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {submission.worker?.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FiCalendar className="w-4 h-4 text-gray-400" />
                                        <span>
                                            {new Date(submission.createdAt).toLocaleDateString(undefined, {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                        <FiClock className="w-4 h-4 text-gray-400" />
                                        <span>
                                            {new Date(submission.createdAt).toLocaleTimeString(undefined, {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Job Details Card */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                    Job Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FiDollarSign className="w-4 h-4" />
                                            <span className="text-sm">Budget</span>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900">
                                            ${submission.job?.salary}
                                            <span className="text-xs text-gray-500 font-normal ml-1">
                                                /{submission.job?.salaryType}
                                            </span>
                                        </div>
                                    </div>

                                    {submission.job?.duration && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FiClock className="w-4 h-4" />
                                                <span className="text-sm">Duration</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">
                                                {submission.job.duration}
                                            </span>
                                        </div>
                                    )}

                                    {submission.job?.experienceLevel && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FiBriefcase className="w-4 h-4" />
                                                <span className="text-sm">Level</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 capitalize">
                                                {submission.job.experienceLevel}
                                            </span>
                                        </div>
                                    )}

                                    <div className="pt-4 mt-2 border-t border-gray-100">
                                        <Link
                                            to={`/company/jobs/${submission.job?._id}`}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-primary-600 font-medium rounded-xl transition-colors border border-gray-100 group"
                                        >
                                            View Job Details
                                            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revision History */}
                    {submission.revisionHistory && submission.revisionHistory.length > 0 && (
                        <div className="px-8 pb-8">
                            <RevisionTimeline
                                revisionHistory={submission.revisionHistory}
                                currentSubmission={submission}
                                userRole="company"
                            />
                        </div>
                    )}

                    {/* Action Footer */}
                    {submission.status === 'submitted' && (
                        <div className="flex gap-3 justify-end p-8 border-t border-gray-100 bg-gray-50/50">
                            <Button variant="secondary" onClick={() => navigate('/company/submissions')}>
                                Back
                            </Button>
                            <Button
                                variant="secondary"
                                icon={FiRefreshCw}
                                onClick={handleRequestRevision}
                                disabled={processing}
                            >
                                Request Changes
                            </Button>
                            <Button
                                variant="primary"
                                icon={FiCheckCircle}
                                onClick={handleApproveClick}
                                loading={processing}
                                disabled={processing}
                            >
                                Approve & Complete
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
                    >
                        <FiX className="w-8 h-8" />
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Request Revision Modal */}
            <RequestRevisionModal
                isOpen={showRevisionModal}
                onClose={() => setShowRevisionModal(false)}
                submission={submission}
                onSubmit={submitRevisionRequest}
                loading={requestingRevision}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!submissionToApprove}
                onClose={() => setSubmissionToApprove(null)}
                onConfirm={handleApproveConfirm}
                title="Approve Submission?"
                message="Are you sure you want to approve this submission? This will mark the job as complete and release payment to the freelancer."
                confirmText="Approve & Complete"
                cancelText="Cancel"
                variant="success"
            />

            {/* Success Animation */}
            <SuccessAnimation
                show={showSuccess}
                message="Job Completed!"
                description="The submission has been approved and the job is now marked as complete."
                showConfetti={true}
                onComplete={() => setShowSuccess(false)}
            />
        </DashboardLayout>
    );
};

export default SubmissionDetails;
