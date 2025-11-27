import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyAPI, jobAPI, messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import {
    FiUser,
    FiStar,
    FiCheckCircle,
    FiMessageCircle,
    FiFileText,
    FiArrowLeft,
    FiCalendar,
    FiDollarSign,
    FiClock,
    FiBriefcase,
    FiMapPin,
    FiDownload,
    FiPaperclip,
    FiEye,
    FiSearch
} from 'react-icons/fi';
import { toast } from '../../utils/toast';
import { SkeletonLoader, StatusBadge, PageHeader, ConfirmationModal, SuccessAnimation } from '../../components/shared';
import SubmissionDetailsModal from '../../components/company/SubmissionDetailsModal';
import { getCompanyBreadcrumbs } from '../../utils/breadcrumbUtils';

const JobApplications = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [assigningTo, setAssigningTo] = useState(null);
    const [messagingWorker, setMessagingWorker] = useState(null);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [processingSubmission, setProcessingSubmission] = useState(null);

    // Filters
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Confirmation States
    const [assignConfirmation, setAssignConfirmation] = useState(null);
    const [approveConfirmation, setApproveConfirmation] = useState(null);
    const [successState, setSuccessState] = useState(null); // { type: 'assign' | 'approve', message: string }

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [jobResponse, applicationsResponse] = await Promise.all([
                jobAPI.getJobById(id),
                companyAPI.getJobApplications(id),
            ]);

            const jobData = jobResponse.data.data;
            setJob(jobData);
            setApplications(applicationsResponse.data.data);

            // If job is assigned or completed, fetch submissions to check for any work
            if (jobData.status === 'assigned' || jobData.status === 'completed') {
                try {
                    const submissionsResponse = await companyAPI.getSubmissions();
                    const jobSubmission = submissionsResponse.data.data.find(s => s.job._id === id);
                    setSubmission(jobSubmission);
                } catch (err) {
                    console.error("Failed to fetch submissions", err);
                }
            }

        } catch (error) {
            toast.error('Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignJobClick = (workerId, applicationId) => {
        setAssignConfirmation({ workerId, applicationId });
    };

    const confirmAssignJob = async () => {
        const { workerId, applicationId } = assignConfirmation;
        setAssigningTo(applicationId);
        setAssignConfirmation(null);

        try {
            await companyAPI.assignJob(id, { workerId, applicationId });
            setSuccessState({
                type: 'assign',
                message: 'Job Assigned Successfully!',
                description: 'The freelancer has been notified and can start working.'
            });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign job');
        } finally {
            setAssigningTo(null);
        }
    };

    const handleMessageWorker = async (workerId) => {
        setMessagingWorker(workerId);
        try {
            const response = await messageAPI.getOrCreateConversation({
                otherUserId: workerId,
                jobId: id
            });

            const conversation = response.data.data;
            navigate(`/messages/${conversation._id}`);
            toast.success('Opening conversation...');
        } catch (error) {
            toast.error('Failed to start conversation');
        } finally {
            setMessagingWorker(null);
        }
    };

    const handleApproveSubmissionClick = (jobId) => {
        setApproveConfirmation(jobId);
    };

    const confirmApproveSubmission = async () => {
        const jobId = approveConfirmation;
        setProcessingSubmission(jobId);
        setApproveConfirmation(null);

        try {
            await companyAPI.completeJob(jobId);
            setShowSubmissionModal(false);
            setSuccessState({
                type: 'approve',
                message: 'Job Completed!',
                description: 'The submission has been approved and payment released.'
            });
            fetchData();
        } catch (error) {
            toast.error('Failed to complete job');
        } finally {
            setProcessingSubmission(null);
        }
    };

    const handleRequestRevision = (submission) => {
        toast.info('Revision request feature coming soon!');
        // Implement revision logic here
    };

    const filteredApplications = applications.filter(app => {
        if (filter !== 'all' && app.status !== filter) return false;
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            app.workerInfo?.fullName?.toLowerCase().includes(query) ||
            app.worker?.email?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <DashboardLayout>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                    <SkeletonLoader type="card" count={3} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Breadcrumbs with Back Button */}
                <PageHeader
                    breadcrumbs={getCompanyBreadcrumbs('job-applications', { jobTitle: job?.title })}
                    backButton={{
                        onClick: () => navigate('/company/jobs')
                    }}
                />

                {/* Job Details Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <h1 className="text-3xl font-bold text-gray-900">{job?.title}</h1>
                                <StatusBadge status={job?.status} />
                            </div>
                            <p className="text-gray-600 leading-relaxed max-w-3xl">{job?.description}</p>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Posted</div>
                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                <FiCalendar className="w-4 h-4 text-gray-400" />
                                {new Date(job?.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-8 border-t border-gray-100">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                                <FiDollarSign className="w-4 h-4" />
                                Budget
                            </div>
                            <div className="text-lg font-bold text-gray-900">${job?.salary}</div>
                            <div className="text-xs text-gray-500">{job?.salaryType}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                                <FiClock className="w-4 h-4" />
                                Duration
                            </div>
                            <div className="text-lg font-bold text-gray-900">{job?.duration}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                                <FiBriefcase className="w-4 h-4" />
                                Experience
                            </div>
                            <div className="text-lg font-bold text-gray-900 capitalize">{job?.experienceLevel}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                                <FiCalendar className="w-4 h-4" />
                                Deadline
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                                {job?.deadline ? (
                                    <div className="flex flex-col">
                                        <span>{new Date(job.deadline).toLocaleDateString()}</span>
                                        <span className="text-xs text-gray-500 font-normal">
                                            {new Date(job.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ) : 'No Deadline'}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                                <FiUser className="w-4 h-4" />
                                Applications
                            </div>
                            <div className="text-lg font-bold text-gray-900">{applications.length}</div>
                        </div>
                    </div>

                    {/* Attachments */}
                    {job?.attachments && job.attachments.length > 0 && (
                        <div className="pt-8 mt-8 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-gray-700 text-sm font-bold uppercase tracking-wider mb-4">
                                <FiPaperclip className="w-4 h-4" />
                                Job Attachments
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {job.attachments.map((file, index) => (
                                    <a
                                        key={index}
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all group"
                                    >
                                        <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                            <FiDownload className="w-5 h-5" />
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
                </div>

                {/* Submission Section */}
                {submission && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Current Work</h2>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <FiFileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Work Submitted</h3>
                                        <p className="text-sm text-gray-500">
                                            Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <StatusBadge status={submission.status} />
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <p className="text-gray-600 italic line-clamp-2">
                                    "{submission.description || 'No description provided.'}"
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    {submission.files?.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <FiPaperclip className="w-4 h-4" />
                                            {submission.files.length} Attachments
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="primary"
                                    icon={FiEye}
                                    onClick={() => setShowSubmissionModal(true)}
                                >
                                    View Submission
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Applications Section */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Applications ({applications.length})
                    </h2>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search Input */}
                        <div className="relative w-full md:w-96">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search applicants by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all shadow-sm"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-1.5 overflow-x-auto w-full md:w-auto">
                            <div className="flex gap-1 min-w-max">
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'pending', label: 'Pending' },
                                    { key: 'accepted', label: 'Accepted' },
                                    { key: 'rejected', label: 'Rejected' },
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
                                            {tab.key === 'all' ? applications.length : applications.filter(a => a.status === tab.key).length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {filteredApplications.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-6">
                            <FiFileText className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {searchQuery ? 'No matching applications' : 'No Applications Yet'}
                        </h3>
                        <p className="text-gray-500">
                            {searchQuery ? 'Try adjusting your search' : 'Applications will appear here when workers apply to this job'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredApplications.map((application) => (
                            <div
                                key={application._id}
                                className={`bg-white rounded-2xl border ${application.status === 'accepted' ? 'border-green-200 ring-4 ring-green-50' : 'border-gray-200'} overflow-hidden hover:shadow-lg transition-all duration-300`}
                            >
                                {/* Applicant Header */}
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            {application.workerInfo?.profilePicture ? (
                                                <img
                                                    src={application.workerInfo.profilePicture}
                                                    alt={application.workerInfo.fullName}
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600 shadow-inner">
                                                    <FiUser className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {application.workerInfo?.fullName || 'Worker'}
                                                    </h3>
                                                    <p className="text-gray-500">{application.worker?.email}</p>
                                                </div>
                                                <StatusBadge status={application.status} />
                                            </div>

                                            {application.workerInfo && (
                                                <div className="flex items-center gap-4 text-sm mt-2">
                                                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg">
                                                        <FiStar className="w-4 h-4 fill-current" />
                                                        <span className="font-bold">
                                                            {application.workerInfo.averageRating?.toFixed(1) || '0.0'}
                                                        </span>
                                                        <span className="text-yellow-600/70">
                                                            ({application.workerInfo.totalReviews || 0} reviews)
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                    {/* Proposal */}
                                    <div className="p-6 md:col-span-2">
                                        <div className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <FiFileText className="w-4 h-4" />
                                            Cover Letter
                                        </div>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {application.proposal}
                                        </p>

                                        {/* Skills */}
                                        {application.workerInfo?.skills && application.workerInfo.skills.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-gray-100">
                                                <div className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Skills</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {application.workerInfo.skills.slice(0, 10).map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Attachments */}
                                        {application.attachments && application.attachments.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-gray-100">
                                                <div className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <FiPaperclip className="w-4 h-4" />
                                                    Attachments
                                                </div>
                                                <div className="space-y-2">
                                                    {application.attachments.map((file, index) => (
                                                        <a
                                                            key={index}
                                                            href={file.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-3 bg-white hover:bg-indigo-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all group"
                                                        >
                                                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                                                <FiDownload className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                                                    {file.fileName}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Download'}
                                                                </p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Rate & Actions */}
                                    <div className="p-6 bg-gray-50/50 flex flex-col justify-between">
                                        <div className="mb-6">
                                            <div className="text-sm text-gray-500 font-medium mb-1">Proposed Rate</div>
                                            <div className="text-3xl font-bold text-gray-900">${application.proposedRate}</div>
                                            <div className="text-sm text-gray-500">Total amount</div>
                                        </div>

                                        <div className="space-y-3">
                                            <Button
                                                variant="secondary"
                                                icon={FiMessageCircle}
                                                onClick={() => handleMessageWorker(application.worker._id)}
                                                loading={messagingWorker === application.worker._id}
                                                disabled={messagingWorker !== null}
                                                className="w-full justify-center"
                                            >
                                                Message
                                            </Button>

                                            {application.status === 'pending' && job?.status === 'posted' && (
                                                <Button
                                                    variant="primary"
                                                    icon={FiCheckCircle}
                                                    onClick={() => handleAssignJobClick(application.worker._id, application._id)}
                                                    loading={assigningTo === application._id}
                                                    disabled={assigningTo !== null}
                                                    className="w-full justify-center"
                                                >
                                                    Assign Job
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Submission Details Modal */}
                <SubmissionDetailsModal
                    isOpen={showSubmissionModal}
                    onClose={() => setShowSubmissionModal(false)}
                    submission={submission}
                    onApprove={handleApproveSubmissionClick}
                    onRequestRevision={handleRequestRevision}
                    processing={processingSubmission}
                />

                {/* Confirmation Modals */}
                <ConfirmationModal
                    isOpen={!!assignConfirmation}
                    onClose={() => setAssignConfirmation(null)}
                    onConfirm={confirmAssignJob}
                    title="Assign Job?"
                    message="Are you sure you want to assign this job to this freelancer? This action cannot be undone."
                    confirmText="Assign Job"
                    cancelText="Cancel"
                    variant="primary"

                />

                <ConfirmationModal
                    isOpen={!!approveConfirmation}
                    onClose={() => setApproveConfirmation(null)}
                    onConfirm={confirmApproveSubmission}
                    title="Approve Submission?"
                    message="Are you sure you want to approve this submission? This will mark the job as complete and release payment to the freelancer."
                    confirmText="Approve & Complete"
                    cancelText="Cancel"
                    variant="success"
                />

                {/* Success Animation */}
                <SuccessAnimation
                    show={!!successState}
                    message={successState?.message}
                    description={successState?.description}
                    showConfetti={true}
                    onComplete={() => setSuccessState(null)}
                />
            </div>
        </DashboardLayout>
    );
};

export default JobApplications;
