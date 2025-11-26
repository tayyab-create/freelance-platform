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
    FiArrowRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReviewModal from '../../components/company/ReviewModal';
import SubmissionDetailsModal from '../../components/company/SubmissionDetailsModal';
import { SkeletonLoader } from '../../components/shared';
import FilterBar from '../../components/shared/FilterBar';
import StatusBadge from '../../components/shared/StatusBadge';

const Submissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [processing, setProcessing] = useState(null);

    // Modals
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewingSubmission, setReviewingSubmission] = useState(null);
    const [submittingReview, setSubmittingReview] = useState(false);

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

    const handleApprove = async (jobId) => {
        if (!window.confirm('Are you sure you want to approve this submission and mark the job as complete?')) {
            return;
        }

        setProcessing(jobId);
        try {
            await companyAPI.completeJob(jobId);
            toast.success('Job completed successfully!');
            setShowDetailsModal(false);
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
        // If called from details modal, close it first or keep it open?
        // Let's close details modal and open feedback modal
        setShowDetailsModal(false);
        setSelectedSubmission(submission);
        setShowFeedbackModal(true);
        setFeedback('');
    };

    const submitRevisionRequest = async (e) => {
        e.preventDefault();
        toast.info('Revision request feature coming soon!');
        setShowFeedbackModal(false);
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
            sub.worker?.email?.toLowerCase().includes(query)
        );
    });

    const statusCounts = {
        all: submissions.length,
        submitted: submissions.filter(s => s.status === 'submitted').length,
        approved: submissions.filter(s => s.status === 'approved').length,
    };

    const filterOptions = [
        {
            key: 'status', label: 'Status', type: 'select', options: [
                { value: 'submitted', label: 'New' },
                { value: 'approved', label: 'Approved' }
            ]
        }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
                    <p className="text-gray-500 mt-1">Review and manage work submissions</p>
                </div>

                {/* Filter Bar */}
                <div className="mb-8">
                    <FilterBar
                        onSearch={setSearchQuery}
                        onFilterChange={(filters) => setFilter(filters.status || 'all')}
                        filters={filterOptions}
                        searchPlaceholder="Search by job or worker..."
                    />
                </div>

                {/* Submissions Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SkeletonLoader type="card" count={4} />
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-6">
                            <FiFileText className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No submissions found</h3>
                        <p className="text-gray-500">
                            {searchQuery ? 'Try adjusting your search filters' : 'Work submissions will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredSubmissions.map((submission) => (
                            <div
                                key={submission._id}
                                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xl">
                                            {submission.job?.title?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-1" title={submission.job?.title}>
                                                {submission.job?.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <FiUser className="w-3.5 h-3.5" />
                                                <span className="truncate max-w-[150px]">{submission.worker?.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <StatusBadge status={submission.status} />
                                </div>

                                <div className="mb-6">
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                        {submission.description || 'No description provided.'}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                                            <FiClock className="w-3.5 h-3.5" />
                                            {new Date(submission.createdAt).toLocaleDateString()}
                                        </div>
                                        {submission.files?.length > 0 && (
                                            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                                                <FiFileText className="w-3.5 h-3.5" />
                                                {submission.files.length} Attachments
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex gap-2">
                                        {submission.status === 'approved' && !submission.hasReview && (
                                            <button
                                                onClick={() => handleOpenReviewModal(submission)}
                                                className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1.5"
                                            >
                                                <FiStar className="w-4 h-4" />
                                                Review
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleViewDetails(submission)}
                                        className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:border-primary-200 transition-all"
                                    >
                                        View Details
                                        <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
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
                onApprove={handleApprove}
                onRequestRevision={handleRequestRevision}
                processing={processing}
            />

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-in">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Request Changes</h2>
                        <form onSubmit={submitRevisionRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    What needs to be changed?
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Describe what needs to be revised..."
                                    rows="6"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" variant="primary" className="flex-1">
                                    Send Request
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowFeedbackModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
        </DashboardLayout>
    );
};

export default Submissions;
