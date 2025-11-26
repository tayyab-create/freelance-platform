import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI, workerAPI, messageAPI } from '../../services/api';
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
    FiArrowLeft
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { SkeletonLoader, StatusBadge, Avatar } from '../../components/shared';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [proposal, setProposal] = useState('');
    const [proposedRate, setProposedRate] = useState('');

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
            const response = await messageAPI.getOrCreateConversation({
                otherUserId: job.company._id,
                jobId: job._id
            });

            const conversation = response.data.data;
            navigate(`/messages/${conversation._id}`);
            toast.success('Opening conversation...');
        } catch (error) {
            toast.error('Failed to start conversation');
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!proposal || proposal.length < 50) {
            toast.error('Proposal must be at least 50 characters');
            return;
        }

        setApplying(true);
        try {
            await workerAPI.applyForJob(id, { proposal, proposedRate });
            toast.success('Application submitted successfully!');
            setShowApplyModal(false);
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
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <SkeletonLoader type="card" count={1} />
                        <div className="grid grid-cols-4 gap-4 mt-6">
                            <SkeletonLoader type="stat" count={4} />
                        </div>
                        <SkeletonLoader type="card" count={2} />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!job) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors group"
                    >
                        <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>

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
                                            <p className="text-xl font-bold text-gray-900">{job.duration}</p>
                                        </div>

                                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                            <div className="flex items-center gap-2 text-purple-700 mb-1">
                                                <FiAward className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wide">Level</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">{job.experienceLevel}</p>
                                        </div>

                                        {job.deadline && (
                                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                                                <div className="flex items-center gap-2 text-orange-700 mb-1">
                                                    <FiCalendar className="w-4 h-4" />
                                                    <span className="text-xs font-semibold uppercase tracking-wide">Deadline</span>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {new Date(job.deadline).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
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
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {job.description}
                                    </p>
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
                                        {job.requirements.map((req, index) => (
                                            <li key={index} className="flex items-start gap-3 group">
                                                <div className="mt-0.5 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                                                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                                </div>
                                                <span className="text-gray-700 leading-relaxed">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Skills Required */}
                            {job.tags && job.tags.length > 0 && (
                                <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
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

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 mb-1">
                                                {job.companyInfo.companyName}
                                            </p>
                                            {job.companyInfo.tagline && (
                                                <p className="text-sm text-gray-600">
                                                    {job.companyInfo.tagline}
                                                </p>
                                            )}
                                        </div>

                                        {job.companyInfo.industry && (
                                            <div className="flex items-start gap-3 text-sm">
                                                <FiTrendingUp className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-gray-500 text-xs mb-0.5">Industry</p>
                                                    <p className="text-gray-900 font-medium">{job.companyInfo.industry}</p>
                                                </div>
                                            </div>
                                        )}

                                        {job.companyInfo.size && (
                                            <div className="flex items-start gap-3 text-sm">
                                                <FiUsers className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-gray-500 text-xs mb-0.5">Company Size</p>
                                                    <p className="text-gray-900 font-medium">{job.companyInfo.size} employees</p>
                                                </div>
                                            </div>
                                        )}

                                        {job.companyInfo.location && (
                                            <div className="flex items-start gap-3 text-sm">
                                                <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-gray-500 text-xs mb-0.5">Location</p>
                                                    <p className="text-gray-900 font-medium">{job.companyInfo.location}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Job Insights */}
                            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Job Insights</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Status</span>
                                        <StatusBadge status={job.status} size="sm" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Job Type</span>
                                        <span className="text-sm font-semibold text-gray-900">{job.salaryType}</span>
                                    </div>
                                    {job.applicantCount !== undefined && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Applicants</span>
                                            <span className="text-sm font-semibold text-gray-900">{job.applicantCount}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
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
