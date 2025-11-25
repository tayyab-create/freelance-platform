import React, { useEffect, useState } from 'react';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { FiCheckCircle, FiX, FiRefreshCw, FiDownload, FiExternalLink, FiFile, FiStar, FiFileText, FiClock, FiAlertCircle, FiUser, FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReviewModal from '../../components/company/ReviewModal';
import { PageHeader, SkeletonLoader, EmptyState, StatusBadge, Modal, ConfirmModal } from '../../components/shared';

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

  // Helper function to check if file is an image
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

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300',
      'under-review': 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300',
      approved: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300',
      rejected: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300',
      'revision-requested': 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-300',
    };
    return colors[status] || 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300';
  };

  const filteredSubmissions = filter === 'all'
    ? submissions
    : submissions.filter(sub => sub.status === filter);

  // Count submissions by status
  const counts = {
    all: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    'under-review': submissions.filter(s => s.status === 'under-review').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    'revision-requested': submissions.filter(s => s.status === 'revision-requested').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Submitted Work</h1>
            <p className="text-gray-600 mt-2 text-lg">Review and approve work submitted by freelancers</p>
          </div>
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-3 rounded-2xl shadow-lg">
            <p className="text-white font-bold text-lg">{submissions.length} Submissions</p>
          </div>
        </div>

        {/* Filter Tabs - Premium */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6">
          <div className="flex gap-3 overflow-x-auto">
            {[
              { key: 'all', label: 'All', icon: FiFileText },
              { key: 'submitted', label: 'Submitted', icon: FiClock },
              { key: 'under-review', label: 'Under Review', icon: FiAlertCircle },
              { key: 'approved', label: 'Approved', icon: FiCheckCircle },
              { key: 'revision-requested', label: 'Revision Requested', icon: FiRefreshCw }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${filter === key
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30 scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${filter === key ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        {loading ? (
          <SkeletonLoader type="card" count={4} />
        ) : filteredSubmissions.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                  <FiFileText className="h-10 w-10 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Submissions Found</h3>
              <p className="text-gray-600">
                {filter === 'all'
                  ? "No work has been submitted yet"
                  : `No ${filter.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} submissions`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission._id}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-8 hover:shadow-2xl transition-all duration-300"
              >
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{submission.job?.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiUser className="h-4 w-4" />
                        <span className="font-semibold">{submission.worker?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiClock className="h-4 w-4" />
                        <span>
                          {new Date(submission.createdAt).toLocaleDateString()} at{' '}
                          {new Date(submission.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-5 py-2.5 text-sm font-bold rounded-xl border-2 shadow-sm ${getStatusColor(submission.status)} uppercase whitespace-nowrap`}>
                    {submission.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>

                {/* Description */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FiFileText className="h-5 w-5 text-blue-600" />
                    <h4 className="font-bold text-gray-900 text-lg">Work Description:</h4>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{submission.description}</p>
                </div>

                {/* Links */}
                {submission.links && submission.links.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FiExternalLink className="h-5 w-5 text-primary-600" />
                      <h4 className="font-bold text-gray-900">Links:</h4>
                    </div>
                    <div className="space-y-3">
                      {submission.links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold rounded-xl hover:shadow-md transition-all border border-purple-200"
                        >
                          <FiExternalLink className="h-5 w-5" />
                          <span className="truncate">{link}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files with Image Thumbnails */}
                {submission.files && submission.files.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FiImage className="h-5 w-5 text-primary-600" />
                      <h4 className="font-bold text-gray-900">Attached Files ({submission.files.length}):</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {submission.files.map((file, index) => (
                        <div key={index} className="group relative">
                          {isImageFile(file) ? (
                            /* Image Thumbnail */
                            <div className="relative">
                              <img
                                src={file.fileUrl}
                                alt={file.fileName}
                                className="w-full h-40 object-cover rounded-2xl border-2 border-blue-200 shadow-md cursor-pointer hover:shadow-xl hover:border-blue-400 transition-all"
                                onClick={() => setPreviewImage(file.fileUrl)}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-2xl transition-all flex items-center justify-center pointer-events-none">
                                <FiImage className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="mt-2 px-2">
                                <p className="text-xs font-semibold text-gray-900 truncate">{file.fileName}</p>
                                <a
                                  href={file.fileUrl}
                                  download
                                  className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 mt-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FiDownload className="h-3 w-3" />
                                  Download
                                </a>
                              </div>
                            </div>
                          ) : (
                            /* Non-Image File */
                            <div className="h-40 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-4 flex flex-col items-center justify-center hover:shadow-lg transition-all">
                              <div className="p-4 bg-blue-500 rounded-xl mb-3">
                                <FiFile className="h-10 w-10 text-white" />
                              </div>
                              <p className="text-xs font-semibold text-gray-900 text-center truncate w-full px-2 mb-2">{file.fileName}</p>
                              <a
                                href={file.fileUrl}
                                download
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-all"
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

                {/* Feedback */}
                {submission.feedback && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <FiAlertCircle className="h-5 w-5 text-yellow-700" />
                      <h4 className="font-bold text-yellow-800 text-lg">Feedback:</h4>
                    </div>
                    <p className="text-yellow-800 font-semibold">{submission.feedback}</p>
                  </div>
                )}

                {/* Actions for Submitted Status */}
                {submission.status === 'submitted' && (
                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <Button
                      variant="success"
                      icon={FiCheckCircle}
                      onClick={() => handleApprove(submission.job._id)}
                      loading={processing === submission.job._id}
                      disabled={processing !== null}
                      className="flex-1 text-lg py-4"
                    >
                      Approve & Complete
                    </Button>
                    <Button
                      variant="secondary"
                      icon={FiRefreshCw}
                      onClick={() => handleRequestRevision(submission)}
                      disabled={processing !== null}
                      className="flex-1 text-lg py-4"
                    >
                      Request Revision
                    </Button>
                  </div>
                )}

                {/* Review Button for Approved/Completed Jobs */}
                {(submission.status === 'approved' || submission.job?.status === 'completed') && !submission.hasReview && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-green-800 mb-2 text-lg flex items-center gap-2">
                          <FiCheckCircle className="h-6 w-6" />
                          Job completed successfully!
                        </p>
                        <p className="text-green-700">
                          Would you like to review this worker's performance?
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        icon={FiStar}
                        onClick={() => handleOpenReviewModal(submission)}
                        className="px-6 py-3 text-lg whitespace-nowrap"
                      >
                        Write a Review
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show if Review Already Submitted */}
                {submission.hasReview && (
                  <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl">
                    <p className="text-blue-800 font-semibold flex items-center gap-2">
                      <FiCheckCircle className="h-5 w-5" />
                      ✓ Review submitted for this job
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            >
              <FiX className="h-6 w-6" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Feedback Modal - Premium */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl transform animate-slide-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-1 bg-gradient-to-b from-orange-500 to-red-700 rounded-full"></div>
              <h2 className="text-3xl font-black text-gray-900">Request Revision</h2>
            </div>
            <form onSubmit={submitRevisionRequest} className="space-y-6">
              <div>
                <label className="label text-base">Feedback for Worker *</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Explain what needs to be revised..."
                  rows="7"
                  required
                  className="input-field text-base"
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="primary" className="flex-1 text-lg py-4">
                  Send Revision Request
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 text-lg py-4"
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