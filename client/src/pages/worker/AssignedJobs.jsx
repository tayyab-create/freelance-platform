import React, { useEffect, useState } from 'react';
import { workerAPI, uploadAPI, messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiDollarSign, FiClock, FiBriefcase, FiUpload, FiFile, FiX, FiCalendar, FiAlertCircle, FiMessageCircle, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PageHeader, EmptyState, SkeletonLoader, Modal, JobMetaItem, StatusBadge } from '../../components/shared';
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

  const handleCloseSubmitModal = () => {
    setShowSubmitModal(false);
    setTimeout(() => setSelectedJob(null), 300);
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
      handleCloseSubmitModal();
      fetchAssignedJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit work');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartConversation = async (job) => {
    // Determine company ID
    const companyId = job.companyInfo?._id || job.company?._id || job.company;

    if (!companyId) {
      toast.error('Company information not available.');
      return;
    }

    try {
      const response = await messageAPI.getOrCreateConversation({
        otherUserId: companyId,
        jobId: job._id
      });
      navigate(`/messages/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start conversation.');
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
        <PageHeader
          title="Assigned Jobs"
          subtitle="Manage your active projects and submissions"
          breadcrumbs={[
            { label: 'Dashboard', href: '/worker/dashboard' },
            { label: 'Assigned Jobs' }
          ]}
          actions={
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-3 rounded-2xl shadow-lg">
              <p className="text-white font-bold text-lg">{jobs.length} Active Jobs</p>
            </div>
          }
        />

        {loading ? (
          <SkeletonLoader type="card" count={3} />
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
                className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                {/* Card Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {job.companyInfo?.logo ? (
                        <img
                          src={job.companyInfo.logo}
                          alt={job.companyInfo.companyName}
                          className="h-16 w-16 rounded-2xl object-cover border border-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                          <FiBriefcase className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <span>{job.companyInfo?.companyName || 'Confidential Client'}</span>
                        {job.companyInfo?.tagline && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-sm text-gray-400">{job.companyInfo.tagline}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isDeadlineApproaching(job.deadline) && (
                      <div className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100 animate-pulse">
                        <FiAlertCircle className="h-4 w-4" />
                        Deadline Approaching
                      </div>
                    )}
                    <StatusBadge status={job.status} />
                  </div>
                </div>

                {/* Job Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <JobMetaItem
                    icon={FiDollarSign}
                    label="Budget"
                    value={`$${job.salary}`}
                    subValue={job.salaryType}
                    color="green"
                  />
                  <JobMetaItem
                    icon={FiClock}
                    label="Duration"
                    value={job.duration || 'N/A'}
                    color="blue"
                  />
                  <JobMetaItem
                    icon={FiCalendar}
                    label="Deadline"
                    value={job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No Deadline'}
                    color={isDeadlineApproaching(job.deadline) ? 'red' : 'orange'}
                  />
                  <JobMetaItem
                    icon={FiCheckCircle}
                    label="Assigned"
                    value={new Date(job.assignedDate).toLocaleDateString()}
                    color="purple"
                  />
                </div>

                {/* Description & Actions */}
                <div className="flex flex-col lg:flex-row gap-6 items-end">
                  <div className="flex-1 w-full">
                    <p className="text-gray-600 leading-relaxed line-clamp-2 mb-2">{job.description}</p>
                    <button className="text-primary-600 font-bold text-sm hover:underline">View Full Details</button>
                  </div>
                  <div className="flex gap-3 w-full lg:w-auto">
                    <button
                      onClick={() => handleStartConversation(job)}
                      className="flex-1 lg:flex-none px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <FiMessageCircle className="h-5 w-5" />
                      Message
                    </button>
                    {job.status === 'assigned' || job.status === 'in-progress' ? (
                      <button
                        onClick={() => handleOpenSubmitModal(job)}
                        className="flex-1 lg:flex-none px-8 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
                      >
                        <FiUpload className="h-5 w-5" />
                        Submit Work
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Work Modal */}
        <Modal
          isOpen={showSubmitModal}
          onClose={handleCloseSubmitModal}
          title="Submit Your Work"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Work Description *</label>
              <textarea
                value={submitData.description}
                onChange={(e) => setSubmitData({ ...submitData, description: e.target.value })}
                placeholder="Describe what you've completed and any important details..."
                rows="6"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className={`text-xs font-bold ${submitData.description.length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
                  {submitData.description.length >= 20 ? '✓ Ready to submit' : `${submitData.description.length} / 20 characters minimum`}
                </p>
              </div>
            </div>

            {/* Links */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Links (Optional)</label>
              <textarea
                value={submitData.links}
                onChange={(e) => setSubmitData({ ...submitData, links: e.target.value })}
                placeholder="https://github.com/yourrepo&#10;https://demo.yourproject.com"
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Add links to your work (GitHub, live demo, drive, etc.). One per line.
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Attachments</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-400 transition-colors bg-gray-50/50">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={uploadingFiles}
                  accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <FiUpload className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Click to upload files</span>
                  <span className="text-xs text-gray-400">PDF, DOC, ZIP, Images (Max 5MB)</span>
                </label>
              </div>

              {uploadingFiles && (
                <div className="mt-3 flex items-center gap-2 text-sm text-primary-600 font-medium animate-pulse">
                  <div className="h-2 w-2 bg-primary-600 rounded-full animate-bounce"></div>
                  Uploading files...
                </div>
              )}
            </div>

            {/* Uploaded Files List */}
            {submitData.uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded Files ({submitData.uploadedFiles.length})</label>
                <div className="space-y-2">
                  {submitData.uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <FiFile className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 truncate max-w-[200px]">{file.fileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove file"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCloseSubmitModal}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingFiles}
                className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="h-5 w-5" />
                    Submit Work
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AssignedJobs;