import React, { useEffect, useState } from 'react';
import { workerAPI, messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiBriefcase, FiClock, FiCheckCircle, FiX, FiAlertCircle, FiFileText, FiAward, FiDollarSign, FiMessageCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PageHeader, EmptyState, SkeletonLoader, Modal } from '../../components/shared';
import ApplicationCard from '../../components/shared/ApplicationCard';
import { useNavigate } from 'react-router-dom';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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
      // Fallback if companyInfo is not populated correctly but company ID is in job.company
      // Note: In getMyApplications, job.company is populated with email/role, and companyInfo is added separately.
      // Let's check if we can use job.company._id if companyInfo._id is missing.
      // However, the backend populates companyInfo based on job.company._id.
      // If companyInfo is missing, it might mean the company profile doesn't exist or something went wrong.
      // But let's try to use the raw company ID if available.
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

    // If companyInfo is available (which it should be based on our controller logic)
    try {
      // The backend controller for getOrCreateConversation expects { otherUserId, jobId }
      // It seems I used createConversation in the previous turn which might be wrong if the API is getOrCreateConversation.
      // Let's check the API service definition if possible, but based on JobDetails.jsx it was getOrCreateConversation.
      const response = await messageAPI.getOrCreateConversation({
        otherUserId: application.job.company._id, // Use the user ID from the company object
        jobId: application.job._id
      });
      toast.success('Opening conversation...');
      closeModal();
      navigate(`/messages/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start conversation.');
    }
  };

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter(app => app.status === filter);

  // Count applications by status
  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

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

        {/* Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-1.5 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {[
              { key: 'all', label: 'All Applications' },
              { key: 'pending', label: 'Pending' },
              { key: 'accepted', label: 'Accepted' },
              { key: 'rejected', label: 'Rejected' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${filter === key
                  ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                  : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
              >
                {label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${filter === key ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                  {counts[key] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <SkeletonLoader type="card" count={6} />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={FiBriefcase}
            title={filter === 'all' ? "No applications yet" : `No ${filter} applications`}
            description={filter === 'all'
              ? "You haven't applied to any jobs yet. Start browsing available jobs!"
              : `You don't have any ${filter} applications.`
            }
            actionLabel="Browse Jobs"
            onAction={() => window.location.href = '/worker/jobs'}
            secondaryActionLabel={filter !== 'all' ? "Show All" : undefined}
            onSecondaryAction={filter !== 'all' ? () => setFilter('all') : undefined}
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
                  <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{selectedApplication.job?.title}</h2>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

              {/* Your Proposal Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <FiFileText className="h-5 w-5" />
                  Your Proposal
                </h3>
                <p className="text-blue-800 whitespace-pre-wrap leading-relaxed">{selectedApplication.proposal}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;