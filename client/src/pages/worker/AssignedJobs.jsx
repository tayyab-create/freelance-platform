import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workerAPI, uploadAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { FiDollarSign, FiClock, FiBriefcase, FiUpload, FiFile, FiX, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PageHeader, EmptyState, SkeletonLoader, StatusBadge } from '../../components/shared';
import { useNavigate } from 'react-router-dom';

const AssignedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [submitData, setSubmitData] = useState({
    description: '',
    links: '',
    uploadedFiles: [],
  });

  useEffect(() => {
    fetchAssignedJobs();
  }, []);

  const fetchAssignedJobs = async () => {
    try {
      const response = await workerAPI.getAssignedJobs();
      setJobs(response.data.data);
    } catch (error) {
      toast.error('Failed to load assigned jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmitModal = (job) => {
    setSelectedJob(job);
    setShowSubmitModal(true);
    setSubmitData({ description: '', links: '', uploadedFiles: [] });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadPromises = files.map(file => uploadAPI.uploadSingle(file, 'submissions'));
      const responses = await Promise.all(uploadPromises);

      const newFiles = responses.map(res => ({
        fileName: res.data.data.originalName,
        fileUrl: `http://localhost:5000${res.data.data.fileUrl}`,
        fileType: res.data.data.mimeType,
      }));

      setSubmitData(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...newFiles],
      }));

      toast.success('Files uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleRemoveFile = (index) => {
    setSubmitData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submitData.description || submitData.description.length < 20) {
      toast.error('Description must be at least 20 characters');
      return;
    }

    setSubmitting(true);
    try {
      const links = submitData.links
        .split('\n')
        .map(link => link.trim())
        .filter(link => link);

      await workerAPI.submitWork(selectedJob._id, {
        description: submitData.description,
        links,
        files: submitData.uploadedFiles,
      });

      toast.success('Work submitted successfully!');
      setShowSubmitModal(false);
      fetchAssignedJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit work');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if deadline is approaching (within 3 days)
  const isDeadlineApproaching = (deadline) => {
    if (!deadline) return false;
    const daysUntilDeadline = (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntilDeadline <= 3 && daysUntilDeadline > 0;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <PageHeader
              title="Assigned Jobs"
              subtitle="Manage your active projects"
              breadcrumbs={[
                { label: 'Dashboard', href: '/worker/dashboard' },
                { label: 'Assigned Jobs' }
              ]}
            />
            <p className="text-gray-600 mt-2 text-lg">Jobs you're currently working on</p>
          </div>
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-3 rounded-2xl shadow-lg">
            <p className="text-white font-bold text-lg">{jobs.length} Active Jobs</p>
          </div>
        </div>

        {loading ? (
          <SkeletonLoader type="card" count={4} />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={FiBriefcase}
            title="No assigned jobs"
            description="You don't have any assigned jobs at the moment."
            actionLabel="View Applications"
            onAction={() => navigate('/worker/applications')}
          />
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-8 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                  <div className="flex-1 w-full">
                    {/* Job Title */}
                    <h3 className="text-3xl font-black text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-gray-700 mb-6 line-clamp-2 leading-relaxed text-lg">{job.description}</p>

                    {/* Job Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-200">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                          <FiDollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold uppercase">Payment</p>
                          <p className="text-xl font-black text-gray-900">${job.salary}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border-2 border-blue-200">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                          <FiClock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold uppercase">Duration</p>
                          <p className="text-lg font-bold text-gray-900">{job.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-200">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                          <FiBriefcase className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold uppercase">Assigned</p>
                          <p className="text-sm font-bold text-gray-900">{new Date(job.assignedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Deadline Warning */}
                    {job.deadline && (
                      <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 ${isDeadlineApproaching(job.deadline)
                        ? 'bg-gradient-to-r from-red-100 to-orange-100 border-red-300'
                        : 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300'
                        }`}>
                        <div className={`p-2 rounded-lg ${isDeadlineApproaching(job.deadline)
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                          }`}>
                          {isDeadlineApproaching(job.deadline) ? (
                            <FiAlertCircle className="h-5 w-5 text-white" />
                          ) : (
                            <FiCalendar className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold uppercase">Deadline</p>
                          <p className={`text-lg font-bold ${isDeadlineApproaching(job.deadline) ? 'text-red-800' : 'text-yellow-800'
                            }`}>
                            {new Date(job.deadline).toLocaleDateString()}
                            {isDeadlineApproaching(job.deadline) && (
                              <span className="ml-2 text-sm">⚠️ Approaching!</span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Section */}
                  <div className="flex flex-col gap-3">
                    <StatusBadge status="warning" size="sm" />
                    {job.status === 'assigned' && (
                      <Button
                        variant="primary"
                        icon={FiUpload}
                        onClick={() => handleOpenSubmitModal(job)}
                        className="px-6 py-4 text-lg shadow-lg hover:shadow-xl"
                      >
                        Submit Work
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Work Modal - Premium */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl transform animate-slide-up">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-1 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                <h2 className="text-3xl font-black text-gray-900">Submit Your Work</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Description */}
                <div>
                  <label className="label text-base">Work Description *</label>
                  <textarea
                    value={submitData.description}
                    onChange={(e) => setSubmitData({ ...submitData, description: e.target.value })}
                    placeholder="Describe what you've completed and any important details..."
                    rows="7"
                    required
                    className="input-field text-base"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className={`text-sm font-semibold ${submitData.description.length >= 20 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                      {submitData.description.length >= 20 ? '✓ Ready' : `${submitData.description.length} / 20 minimum`}
                    </p>
                  </div>
                </div>

                {/* Links */}
                <div>
                  <label className="label text-base">Links (one per line)</label>
                  <textarea
                    value={submitData.links}
                    onChange={(e) => setSubmitData({ ...submitData, links: e.target.value })}
                    placeholder="https://github.com/yourrepo\nhttps://demo.yourproject.com"
                    rows="4"
                    className="input-field text-base"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    🔗 Add links to your work (GitHub, live demo, drive, etc.)
                  </p>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="label text-base">Upload Files</label>
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="input-field"
                      disabled={uploadingFiles}
                      accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    📎 Upload documents, images, or zip files (Max 5MB each)
                  </p>
                  {uploadingFiles && (
                    <p className="text-sm text-primary-600 mt-2 font-semibold">Uploading files...</p>
                  )}
                </div>

                {/* Uploaded Files List */}
                {submitData.uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <label className="label text-base">Uploaded Files ({submitData.uploadedFiles.length})</label>
                    <div className="space-y-2">
                      {submitData.uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <FiFile className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900">{file.fileName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                            title="Remove file"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    disabled={submitting || uploadingFiles}
                    className="flex-1 text-lg py-4"
                  >
                    Submit Work
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowSubmitModal(false)}
                    disabled={submitting}
                    className="flex-1 text-lg py-4"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignedJobs;