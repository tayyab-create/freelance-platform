import React, { useEffect, useState } from 'react';
import { workerAPI, messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiBriefcase, FiClock, FiCheckCircle, FiX, FiAlertCircle, FiFileText, FiAward, FiDollarSign, FiMessageCircle, FiPaperclip, FiFile } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PageHeader, EmptyState, SkeletonLoader, Modal, StatusBadge } from '../../components/shared';
import ApplicationCard from '../../components/shared/ApplicationCard';
import { useNavigate } from 'react-router-dom';
import AdvancedFilterBar from '../../components/shared/AdvancedFilterBar';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
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
  const [deletedCount, setDeletedCount] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await workerAPI.getMyApplications();
      setApplications(response.data.data);
      if (response.data.deletedCount) {
        setDeletedCount(response.data.deletedCount);
      }
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedApplication(null), 300); // Clear after animation
  };

  const handleStartConversation = async (application) => {
    if (!application?.job?.companyInfo?._id) {
      const companyId = application?.job?.company?._id;
      if (!companyId) {
        toast.error('Company information not available.');
        return;
      }

      try {
        const response = await messageAPI.getOrCreateConversation({
          otherUserId: companyId,
          jobId: application.job._id
        });
        toast.success('Opening conversation...');
        closeModal();
        navigate(`/messages/${response.data.data._id}`);
        return;
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to start conversation.');
        return;
      }
    }

    try {
      const response = await messageAPI.getOrCreateConversation({
        otherUserId: application.job.company._id,
        jobId: application.job._id
      });
      toast.success('Opening conversation...');
      closeModal();
      navigate(`/messages/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start conversation.');
    }
  };

  const filteredApplications = applications.filter(app => {
    // Search
    const matchesSearch = !filters.search ||
      app.job?.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.job?.companyInfo?.companyName?.toLowerCase().includes(filters.search.toLowerCase());

    // Status (Multi-select)
    const matchesStatus = filters.status.length === 0 || filters.status.includes(app.status);

    // Company
    const matchesCompany = !filters.company ||
      app.job?.companyInfo?.companyName?.toLowerCase().includes(filters.company.toLowerCase());

    // Level
    const matchesLevel = !filters.level ||
      app.job?.experienceLevel?.toLowerCase() === filters.level.toLowerCase();

    // Budget
    const matchesBudgetMin = !filters.budgetMin || app.job?.salary >= Number(filters.budgetMin);
    const matchesBudgetMax = !filters.budgetMax || app.job?.salary <= Number(filters.budgetMax);

    // Deadline
    const jobDeadline = app.job?.deadline ? new Date(app.job.deadline) : null;
    const matchesDeadlineStart = !filters.deadlineStart || (jobDeadline && jobDeadline >= new Date(filters.deadlineStart));
    const matchesDeadlineEnd = !filters.deadlineEnd || (jobDeadline && jobDeadline <= new Date(filters.deadlineEnd));

    return matchesSearch && matchesStatus && matchesCompany && matchesLevel && matchesBudgetMin && matchesBudgetMax && matchesDeadlineStart && matchesDeadlineEnd;
  });

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', count: counts.pending },
    { value: 'accepted', label: 'Accepted', count: counts.accepted },
    { value: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <PageHeader
          title="My Applications"
          subtitle="Track all your job applications"
          breadcrumbs={[
            { label: 'Dashboard', href: '/worker/dashboard' },
            { label: 'Applications' }
          ]}
          actions={
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-3 rounded-2xl shadow-lg">
              <p className="text-white font-bold text-lg">{applications.length} Total</p>
            </div>
          }
        />

        {/* Deleted Jobs Notification */}
        {deletedCount > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <span className="font-bold">{deletedCount} application(s)</span> were removed because the job postings were deleted by the admin or company.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDeletedCount(0)}
              className="ml-auto pl-3 text-red-500 hover:text-red-700 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Simple Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FiBriefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total</p>
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
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-black text-gray-900">{counts.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <FiCheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Accepted</p>
                <p className="text-2xl font-black text-gray-900">{counts.accepted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilterBar
          onFilterChange={setFilters}
          statusOptions={statusOptions}
          searchPlaceholder="Search applications by job or company..."
        />

        {/* Applications List */}
        {loading ? (
          <SkeletonLoader type="card" count={6} />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={FiBriefcase}
            title={filters.search ? "No matching applications" : "No applications found"}
            description={filters.search ? "Try adjusting your search terms or filters." : "You don't have any applications matching the current filters."}
            actionLabel={!filters.search ? "Browse Jobs" : "Clear Filters"}
            onAction={() => !filters.search ? window.location.href = '/worker/jobs' : setFilters({
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
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application._id}
                application={application}
                onViewJob={handleViewJob}
              />
            ))}
          </div>
        )}

        {/* Job Details Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Job Details"
          size="lg"
          footer={
            selectedApplication && (
              <div className="flex justify-end gap-3 w-full">
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleStartConversation(selectedApplication)}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2"
                >
                  <FiMessageCircle className="h-5 w-5" />
                  Message Company
                </button>
              </div>
            )
          }
        >
          {selectedApplication && (
            <div className="space-y-8">
              {/* Header with Company Info */}
              <div className="flex flex-col md:flex-row gap-6 pb-6 border-b border-gray-100">
                <div className="flex-shrink-0">
                  {selectedApplication.job?.companyInfo?.logo ? (
                    <img
                      src={selectedApplication.job.companyInfo.logo}
                      alt={selectedApplication.job.companyInfo.companyName}
                      className="h-20 w-20 rounded-2xl object-cover border border-gray-100 shadow-sm"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                      <FiBriefcase className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{selectedApplication.job?.title}</h2>
                    <StatusBadge status={selectedApplication.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-gray-600">
                    <span className="font-bold text-gray-900">{selectedApplication.job?.companyInfo?.companyName}</span>
                    {selectedApplication.job?.companyInfo?.tagline && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm">{selectedApplication.job.companyInfo.tagline}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                    <FiClock className="h-4 w-4" />
                    <span>Posted on {new Date(selectedApplication.job?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <FiDollarSign className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Budget</span>
                  </div>
                  <p className="text-lg font-black text-gray-900">${selectedApplication.job?.salary}</p>
                  <p className="text-xs text-gray-500 capitalize">{selectedApplication.job?.salaryType}</p>
                </div>
                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                  <div className="flex items-center gap-2 text-primary-600 mb-1">
                    <FiDollarSign className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Your Bid</span>
                  </div>
                  <p className="text-lg font-black text-primary-700">${selectedApplication.proposedRate}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <FiClock className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{selectedApplication.job?.duration || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <FiBriefcase className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Level</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 capitalize">{selectedApplication.job?.experienceLevel}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <FiClock className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Deadline</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-lg font-bold text-gray-900">
                      {selectedApplication.job?.deadline ? new Date(selectedApplication.job.deadline).toLocaleDateString() : 'None'}
                    </p>
                    {selectedApplication.job?.deadline && (
                      <p className="text-xs text-gray-500">
                        {new Date(selectedApplication.job.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FiFileText className="h-5 w-5 text-gray-400" />
                  Job Description
                </h3>
                <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <p className="whitespace-pre-line leading-relaxed">{selectedApplication.job?.description}</p>
                </div>
              </div>

              {/* Skills & Tags */}
              {selectedApplication.job?.tags && selectedApplication.job.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FiAward className="h-5 w-5 text-gray-400" />
                    Skills & Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.job.tags.map((tag, index) => (
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

              {/* Job Attachments */}
              {selectedApplication.job?.attachments && selectedApplication.job.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FiPaperclip className="h-5 w-5 text-gray-400" />
                    Job Attachments
                  </h3>
                  <div className="space-y-2">
                    {selectedApplication.job.attachments.map((file, index) => (
                      <a
                        key={index}
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-white hover:bg-indigo-50 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all group"
                      >
                        <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                          <FiFile className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                            {file.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Download'}
                          </p>
                        </div>
                        <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Your Proposal Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <FiFileText className="h-5 w-5" />
                  Your Proposal
                </h3>
                <p className="text-blue-800 whitespace-pre-wrap leading-relaxed">{selectedApplication.proposal}</p>

                {/* Proposal Attachments */}
                {selectedApplication.attachments && selectedApplication.attachments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-blue-200/50">
                    <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <FiPaperclip className="h-4 w-4" />
                      Attachments
                    </h4>
                    <div className="space-y-2">
                      {selectedApplication.attachments.map((file, index) => (
                        <a
                          key={index}
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white/60 hover:bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-all group"
                        >
                          <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors">
                            <FiFile className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-900 truncate">
                              {file.fileName}
                            </p>
                            <p className="text-xs text-blue-600">
                              {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Download'}
                            </p>
                          </div>
                          <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;