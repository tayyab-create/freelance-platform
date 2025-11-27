import React, { useEffect, useState } from 'react';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import {
    FiCheckCircle,
    FiRefreshCw,
    FiStar,
    FiClock,
    FiUser,
    FiFileText,
    FiArrowRight,
    FiPaperclip,
    FiDownload,
    FiEye,
    FiSearch
} from 'react-icons/fi';
import { toast } from '../../utils/toast';
import ReviewModal from '../../components/company/ReviewModal';
import SubmissionDetailsModal from '../../components/company/SubmissionDetailsModal';
import RequestRevisionModal from '../../components/company/RequestRevisionModal';
import { SkeletonLoader, StatusBadge, Avatar, PageHeader, ConfirmationModal, SuccessAnimation } from '../../components/shared';

const Submissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [processing, setProcessing] = useState(null);

    // Modals
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewingSubmission, setReviewingSubmission] = useState(null);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [requestingRevision, setRequestingRevision] = useState(false);

    // Confirmation & Success
    const [submissionToApprove, setSubmissionToApprove] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await companyAPI.getSubmissions();
            setSubmissions(response.data.data);
        } catch (error) {
            toast.error('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (jobId) => {
        setSubmissionToApprove(jobId);
    };

    const handleApproveConfirm = async () => {
        const jobId = submissionToApprove;
        setProcessing(jobId);
        setSubmissionToApprove(null);

        try {
            await companyAPI.completeJob(jobId);
            setShowDetailsModal(false);
            setShowSuccess(true);
            fetchSubmissions();
        } catch (error) {
            toast.error('Failed to complete job');
        } finally {
            setProcessing(null);
        }
    };

    const handleOpenReviewModal = (submission) => {
        setReviewingSubmission(submission);
        setShowReviewModal(true);
    };

    const handleSubmitReview = async (reviewData) => {
        setSubmittingReview(true);
        try {
            await companyAPI.reviewWorker(reviewingSubmission.worker._id, {
                jobId: reviewingSubmission.job._id,
                ...reviewData
            });
            toast.success('Review submitted successfully!');
            setShowReviewModal(false);
            setReviewingSubmission(null);
            fetchSubmissions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleRequestRevision = (submission) => {
        setShowDetailsModal(false);
        setSelectedSubmission(submission);
        setShowRevisionModal(true);
    };

    const submitRevisionRequest = async (revisionData) => {
        if (!selectedSubmission) return;

        setRequestingRevision(true);
        try {
            await companyAPI.requestRevision(selectedSubmission.job._id, revisionData);
            toast.success('Revision requested successfully!');
            setShowRevisionModal(false);
            setSelectedSubmission(null);
            fetchSubmissions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to request revision');
        } finally {
            setRequestingRevision(false);
        }
    };

    const handleViewDetails = (submission) => {
        setSelectedSubmission(submission);
        setShowDetailsModal(true);
    };

    const filteredSubmissions = submissions.filter(sub => {
        if (filter !== 'all' && sub.status !== filter) return false;
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            sub.job?.title?.toLowerCase().includes(query) ||
            sub.worker?.email?.toLowerCase().includes(query) ||
            sub.workerInfo?.fullName?.toLowerCase().includes(query)
        );
    });

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-8">
                {/* Header */}
                <PageHeader
                    title="Submissions"
                    subtitle="Review work submitted by freelancers"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/company/dashboard' },
                        { label: 'Submissions' }
                    ]}
                    actions={
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                            <FiFileText className="w-4 h-4 text-primary-600" />
                            <p className="text-gray-700 font-bold">{submissions.length} Total</p>
                        </div>
                    }
                />

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search Input */}
                    <div className="relative w-full md:w-96">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by job, worker name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all shadow-sm"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-1.5 overflow-x-auto w-full md:w-auto">
                        <div className="flex gap-1 min-w-max">
                            {[
                                { key: 'all', label: 'All Submissions' },
                                { key: 'submitted', label: 'New' },
                                { key: 'revision-requested', label: 'Revisions' },
                                { key: 'approved', label: 'Approved' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${filter === tab.key
                                        ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                                        : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${filter === tab.key ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {tab.key === 'all' ? submissions.length : submissions.filter(s => s.status === tab.key).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submissions Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SkeletonLoader type="card" count={6} />
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-6">
                            <FiFileText className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No submissions found</h3>
                        <p className="text-gray-500">
                            {searchQuery ? 'Try adjusting your search filters' : 'Work submissions will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSubmissions.map((submission) => (
                            <div
                                key={submission._id}
                                onClick={() => handleViewDetails(submission)}
                                className="group relative bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
                            >
                                {/* Decorative Gradient Blob */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />

                                <div className="relative flex flex-col h-full">
                                    {/* Card Header */}
                                    <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                                        <div className="flex justify-between items-start gap-3 mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors" title={submission.job?.title}>
                                                    {submission.job?.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={submission.status} size="sm" />
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                                    <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                            <FiClock className="w-3.5 h-3.5" />
                                            Submitted {new Date(submission.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Worker Info */}
                                    <div className="px-5 py-4 flex items-center gap-3">
                                        {submission.workerInfo?.profilePicture ? (
                                            <img
                                                src={submission.workerInfo.profilePicture}
                                                alt={submission.workerInfo.fullName}
                                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                {submission.workerInfo?.fullName?.charAt(0) || submission.worker?.email?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {submission.workerInfo?.fullName || 'Freelancer'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {submission.worker?.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content Snippet */}
                                    <div className="px-5 pb-4 flex-1">
                                        <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100 group-hover:border-primary-100 transition-colors">
                                            <p className="text-sm text-gray-600 line-clamp-3 italic">
                                                "{submission.description || 'No description provided.'}"
                                            </p>
                                        </div>

                                        {submission.files?.length > 0 && (
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                                <FiPaperclip className="w-3.5 h-3.5" />
                                                {submission.files.length} file{submission.files.length !== 1 ? 's' : ''} attached
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="p-4 border-t border-gray-100 mt-auto flex items-center gap-3 bg-gray-50/30">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDetails(submission);
                                            }}
                                            className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2 shadow-none hover:shadow-lg"
                                        >
                                            <FiEye className="w-4 h-4" />
                                            View Details
                                        </button>

                                        {submission.status === 'approved' && !submission.hasReview && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenReviewModal(submission);
                                                }}
                                                className="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                title="Leave a Review"
                                            >
                                                <FiStar className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Submission Details Modal */}
            <SubmissionDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                submission={selectedSubmission}
                onApprove={handleApproveClick}
                onRequestRevision={handleRequestRevision}
                processing={processing}
            />

            {/* Request Revision Modal */}
            <RequestRevisionModal
                isOpen={showRevisionModal}
                onClose={() => {
                    setShowRevisionModal(false);
                    setSelectedSubmission(null);
                }}
                submission={selectedSubmission}
                onSubmit={submitRevisionRequest}
                loading={requestingRevision}
            />

            {/* Review Modal */}
            {showReviewModal && reviewingSubmission && (
                <ReviewModal
                    job={reviewingSubmission.job}
                    worker={{
                        ...reviewingSubmission.worker,
                        profilePicture: reviewingSubmission.workerInfo?.profilePicture,
                        fullName: reviewingSubmission.workerInfo?.fullName
                    }}
                    onSubmit={handleSubmitReview}
                    onClose={() => setShowReviewModal(false)}
                    loading={submittingReview}
                />
            )}

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

export default Submissions;
