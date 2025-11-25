import React, { useEffect, useState } from 'react';
import { workerAPI, uploadAPI, messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiDollarSign, FiClock, FiBriefcase, FiUpload, FiFile, FiX, FiCalendar, FiAlertCircle, FiMessageCircle, FiCheckCircle, FiMoreVertical, FiFilter, FiAward, FiTag, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PageHeader, EmptyState, SkeletonLoader, Modal, StatusBadge } from '../../components/shared';
import { useNavigate } from 'react-router-dom';

const AssignedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Submission State
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

  // Filter Logic
  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filter === 'all' || job.status === filter;
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyInfo?.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: jobs.length,
    assigned: jobs.filter(j => j.status === 'assigned').length,
    'in-progress': jobs.filter(j => j.status === 'in-progress').length,
    submitted: jobs.filter(j => j.status === 'submitted').length,
    completed: jobs.filter(j => j.status === 'completed').length
  };

  // Handlers
  const handleOpenSubmitModal = (job, e) => {
    if (e) e.stopPropagation();
    setSelectedJob(job);
    setShowSubmitModal(true);
    setSubmitData({ description: '', links: '', uploadedFiles: [] });
  };

  const handleCloseSubmitModal = () => {
    setShowSubmitModal(false);
    if (!showDetailsModal) {
      setTimeout(() => setSelectedJob(null), 300);
    }
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
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
      if (showDetailsModal) handleCloseDetailsModal(); // Close details if open
      fetchAssignedJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit work');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartConversation = async (job, e) => {
    if (e) e.stopPropagation();
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
          subtitle="Manage your active projects"
          breadcrumbs={[
            { label: 'Dashboard', href: '/worker/dashboard' },
            { label: 'Assigned Jobs' }
          ]}
          actions={
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-gray-700 font-bold">{jobs.length} Active</p>
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
              placeholder="Search jobs by title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all shadow-sm"
            />
          </div>

          {/* Filter Tabs */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-1.5 overflow-x-auto w-full md:w-auto">
            <div className="flex gap-1 min-w-max">
              {[
                { key: 'all', label: 'All Jobs' },
                { key: 'assigned', label: 'Assigned' },
                { key: 'in-progress', label: 'In Progress' },
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
                    {counts[tab.key] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            icon={FiBriefcase}
            title={searchQuery ? "No matching jobs found" : (filter === 'all' ? "No assigned jobs" : `No ${filter} jobs`)}
            description={searchQuery ? "Try adjusting your search terms." : "You don't have any jobs in this category at the moment."}
            actionLabel={!searchQuery ? "View Applications" : "Clear Search"}
            onAction={() => !searchQuery ? navigate('/worker/applications') : setSearchQuery('')}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                onClick={() => handleViewDetails(job)}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden cursor-pointer"
              >
                {/* Deadline Indicator Strip */}
                {isDeadlineApproaching(job.deadline) && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Company Logo */}
                  <div className="flex-shrink-0">
                    {job.companyInfo?.logo ? (
                      <img
                        src={job.companyInfo.logo}
                        alt={job.companyInfo.companyName}
                        className="h-14 w-14 rounded-xl object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                        <FiBriefcase className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Middle: Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {job.title}
                      </h3>
                      <StatusBadge status={job.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-4">
                      <span className="font-medium text-gray-900">{job.companyInfo?.companyName || 'Confidential Client'}</span>
                      <span className="text-gray-300 hidden md:inline">•</span>
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="h-4 w-4" />
                        <span>Assigned {new Date(job.assignedDate).toLocaleDateString()}</span>
                      </div>
                      <span className="text-gray-300 hidden md:inline">•</span>
                      <div className="flex items-center gap-1.5">
                        <FiDollarSign className="h-4 w-4" />
                        <span className="font-medium text-gray-900">${job.salary}</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md uppercase">{job.salaryType}</span>
                      </div>
                    </div>

                    {/* Deadline Warning Inline */}
                    {isDeadlineApproaching(job.deadline) && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium mb-4">
                        <FiAlertCircle className="h-4 w-4" />
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    )}

                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                      {job.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={(e) => handleStartConversation(job, e)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
                      >
                        <FiMessageCircle className="h-4 w-4" />
                        Message Company
                      </button>

                      {job.status === 'assigned' || job.status === 'in-progress' ? (
                        <button
                          onClick={(e) => handleOpenSubmitModal(job, e)}
                          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all"
                        >
                          <FiUpload className="h-4 w-4" />
                          Submit Work
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={handleCloseDetailsModal}
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
                    onClick={handleCloseDetailsModal}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  {(selectedJob.status === 'assigned' || selectedJob.status === 'in-progress') && (
                    <button
                      onClick={() => handleOpenSubmitModal(selectedJob)}
                      className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2"
                    >
                      <FiUpload className="h-5 w-5" />
                      Submit Work
                    </button>
                  )}
                </div>
              </div>
            )
          }
        >
          {selectedJob && (
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
                  <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{selectedJob.title}</h2>
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
                <div className={`p-4 rounded-2xl border ${isDeadlineApproaching(selectedJob.deadline) ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isDeadlineApproaching(selectedJob.deadline) ? 'text-red-600' : 'text-gray-500'}`}>
                    <FiCalendar className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Deadline</span>
                  </div>
                  <p className={`text-lg font-bold ${isDeadlineApproaching(selectedJob.deadline) ? 'text-red-700' : 'text-gray-900'}`}>
                    {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : 'None'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FiFile className="h-5 w-5 text-gray-400" />
                  Job Description
                </h3>
                <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <p className="whitespace-pre-line leading-relaxed">{selectedJob.description}</p>
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
            </div>
          )}
        </Modal>

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