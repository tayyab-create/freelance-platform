import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI, workerAPI, messageAPI, uploadAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    FiDollarSign,
    FiClock,
    FiCalendar,
    FiBriefcase,
    FiMessageCircle,
    FiCheckCircle,
    FiMapPin,
    FiUsers,
    FiTrendingUp,
    FiAward,
    FiFileText,
    FiSend,
    FiX,
    FiArrowLeft,
    FiPaperclip,
    FiFile,
    FiGlobe,
    FiExternalLink,
    FiUser,
    FiEye,
    FiMonitor,
    FiChevronDown,
    FiChevronUp
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { SkeletonLoader, StatusBadge, Avatar, PageHeader } from '../../components/shared';
import FileUpload from '../../components/common/FileUpload';
import { getWorkerBreadcrumbs } from '../../utils/breadcrumbUtils';

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

    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [isReqExpanded, setIsReqExpanded] = useState(false);

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
                            {/* Company Header */}
                            <div className="p-8 border-b border-gray-100">
                                <div className="flex items-start gap-5 mb-6">
                                    {job.companyInfo?.logo ? (
                                        <Avatar
                                            src={job.companyInfo.logo}
                                            name={job.companyInfo.companyName}
                                            size="xl"
                                            shape="square"
                                            className="border border-gray-200"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                            <FiBriefcase className="h-8 w-8 text-white" />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                                            {job.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-3 text-gray-600">
                                            <span className="font-medium text-gray-900">
                                                {job.companyInfo?.companyName || 'Unknown Company'}
                                            </span>
                                            {job.companyInfo?.location && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="flex items-center gap-1.5 text-sm">
                                                        <FiMapPin className="w-4 h-4" />
                                                        {job.companyInfo.location}
                                                    </span>
                                                </>
                                            )}
                                            <span className="text-gray-300">•</span>
                                            <span className="text-sm text-gray-500">
                                                Posted {new Date(job.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <StatusBadge status={job.status} size="md" />
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                        <div className="flex items-center gap-2 text-green-700 mb-1">
                                            <FiDollarSign className="w-4 h-4" />
                                            <span className="text-xs font-semibold uppercase tracking-wide">Budget</span>
                                        </div>
                                        <p className="text-xl font-bold text-gray-900">${job.salary}</p>
                                        <p className="text-xs text-gray-600 mt-0.5">{job.salaryType}</p>
                                    </div>

                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <div className="flex items-center gap-2 text-blue-700 mb-1">
                                            <FiClock className="w-4 h-4" />
                                            <span className="text-xs font-semibold uppercase tracking-wide">Duration</span>
                                        </div>
                                        <p className="text-xl font-bold text-gray-900">
                                            {(() => {
                                                if (!job.deadline) return job.duration || 'N/A';

                                                const now = new Date();
                                                const deadlineDate = new Date(job.deadline);
                                                const diffTime = deadlineDate - now;

                                                if (diffTime <= 0) return 'Expired';

                                                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                                const months = Math.floor(diffDays / 30);
                                                const days = diffDays % 30;

                                                let durationStr = '';
                                                if (months > 0) {
                                                    durationStr += `${months} month${months > 1 ? 's' : ''}`;
                                                }
                                                if (days > 0) {
                                                    if (durationStr) durationStr += ', ';
                                                    durationStr += `${days} day${days > 1 ? 's' : ''}`;
                                                }
                                                if (!durationStr) {
                                                    durationStr = 'Less than a day';
                                                }

                                                return durationStr;
                                            })()}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-0.5">Project Timeline</p>
                                    </div>

                                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                        <div className="flex items-center gap-2 text-purple-700 mb-1">
                                            <FiAward className="w-4 h-4" />
                                            <span className="text-xs font-semibold uppercase tracking-wide">Level</span>
                                        </div>
                                        <p className="text-xl font-bold text-gray-900 capitalize">{job.experienceLevel}</p>
                                        <p className="text-xs text-gray-600 mt-0.5">Experience Required</p>
                                    </div>

                                    {job.deadline && (
                                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                                            <div className="flex items-center gap-2 text-orange-700 mb-1">
                                                <FiCalendar className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wide">Deadline</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">
                                                {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                {new Date(job.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

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

                        {/* Job Description */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                    <FiFileText className="w-5 h-5 text-primary-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
                            </div>
                            <div className="prose prose-gray max-w-none">
                                <div className={`text-gray-700 leading-relaxed whitespace-pre-line transition-all duration-300 ${!isDescExpanded && job.description.length > 500 ? 'max-h-32 overflow-hidden relative' : ''}`}>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {isDescExpanded || job.description.length <= 500
                                            ? job.description
                                            : `${job.description.slice(0, 500)}...`}
                                    </p>
                                    {!isDescExpanded && job.description.length > 500 && (
                                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                                    )}
                                </div>
                                {job.description.length > 500 && (
                                    <button
                                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-100 border border-primary-200 group"
                                        aria-expanded={isDescExpanded}
                                        aria-label={isDescExpanded ? 'Show less description' : 'Show more description'}
                                    >
                                        <span>{isDescExpanded ? 'Show Less' : 'Show More'}</span>
                                        {isDescExpanded ? (
                                            <FiChevronUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                                        ) : (
                                            <FiChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Requirements */}
                        {job.requirements && job.requirements.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                        <FiCheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Requirements</h2>
                                </div>
                                <ul className="space-y-3">
                                    {(isReqExpanded ? job.requirements : job.requirements.slice(0, 3)).map((req, index) => (
                                        <li key={index} className="flex items-start gap-3 group">
                                            <div className="mt-0.5 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                            </div>
                                            <span className="text-gray-700 leading-relaxed">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                                {job.requirements.length > 3 && (
                                    <button
                                        onClick={() => setIsReqExpanded(!isReqExpanded)}
                                        className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-100 border border-primary-200 group"
                                        aria-expanded={isReqExpanded}
                                        aria-label={isReqExpanded ? `Show less requirements (hiding ${job.requirements.length - 3})` : `Show ${job.requirements.length - 3} more requirements`}
                                    >
                                        <span>
                                            {isReqExpanded
                                                ? 'Show Less'
                                                : `Show ${job.requirements.length - 3} More`}
                                        </span>
                                        {isReqExpanded ? (
                                            <FiChevronUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                                        ) : (
                                            <FiChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
                        {/* Skills Required */}
                        {job.tags && job.tags.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <FiTrendingUp className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Skills Required</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {job.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* About Company */}
                        {job.companyInfo && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <FiBriefcase className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">About Company</h3>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <p className="text-base font-bold text-gray-900 mb-1">
                                            {job.companyInfo.companyName}
                                        </p>
                                        {job.companyInfo.tagline && (
                                            <p className="text-sm text-gray-500 leading-relaxed">
                                                {job.companyInfo.tagline}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        {job.companyInfo.industry && (
                                            <div className="flex items-center gap-3 text-sm group">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                                    <FiTrendingUp className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs font-medium">Industry</p>
                                                    <p className="text-gray-900 font-semibold">{job.companyInfo.industry}</p>
                                                </div>
                                            </div>
                                        )}

                                        {job.companyInfo.size && (
                                            <div className="flex items-center gap-3 text-sm group">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                                    <FiUsers className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs font-medium">Company Size</p>
                                                    <p className="text-gray-900 font-semibold">{job.companyInfo.size} employees</p>
                                                </div>
                                            </div>
                                        )}

                                        {job.companyInfo.location && (
                                            <div className="flex items-center gap-3 text-sm group">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                                    <FiMapPin className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs font-medium">Location</p>
                                                    <p className="text-gray-900 font-semibold">{job.companyInfo.location}</p>
                                                </div>
                                            </div>
                                        )}

                                        {job.companyInfo.website && (
                                            <div className="flex items-center gap-3 text-sm group">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                                    <FiGlobe className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-gray-500 text-xs font-medium">Website</p>
                                                    <a
                                                        href={job.companyInfo.website.startsWith('http') ? job.companyInfo.website : `https://${job.companyInfo.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-purple-600 font-semibold hover:underline flex items-center gap-1"
                                                    >
                                                        Visit Website <FiExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {job.company?.createdAt && (
                                            <div className="flex items-center gap-3 text-sm group">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                                    <FiCalendar className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs font-medium">Member Since</p>
                                                    <p className="text-gray-900 font-semibold">
                                                        {new Date(job.company.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button className="w-full mt-2 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border border-gray-200">
                                        View Company Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Job Insights */}
                        <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl border border-blue-100 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <FiTrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Job Insights</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-50 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <FiCheckCircle className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">Status</span>
                                    </div>
                                    <StatusBadge status={job.status} size="sm" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-white rounded-xl border border-blue-50 shadow-sm">
                                        <div className="text-xs text-gray-500 font-medium mb-1">Job Type</div>
                                        <div className="font-bold text-gray-900 capitalize flex items-center gap-1.5">
                                            <FiBriefcase className="w-3.5 h-3.5 text-gray-400" />
                                            {job.salaryType}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white rounded-xl border border-blue-50 shadow-sm">
                                        <div className="text-xs text-gray-500 font-medium mb-1">Posted</div>
                                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                            <FiClock className="w-3.5 h-3.5 text-gray-400" />
                                            {(() => {
                                                const days = Math.floor((new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));
                                                if (days === 0) return 'Today';
                                                if (days === 1) return 'Yesterday';
                                                return `${days} days ago`;
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {job.applicantCount !== undefined && (
                                    <div className="p-3 bg-white rounded-xl border border-blue-50 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-600">Competition</span>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                                {job.applicantCount > 10 ? 'High' : 'Low'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {[...Array(Math.min(3, job.applicantCount || 0))].map((_, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                                                        <FiUser className="w-4 h-4" />
                                                    </div>
                                                ))}
                                                {(job.applicantCount || 0) > 3 && (
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600">
                                                        +{job.applicantCount - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-bold text-gray-900">{job.applicantCount}</span>
                                                <span className="text-gray-500 ml-1">Applicants</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Attachments */}
                        {job.attachments && job.attachments.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <FiPaperclip className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Attachments</h2>
                                </div>
                                <div className="space-y-3">
                                    {job.attachments.map((file, index) => (
                                        <a
                                            key={index}
                                            href={file.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all group"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                                    <FiFile className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                                        {file.fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                                                    </p>
                                                </div>
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
                </div>
            </div>

            {/* Application Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                            onClick={() => setShowApplyModal(false)}
                        ></div>

                        {/* Modal */}
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Submit Application</h3>
                                    <p className="text-sm text-gray-600 mt-1">Apply for {job.title}</p>
                                </div>
                                <button
                                    onClick={() => setShowApplyModal(false)}
                                    className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                                >
                                    <FiX className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleApply} className="p-6 space-y-6">
                                {/* Proposal */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Cover Letter / Proposal *
                                    </label>
                                    <textarea
                                        value={proposal}
                                        onChange={(e) => setProposal(e.target.value)}
                                        placeholder="Introduce yourself and explain why you're the perfect fit for this role. Highlight your relevant experience and skills..."
                                        rows="10"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none text-gray-700 placeholder:text-gray-400"
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-gray-500">Minimum 50 characters required</p>
                                        <p className={`text-xs font-semibold ${proposal.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                                            {proposal.length} / 50
                                        </p>
                                    </div>
                                </div>

                                {/* Proposed Rate */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Your Proposed Rate
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiDollarSign className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            value={proposedRate}
                                            onChange={(e) => setProposedRate(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-semibold text-gray-900"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-gray-500">
                                            Client's budget: <span className="font-semibold text-gray-900">${job.salary}</span> {job.salaryType}
                                        </p>
                                    </div>
                                </div>

                                {/* Attachments */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Attachments (Optional)
                                    </label>

                                    <div className="space-y-3">
                                        {!uploadingFiles && (
                                            <FileUpload
                                                onFileSelect={handleFileUpload}
                                                multiple={true}
                                                accept="*/*"
                                                maxSize={10}
                                                showProgress={false}
                                            >
                                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 hover:border-primary-300 transition-all cursor-pointer group">
                                                    <div className="h-10 w-10 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                                        <FiPaperclip className="h-5 w-5" />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-700">Click to attach files</p>
                                                    <p className="text-xs text-gray-400 mt-1">Portfolio, resume, or relevant documents</p>
                                                </div>
                                            </FileUpload>
                                        )}

                                        {uploadingFiles && (
                                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-center gap-2 text-primary-600">
                                                        <div className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-sm font-medium">Uploading...</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div
                                                            className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-center text-gray-500">{uploadProgress}%</p>
                                                </div>
                                            </div>
                                        )}

                                        {uploadedFiles.length > 0 && (
                                            <div className="space-y-2">
                                                {uploadedFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                            <div className="p-1.5 bg-white rounded border border-gray-100 text-blue-600">
                                                                <FiFile className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-gray-700 truncate">{file.fileName}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile(index)}
                                                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                        >
                                                            <FiX className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowApplyModal(false)}
                                        className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={applying || proposal.length < 50}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
                                    >
                                        {applying ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <FiSend className="w-5 h-5" />
                                                Submit Application
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default JobDetails;
