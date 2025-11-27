import React, { useEffect, useState } from 'react';
import { workerAPI, uploadAPI, messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiBriefcase } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PageHeader, EmptyState, SkeletonLoader } from '../../components/shared';
import { useNavigate } from 'react-router-dom';

// Import new modular components
import JobFilters from '../../components/worker/assigned-jobs/JobFilters';
import JobCard from '../../components/worker/assigned-jobs/JobCard';
import JobDetailsModal from '../../components/worker/assigned-jobs/JobDetailsModal';
import SubmitWorkModal from '../../components/worker/assigned-jobs/SubmitWorkModal';

const AssignedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // API base URL for file uploads
  const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    'revision-requested': jobs.filter(j => j.status === 'revision-requested').length,
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

  const handleViewDetails = async (job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);

    // If job is submitted, revision-requested, or completed, fetch submission details
    if (job.status === 'submitted' || job.status === 'revision-requested' || job.status === 'completed') {
      setLoadingSubmission(true);
      try {
        const response = await workerAPI.getSubmission(job._id);
        setSubmissionDetails(response.data.data);
      } catch (error) {
        toast.error('Failed to load submission details');
      } finally {
        setLoadingSubmission(false);
      }
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setTimeout(() => {
      setSelectedJob(null);
      setSubmissionDetails(null);
    }, 300);
  };

  const handleFileUpload = async (filesInput) => {
    // Handle both array of files (from FileUpload) and event object (legacy)
    let files;
    if (Array.isArray(filesInput)) {
      files = filesInput;
    } else if (filesInput?.target?.files) {
      files = Array.from(filesInput.target.files);
    } else {
      console.error('Invalid file input:', filesInput);
      return;
    }

    if (files.length === 0) return;

    setUploadingFiles(true);
    setUploadProgress(0);

    try {
      let completedUploads = 0;
      const totalFiles = files.length;

      const uploadPromises = files.map(async (file) => {
        const response = await uploadAPI.uploadSingle(
          file,
          'submissions',
          (progress) => {
            // Update overall progress based on individual file progress
            const overallProgress = Math.round(
              ((completedUploads + (progress / 100)) / totalFiles) * 100
            );
            setUploadProgress(overallProgress);
          }
        );
        completedUploads++;
        return response;
      });

      const responses = await Promise.all(uploadPromises);

      const newFiles = responses.map(res => ({
        fileName: res.data.data.originalName,
        fileUrl: `${API_BASE_URL}${res.data.data.fileUrl}`,
        fileType: res.data.data.mimeType,
      }));

      setSubmitData(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...newFiles],
      }));

      toast.success(`${newFiles.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('File upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload files';
      toast.error(errorMessage);
    } finally {
      setUploadingFiles(false);
      setUploadProgress(0);
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

  const handleStartJob = async (job, e) => {
    if (e) e.stopPropagation();

    try {
      await workerAPI.startJob(job._id);
      toast.success('Job started! Status updated to In Progress.');
      fetchAssignedJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start job');
    }
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
              <p className="text-gray-700 font-bold">
                {jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length} Active
              </p>
            </div>
          }
        />

        {/* Search & Filter Bar */}
        <JobFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filter={filter}
          setFilter={setFilter}
          counts={counts}
        />

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
              <JobCard
                key={job._id}
                job={job}
                handleViewDetails={handleViewDetails}
                handleStartConversation={handleStartConversation}
                handleStartJob={handleStartJob}
                handleOpenSubmitModal={handleOpenSubmitModal}
                isDeadlineApproaching={isDeadlineApproaching}
              />
            ))}
          </div>
        )}

        {/* Job Details Modal */}
        <JobDetailsModal
          isOpen={showDetailsModal}
          onClose={handleCloseDetailsModal}
          selectedJob={selectedJob}
          handleStartConversation={handleStartConversation}
          handleStartJob={handleStartJob}
          handleOpenSubmitModal={handleOpenSubmitModal}
          loadingSubmission={loadingSubmission}
          submissionDetails={submissionDetails}
          isDeadlineApproaching={isDeadlineApproaching}
        />

        {/* Submit Work Modal */}
        <SubmitWorkModal
          isOpen={showSubmitModal}
          onClose={handleCloseSubmitModal}
          handleSubmit={handleSubmit}
          submitData={submitData}
          setSubmitData={setSubmitData}
          handleFileUpload={handleFileUpload}
          handleRemoveFile={handleRemoveFile}
          submitting={submitting}
          uploadingFiles={uploadingFiles}
          uploadProgress={uploadProgress}
        />
      </div>
    </DashboardLayout>
  );
};

export default AssignedJobs;  