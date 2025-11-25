import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI, workerAPI, messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiDollarSign, FiClock, FiCalendar, FiBriefcase, FiMessageCircle, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { SkeletonLoader, StatusBadge, Avatar, Modal, JobMetaItem, SectionCard } from '../../components/shared';

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
                <div className="space-y-6 max-w-5xl mx-auto">
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
                <div className="card text-center py-12">
                    <p className="text-gray-600">Job not found</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 pb-12">
                {/* Header Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 to-purple-600"></div>

                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
                        <div className="flex items-start gap-5">
                            {/* Company Logo */}
                            {job.companyInfo?.logo ? (
                                <Avatar
                                    src={job.companyInfo.logo}
                                    name={job.companyInfo.companyName}
                                    size="xl"
                                    shape="square"
                                    className="border border-gray-100 shadow-sm"
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-2xl bg-primary-50 flex items-center justify-center border border-primary-100">
                                    <FiBriefcase className="h-8 w-8 text-primary-600" />
                                </div>
                            )}

                            <div>
                                <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{job.title}</h1>
                                <div className="flex items-center gap-2 text-gray-600 font-medium">
                                    <span>{job.companyInfo?.companyName || 'Unknown Company'}</span>
                                    {job.companyInfo?.tagline && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-gray-500 text-sm">{job.companyInfo.tagline}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <StatusBadge status={job.status} size="lg" />
                            {job.deadline && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-sm font-semibold">
                                    <FiCalendar className="h-4 w-4" />
                                    <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <JobMetaItem
                            icon={FiDollarSign}
                            label="Budget"
                            value={`$${job.salary}`}
                            subValue={job.salaryType}
                            color="green"
                        />
                        <JobMetaItem
                            icon={FiClock}
                            label="Duration"
                            value={job.duration}
                            color="blue"
                        />
                        <JobMetaItem
                            icon={FiBriefcase}
                            label="Level"
                            value={job.experienceLevel}
                            color="purple"
                        />
                        <JobMetaItem
                            icon={FiCalendar}
                            label="Posted"
                            value={new Date(job.createdAt).toLocaleDateString()}
                            color="orange"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {job.applicationStatus && job.applicationStatus !== 'rejected' ? (
                            <button
                                disabled
                                className="flex-1 bg-gray-100 text-gray-500 font-bold py-4 px-8 rounded-xl border border-gray-200 cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <FiCheckCircle className="h-5 w-5" />
                                Application {job.applicationStatus.charAt(0).toUpperCase() + job.applicationStatus.slice(1)}
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowApplyModal(true)}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                Apply for this Job
                            </button>
                        )}
                        <button
                            onClick={handleStartConversation}
                            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <FiMessageCircle className="h-5 w-5" />
                            Message Company
                        </button>
                    </div>
                </div>

                {/* Job Description */}
                <SectionCard title="Job Description" color="primary">
                    <p className="whitespace-pre-line text-lg">{job.description}</p>
                </SectionCard>

                {/* Skills & Tags */}
                <SectionCard title="Skills & Tags" color="blue">
                    <div className="flex flex-wrap gap-3">
                        {job.tags?.map((tag, index) => (
                            <span
                                key={index}
                                className="px-5 py-2.5 text-sm font-bold rounded-xl bg-gray-50 text-gray-700 border border-gray-200 hover:bg-white hover:border-primary-200 hover:text-primary-600 hover:shadow-md transition-all duration-300 cursor-default"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </SectionCard>

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                    <SectionCard title="Requirements" color="orange">
                        <ul className="space-y-4">
                            {job.requirements.map((req, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <div className="mt-1 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <FiCheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="text-gray-700 text-lg">{req}</span>
                                </li>
                            ))}
                        </ul>
                    </SectionCard>
                )}

                {/* Application Modal */}
                {showApplyModal && (
                    <Modal
                        isOpen={showApplyModal}
                        onClose={() => setShowApplyModal(false)}
                        title="Apply for Job"
                        size="lg"
                        footer={
                            <>
                                <button onClick={() => setShowApplyModal(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {applying ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </>
                        }
                    >
                        <form onSubmit={handleApply} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Proposal *</label>
                                <textarea
                                    value={proposal}
                                    onChange={(e) => setProposal(e.target.value)}
                                    placeholder="Explain why you're the best fit for this role..."
                                    rows="8"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none text-gray-700"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-sm text-gray-500">Minimum 50 characters</p>
                                    <p className={`text-sm font-medium ${proposal.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                                        {proposal.length} characters
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Proposed Rate ($)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-bold">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={proposedRate}
                                        onChange={(e) => setProposedRate(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold text-gray-900"
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Client's budget: <span className="font-bold text-gray-900">${job.salary}</span>
                                </p>
                            </div>
                        </form>
                    </Modal>
                )}
            </div>
        </DashboardLayout>
    );
};

export default JobDetails;