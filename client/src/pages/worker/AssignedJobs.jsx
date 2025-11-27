import React, { useEffect, useState } from 'react';
import { workerAPI, uploadAPI, messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiBriefcase, FiClock, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PageHeader, EmptyState, SkeletonLoader } from '../../components/shared';
import { useNavigate } from 'react-router-dom';

import AdvancedFilterBar from '../../components/shared/AdvancedFilterBar';
import JobCard from '../../components/worker/assigned-jobs/JobCard';
import JobDetailsModal from '../../components/worker/assigned-jobs/JobDetailsModal';
import SubmitWorkModal from '../../components/worker/assigned-jobs/SubmitWorkModal';
import ReviewCompanyModal from '../../components/worker/assigned-jobs/ReviewCompanyModal';

const AssignedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: [],
    company: '',
    level: '',
    budgetMin: '',
    budgetMax: '',
    deadlineStart: null,
    deadlineEnd: null
  });

  // API base URL for file uploads
  const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
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
    // Search
    const matchesSearch = !filters.search ||
      job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.companyInfo?.companyName?.toLowerCase().includes(filters.search.toLowerCase());

    // Status (Multi-select)
    const matchesStatus = filters.status.length === 0 || filters.status.includes(job.status);

    // Company
    const matchesCompany = !filters.company ||
      job.companyInfo?.companyName?.toLowerCase().includes(filters.company.toLowerCase());

    // Level
    const matchesLevel = !filters.level ||
      job.experienceLevel?.toLowerCase() === filters.level.toLowerCase();

    // Budget
    const matchesBudgetMin = !filters.budgetMin || job.salary >= Number(filters.budgetMin);
    const matchesBudgetMax = !filters.budgetMax || job.salary <= Number(filters.budgetMax);

    // Deadline
    const jobDeadline = job.deadline ? new Date(job.deadline) : null;
    const matchesDeadlineStart = !filters.deadlineStart || (jobDeadline && jobDeadline >= new Date(filters.deadlineStart));
    const matchesDeadlineEnd = !filters.deadlineEnd || (jobDeadline && jobDeadline <= new Date(filters.deadlineEnd));

    return matchesSearch && matchesStatus && matchesCompany && matchesLevel && matchesBudgetMin && matchesBudgetMax && matchesDeadlineStart && matchesDeadlineEnd;
  });

  const counts = {
    all: jobs.length,
    assigned: jobs.filter(j => j.status === 'assigned').length,
    'in-progress': jobs.filter(j => j.status === 'in-progress').length,
    'revision-requested': jobs.filter(j => j.status === 'revision-requested').length,
    submitted: jobs.filter(j => j.status === 'submitted').length,
    completed: jobs.filter(j => j.status === 'completed').length
  };

  const statusOptions = [
    { value: 'assigned', label: 'Assigned', count: counts.assigned },
    { value: 'in-progress', label: 'In Progress', count: counts['in-progress'] },
    { value: 'revision-requested', label: 'Revisions', count: counts['revision-requested'] },
    { value: 'submitted', label: 'Submitted', count: counts.submitted },
    { value: 'completed', label: 'Completed', count: counts.completed },
  ];

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

  const handleOpenReviewModal = (job) => {
    setSelectedJob(job);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
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
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-gray-700 font-bold">
                  {jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length} Active
                </p>
              </div>
              <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2 rounded-xl shadow-lg shadow-primary-500/30">
                <p className="text-white font-bold">
                  {jobs.length} Total
                </p>
              </div>
            </div>
          }
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FiBriefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Jobs</p>
                <p className="text-2xl font-black text-gray-900">{counts.all}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <FiClock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active</p>
                <p className="text-2xl font-black text-gray-900">
                  {counts.assigned + counts['in-progress'] + counts['revision-requested'] + counts.submitted}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <FiCheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-black text-gray-900">{counts.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilterBar
          onFilterChange={setFilters}
          statusOptions={statusOptions}
          searchPlaceholder="Search jobs by title or company..."
        />

        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            icon={FiBriefcase}
            title={filters.search ? "No matching jobs found" : "No jobs found"}
            description={filters.search ? "Try adjusting your search terms or filters." : "You don't have any jobs matching the current filters."}
            actionLabel={!filters.search ? "View Applications" : "Clear Filters"}
            onAction={() => !filters.search ? navigate('/worker/applications') : setFilters({
              search: '',
              status: [],
              company: '',
              level: '',
              budgetMin: '',
              budgetMax: '',
              deadlineStart: null,
              deadlineEnd: null
            })}
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
          handleOpenReviewModal={handleOpenReviewModal}
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

        {/* Review Company Modal */}
        <ReviewCompanyModal
          isOpen={showReviewModal}
          onClose={handleCloseReviewModal}
          job={selectedJob}
          onReviewSubmit={() => {
            // Optionally refresh jobs or show success
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default AssignedJobs;