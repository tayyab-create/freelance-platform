import React, { useEffect, useState } from 'react';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import {
  FiCheckCircle,
  FiX,
  FiRefreshCw,
  FiDownload,
  FiExternalLink,
  FiFile,
  FiStar,
  FiClock,
  FiAlertCircle,
  FiUser,
  FiFileText,
  FiImage,
  FiSearch
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReviewModal from '../../components/company/ReviewModal';
import { SkeletonLoader } from '../../components/shared';

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
  const [previewImage, setPreviewImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

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

  const handleApprove = async (jobId) => {
    if (!window.confirm('Are you sure you want to approve this submission and mark the job as complete?')) {
      return;
    }

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
    toast.info('Revision request feature coming soon!');
    setShowFeedbackModal(false);
  };

  const getStatusConfig = (status) => {
    const configs = {
      submitted: {
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        label: 'Submitted'
      },
      'under-review': {
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        label: 'Under Review'
      },
      approved: {
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        label: 'Approved'
      },
      rejected: {
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        label: 'Rejected'
      },
      'revision-requested': {
        color: 'text-purple-700',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        label: 'Revision Requested'
      }
    };
    return configs[status] || configs.submitted;
  };

  const filteredSubmissions = submissions
    .filter(sub => filter === 'all' || sub.status === filter)
    .filter(sub => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        sub.job?.title?.toLowerCase().includes(query) ||
        sub.worker?.email?.toLowerCase().includes(query) ||
        sub.description?.toLowerCase().includes(query)
      );
    });

  const statusCounts = {
    all: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    'under-review': submissions.filter(s => s.status === 'under-review').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    'revision-requested': submissions.filter(s => s.status === 'revision-requested').length,
  };

  const filterTabs = [
    { key: 'all', label: 'All', icon: FiFileText },
    { key: 'submitted', label: 'New', icon: FiClock },
    { key: 'under-review', label: 'Review', icon: FiAlertCircle },
    { key: 'approved', label: 'Approved', icon: FiCheckCircle },
    { key: 'revision-requested', label: 'Revisions', icon: FiRefreshCw }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Submissions</h1>
              <p className="text-gray-500 mt-1">Review and manage submitted work</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-2xl font-bold text-gray-900">{submissions.length}</span>
              <span className="text-sm text-gray-500">Total</span>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filterTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filter === key
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  filter === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {statusCounts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FiFileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : filter === 'all'
                ? 'No work has been submitted yet'
                : `No ${filter.split('-').join(' ')} submissions`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => {
              const statusConfig = getStatusConfig(submission.status);
              return (
                <div
                  key={submission._id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                >
                  {/* Submission Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                          {submission.job?.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <FiUser className="h-4 w-4" />
                            <span>{submission.worker?.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FiClock className="h-4 w-4" />
                            <span>
                              {new Date(submission.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} whitespace-nowrap`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Description */}
                    {submission.description && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {submission.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Links Section */}
                  {submission.links && submission.links.length > 0 && (
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <FiExternalLink className="h-4 w-4 text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-900">Links</h4>
                      </div>
                      <div className="space-y-2">
                        {submission.links.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group"
                          >
                            <FiExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                            <span className="truncate">{link}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Files Section */}
                  {submission.files && submission.files.length > 0 && (
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <FiImage className="h-4 w-4 text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-900">
                          Files ({submission.files.length})
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {submission.files.map((file, index) => (
                          <div key={index} className="group relative">
                            {isImageFile(file) ? (
                              <div className="relative">
                                <img
                                  src={getFullFileUrl(file.fileUrl)}
                                  alt={file.fileName}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-primary-500 transition-colors"
                                  onClick={() => setPreviewImage(getFullFileUrl(file.fileUrl))}
                                  onError={(e) => {
                                    e.target.parentElement.innerHTML = `
                                      <div class="w-full h-32 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
                                        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                        </svg>
                                        <p class="text-xs text-gray-500 mt-1">Failed to load</p>
                                      </div>
                                    `;
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all flex items-center justify-center pointer-events-none">
                                  <FiImage className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-gray-900 truncate">{file.fileName}</p>
                                  <a
                                    href={getFullFileUrl(file.fileUrl)}
                                    download
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mt-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <FiDownload className="h-3 w-3" />
                                    Download
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="h-32 bg-gray-50 rounded-lg border border-gray-200 p-3 flex flex-col items-center justify-center hover:border-gray-300 transition-colors">
                                <div className="p-2 bg-gray-200 rounded-lg mb-2">
                                  <FiFile className="h-6 w-6 text-gray-600" />
                                </div>
                                <p className="text-xs font-medium text-gray-900 text-center truncate w-full px-2 mb-2">
                                  {file.fileName}
                                </p>
                                <a
                                  href={getFullFileUrl(file.fileUrl)}
                                  download
                                  className="flex items-center gap-1 px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                                >
                                  <FiDownload className="h-3 w-3" />
                                  Download
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback Section */}
                  {submission.feedback && (
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FiAlertCircle className="h-4 w-4 text-amber-700" />
                          <h4 className="text-sm font-semibold text-amber-900">Feedback</h4>
                        </div>
                        <p className="text-sm text-amber-800">{submission.feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions Section */}
                  <div className="px-6 py-4">
                    {submission.status === 'submitted' && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="success"
                          icon={FiCheckCircle}
                          onClick={() => handleApprove(submission.job._id)}
                          loading={processing === submission.job._id}
                          disabled={processing !== null}
                          className="flex-1 justify-center"
                        >
                          Approve & Complete
                        </Button>
                        <Button
                          variant="secondary"
                          icon={FiRefreshCw}
                          onClick={() => handleRequestRevision(submission)}
                          disabled={processing !== null}
                          className="flex-1 justify-center"
                        >
                          Request Revision
                        </Button>
                      </div>
                    )}

                    {(submission.status === 'approved' || submission.job?.status === 'completed') && !submission.hasReview && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-emerald-900 mb-1 flex items-center gap-2">
                              <FiCheckCircle className="h-4 w-4" />
                              Job completed successfully
                            </p>
                            <p className="text-sm text-emerald-700">
                              Share your experience with this worker
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            icon={FiStar}
                            onClick={() => handleOpenReviewModal(submission)}
                            className="whitespace-nowrap"
                          >
                            Write Review
                          </Button>
                        </div>
                      </div>
                    )}

                    {submission.hasReview && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                          <FiCheckCircle className="h-4 w-4" />
                          Review submitted for this job
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Revision</h2>
            <form onSubmit={submitRevisionRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback for Worker
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Explain what needs to be revised..."
                  rows="6"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
