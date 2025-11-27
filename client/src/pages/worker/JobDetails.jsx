import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI, workerAPI, messageAPI, uploadAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    FiBriefcase,
    FiCheckCircle,
    FiSend,
    FiMessageCircle,
    FiArrowLeft
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { SkeletonLoader, PageHeader } from '../../components/shared';
import { getWorkerBreadcrumbs } from '../../utils/breadcrumbUtils';

// Import sub-components
import JobHeader from './job-details/JobHeader';
import JobStats from './job-details/JobStats';
import JobDescription from './job-details/JobDescription';
import JobRequirements from './job-details/JobRequirements';
import JobSkills from './job-details/JobSkills';
import CompanyInfo from './job-details/CompanyInfo';
import JobInsights from './job-details/JobInsights';
import JobAttachments from './job-details/JobAttachments';
import ApplicationModal from './job-details/ApplicationModal';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [proposal, setProposal] = useState('');
    const [proposedRate, setProposedRate] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            const response = await jobAPI.getJobById(id);
            setJob(response.data.data);
            setProposedRate(response.data.data.salary);
        } catch (error) {
            toast.error('Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    const handleStartConversation = async () => {
        try {
            // Validate job data before proceeding
            if (!job) {
                toast.error('Job data not loaded');
                return;
            }

            if (!job.company || !job.company._id) {
                toast.error('Company information not available');
                console.error('Job company data:', job.company);
                return;
            }

            console.log('Starting conversation with:', {
                otherUserId: job.company._id,
                jobId: job._id,
                companyEmail: job.company.email
            });

            const response = await messageAPI.getOrCreateConversation({
                otherUserId: job.company._id,
                jobId: job._id
            });

            console.log('Conversation response:', response);
            console.log('Response data:', response.data);
            console.log('Conversation data:', response.data.data);

            const conversation = response.data.data;

            if (!conversation) {
                console.error('No conversation in response');
                toast.error('Failed to create conversation');
                return;
            }

            console.log('Conversation ID:', conversation._id);

            if (!conversation._id) {
                console.error('No conversation ID:', conversation);
                toast.error('Invalid conversation data');
                return;
            }

            navigate(`/messages/${conversation._id}`);
            toast.success('Opening conversation...');
        } catch (error) {
            console.error('Start conversation error:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to start conversation');
        }
    };

    const handleFileUpload = async (filesInput) => {
        let files;
        if (Array.isArray(filesInput)) {
            files = filesInput;
        } else if (filesInput?.target?.files) {
            files = Array.from(filesInput.target.files);
        } else {
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
                    'documents',
                    (progress) => {
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
                fileSize: res.data.data.fileSize
            }));

            setUploadedFiles(prev => [...prev, ...newFiles]);
            toast.success(`${newFiles.length} file(s) uploaded successfully!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload files');
        } finally {
            setUploadingFiles(false);
            setUploadProgress(0);
        }
    };

    const handleRemoveFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!proposal || proposal.length < 50) {
            toast.error('Proposal must be at least 50 characters');
            return;
        }

        setApplying(true);
        try {
            await workerAPI.applyForJob(id, {
                proposal,
                proposedRate,
                attachments: uploadedFiles
            });
            toast.success('Application submitted successfully!');
            setShowApplyModal(false);
            setProposal('');
            setProposedRate('');
            setUploadedFiles([]);
            navigate('/worker/applications');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <SkeletonLoader type="card" count={1} />
                    <div className="grid grid-cols-4 gap-4">
                        <SkeletonLoader type="stat" count={4} />
                    </div>
                    <SkeletonLoader type="card" count={2} />
                </div>
            </DashboardLayout>
        );
    }

    if (!job) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                            <FiBriefcase className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h3>
                        <p className="text-gray-500 mb-6">The job you're looking for doesn't exist or has been removed.</p>
                        <button
                            onClick={() => navigate('/worker/browse')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Browse Jobs
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const hasApplied = job.applicationStatus && job.applicationStatus !== 'rejected';

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Breadcrumbs with Back Button */}
                <PageHeader
                    breadcrumbs={getWorkerBreadcrumbs('job-details', { jobTitle: job?.title })}
                    backButton={{
                        onClick: () => navigate(-1)
                    }}
                />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <JobHeader job={job} />
                            <JobStats job={job} />

                            {/* Action Buttons */}
                            <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3">
                                {hasApplied ? (
                                    <button
                                        disabled
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-500 rounded-xl font-semibold border border-gray-200 cursor-not-allowed"
                                    >
                                        <FiCheckCircle className="w-5 h-5" />
                                        Application {job.applicationStatus.charAt(0).toUpperCase() + job.applicationStatus.slice(1)}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowApplyModal(true)}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all hover:shadow-xl hover:shadow-primary-500/30"
                                    >
                                        <FiSend className="w-5 h-5" />
                                        Apply Now
                                    </button>
                                )}
                                <button
                                    onClick={handleStartConversation}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold border border-gray-200 transition-all"
                                >
                                    <FiMessageCircle className="w-5 h-5" />
                                    Message
                                </button>
                            </div>
                        </div>

                        <JobDescription description={job.description} />
                        <JobRequirements requirements={job.requirements} />
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
                        <JobSkills tags={job.tags} />
                        <CompanyInfo companyInfo={job.companyInfo} companyCreatedAt={job.company?.createdAt} />
                        <JobInsights job={job} />
                        <JobAttachments attachments={job.attachments} />
                    </div>
                </div>
            </div>

            <ApplicationModal
                show={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                job={job}
                proposal={proposal}
                setProposal={setProposal}
                proposedRate={proposedRate}
                setProposedRate={setProposedRate}
                uploadedFiles={uploadedFiles}
                uploadingFiles={uploadingFiles}
                uploadProgress={uploadProgress}
                handleFileUpload={handleFileUpload}
                handleRemoveFile={handleRemoveFile}
                handleApply={handleApply}
                applying={applying}
            />
        </DashboardLayout>
    );
};

export default JobDetails;
