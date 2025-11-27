import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyAPI, jobAPI, messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from '../../utils/toast';
import { SkeletonLoader, PageHeader, ConfirmationModal, SuccessAnimation, ReviewCard } from '../../components/shared';
import { FiStar, FiBriefcase } from 'react-icons/fi';
import SubmissionDetailsModal from '../../components/company/SubmissionDetailsModal';
import { getCompanyBreadcrumbs } from '../../utils/breadcrumbUtils';

// Import sub-components
import JobDetailsCard from './job-applications/JobDetailsCard';
import SubmissionCard from './job-applications/SubmissionCard';
import ApplicationFilter from './job-applications/ApplicationFilter';
import ApplicationList from './job-applications/ApplicationList';


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
    const [companyProfile, setCompanyProfile] = useState(null);

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
            const [jobResponse, applicationsResponse, profileResponse] = await Promise.all([
                jobAPI.getJobById(id),
                companyAPI.getJobApplications(id),
                companyAPI.getProfile()
            ]);

            const jobData = jobResponse.data.data;
            setJob(jobData);
            setApplications(applicationsResponse.data.data);
            setCompanyProfile(profileResponse.data.data);

            // Fetch submissions for all statuses except pending
            if (jobData.status !== 'pending') {
                try {
                    const submissionsResponse = await companyAPI.getSubmissions();
                    let jobSubmission = submissionsResponse.data.data.find(s => s.job._id === id);

                    // If job is completed, fetch full submission details to get reviews
                    if (jobData.status === 'completed' && jobSubmission) {
                        const fullSubmissionResponse = await companyAPI.getSubmissionById(jobSubmission._id);
                        jobSubmission = fullSubmissionResponse.data.data;
                    }

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
                <JobDetailsCard job={job} applicationCount={applications.length} />

                <div className="my-8 border-t border-gray-200" />

                {/* Submission Section - Show only when submission exists */}
                {submission && (
                    <>
                        <SubmissionCard
                            submission={submission}
                            onViewSubmission={() => navigate(`/company/submissions/${submission._id}`)}
                        />
                        <div className="my-8 border-t border-gray-200" />
                    </>
                )}

                {/* Reviews Section - For Completed Jobs */}
                {job?.status === 'completed' && submission && (
                    <div className="mb-8 border-b border-gray-200 pb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FiStar className="text-yellow-500 fill-yellow-500" />
                            Project Reviews
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Company Review */}
                            {submission.companyReview ? (
                                <ReviewCard
                                    review={submission.companyReview}
                                    reviewerType="company"
                                    reviewerName={companyProfile?.companyName || "You"}
                                    reviewerLogo={companyProfile?.logo}
                                    projectTitle={job.title}
                                />
                            ) : (
                                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                        <FiStar className="h-8 w-8 text-orange-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Leave a Review</h3>
                                    <p className="text-gray-600 mb-6">
                                        Share your experience working with the freelancer.
                                    </p>
                                    <button
                                        onClick={() => navigate(`/company/submissions/${submission._id}`)}
                                        className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
                                    >
                                        Write Review
                                    </button>
                                </div>
                            )}

                            {/* Worker Review */}
                            {submission.workerReview ? (
                                <ReviewCard
                                    review={submission.workerReview}
                                    reviewerType="worker"
                                    reviewerName={submission.workerInfo?.fullName || 'Freelancer'}
                                    reviewerLogo={submission.workerInfo?.profilePicture}
                                    projectTitle={job.title}
                                />
                            ) : (
                                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-8 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                        <FiBriefcase className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Waiting for Review</h3>
                                    <p className="text-gray-500">
                                        The freelancer hasn't submitted their review yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Applications Section */}
                <div className="mb-6">
                    <ApplicationFilter
                        filter={filter}
                        setFilter={setFilter}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        applications={applications}
                    />
                </div>

                <ApplicationList
                    applications={filteredApplications}
                    job={job}
                    handleMessageWorker={handleMessageWorker}
                    handleAssignJobClick={handleAssignJobClick}
                    messagingWorker={messagingWorker}
                    assigningTo={assigningTo}
                    searchQuery={searchQuery}
                />



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
