import React, { useEffect, useState } from 'react';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { FiCheckCircle, FiX, FiRefreshCw, FiDownload, FiExternalLink, FiFile, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReviewModal from '../../components/company/ReviewModal';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
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
    const handleOpenReviewModal = (submission) => {
      setReviewingSubmission(submission);
      setShowReviewModal(true);
    };

    setProcessing(jobId);
    try {
      await companyAPI.completeJob(jobId);
      toast.success('Job completed successfully!');
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
    setSelectedSubmission(submission);
    setShowFeedbackModal(true);
    setFeedback('');
  };

  const submitRevisionRequest = async (e) => {
    e.preventDefault();
    // This would need a new API endpoint to update submission status
    toast.info('Revision request feature coming soon!');
    setShowFeedbackModal(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'badge-warning',
      'under-review': 'badge-info',
      approved: 'badge-success',
      rejected: 'badge-danger',
      'revision-requested': 'badge-pending',
    };
    return colors[status] || 'badge-info';
  };

  const filteredSubmissions = filter === 'all'
    ? submissions
    : submissions.filter(sub => sub.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Submitted Work</h1>
          <p className="text-gray-600 mt-2">Review and approve work submitted by freelancers</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'submitted', 'under-review', 'approved', 'revision-requested'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {status === 'all' ? 'All' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No submissions found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSubmissions.map((submission) => (
              <div key={submission._id} className="card">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{submission.job?.title}</h3>
                    <p className="text-sm text-gray-600">
                      Submitted by: {submission.worker?.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(submission.createdAt).toLocaleDateString()} at{' '}
                      {new Date(submission.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`badge ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-2">Work Description:</h4>
                  <p className="text-gray-700 whitespace-pre-line">{submission.description}</p>
                </div>

                {/* Links */}
                {submission.links && submission.links.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Links:</h4>
                    <div className="space-y-2">
                      {submission.links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                        >
                          <FiExternalLink className="h-4 w-4" />
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files */}
                {submission.files && submission.files.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Attached Files:</h4>
                    <div className="space-y-2">
                      {submission.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FiFile className="h-5 w-5 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.fileName}</span>
                          </div>
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <FiDownload className="h-4 w-4" />
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {submission.feedback && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold mb-2 text-yellow-800">Feedback:</h4>
                    <p className="text-yellow-700">{submission.feedback}</p>
                  </div>
                )}

                {/* Actions for Submitted Status */}
                {submission.status === 'submitted' && (
                  <div className="flex gap-3 mt-4">
                    <Button
                      variant="success"
                      icon={FiCheckCircle}
                      onClick={() => handleApprove(submission.job._id)}
                      loading={processing === submission.job._id}
                      disabled={processing !== null}
                    >
                      Approve & Complete
                    </Button>
                    <Button
                      variant="secondary"
                      icon={FiRefreshCw}
                      onClick={() => handleRequestRevision(submission)}
                      disabled={processing !== null}
                    >
                      Request Revision
                    </Button>
                  </div>
                )}

                {/* Review Button for Approved/Completed Jobs */}
                {(submission.status === 'approved' || submission.job?.status === 'completed') && !submission.hasReview && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-green-800 mb-1">
                          ✅ Job completed successfully!
                        </p>
                        <p className="text-sm text-green-700">
                          Would you like to review this worker's performance?
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        icon={FiStar}
                        onClick={() => handleOpenReviewModal(submission)}
                      >
                        Write a Review
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show if Review Already Submitted */}
                {submission.hasReview && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ✓ Review submitted for this job
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Request Revision</h2>
            <form onSubmit={submitRevisionRequest} className="space-y-4">
              <div>
                <label className="label">Feedback for Worker *</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Explain what needs to be revised..."
                  rows="6"
                  required
                  className="input-field"
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="primary">
                  Send Revision Request
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowFeedbackModal(false)}
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