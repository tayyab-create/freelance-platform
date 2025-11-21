import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI, workerAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { FiDollarSign, FiClock, FiCalendar, FiBriefcase, FiMessageCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { messageAPI } from '../../services/api';

const JobDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [proposal, setProposal] = useState('');
    const [proposedRate, setProposedRate] = useState('');

    // Add this function
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
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    if (!job) {
        return (
            <DashboardLayout>
                <div className="card text-center">
                    <p className="text-gray-600">Job not found</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Job Header */}
                <div className="card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                            {job.companyInfo && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    {job.companyInfo.logo ? (
                                        <img
                                            src={job.companyInfo.logo}
                                            alt={job.companyInfo.companyName}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                            <FiBriefcase className="h-5 w-5 text-primary-600" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900">{job.companyInfo.companyName}</p>
                                        {job.companyInfo.tagline && (
                                            <p className="text-sm text-gray-500">{job.companyInfo.tagline}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <span className="badge badge-success">{job.status}</span>
                    </div>

                    <div className="flex flex-wrap gap-6 text-gray-700 mb-6">
                        <div className="flex items-center gap-2">
                            <FiDollarSign className="h-5 w-5 text-primary-600" />
                            <span className="font-semibold">${job.salary}</span>
                            <span className="text-sm text-gray-500">({job.salaryType})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiClock className="h-5 w-5 text-primary-600" />
                            <span>{job.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiBriefcase className="h-5 w-5 text-primary-600" />
                            <span className="capitalize">{job.experienceLevel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiCalendar className="h-5 w-5 text-primary-600" />
                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <Button variant="primary" onClick={() => setShowApplyModal(true)}>
                        Apply for this Job
                    </Button>
                    <Button
                        variant="secondary"
                        icon={FiMessageCircle}
                        onClick={handleStartConversation}
                    >
                        Message Company
                    </Button>
                </div>

                {/* Job Description */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Job Description</h2>
                    <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                </div>

                {/* Skills Required */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Skills & Tags</h2>
                    <div className="flex flex-wrap gap-2">
                        {job.tags?.map((tag, index) => (
                            <span key={index} className="badge badge-info">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Requirements</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            {job.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Application Modal */}
                {showApplyModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                            <h2 className="text-2xl font-bold mb-4">Apply for this Job</h2>
                            <form onSubmit={handleApply} className="space-y-4">
                                <div>
                                    <label className="label">Your Proposal *</label>
                                    <textarea
                                        value={proposal}
                                        onChange={(e) => setProposal(e.target.value)}
                                        placeholder="Explain why you're the best fit for this job (minimum 50 characters)"
                                        rows="6"
                                        required
                                        className="input-field"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {proposal.length} / 50 characters minimum
                                    </p>
                                </div>

                                <div>
                                    <label className="label">Your Proposed Rate ($) *</label>
                                    <input
                                        type="number"
                                        value={proposedRate}
                                        onChange={(e) => setProposedRate(e.target.value)}
                                        required
                                        className="input-field"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        loading={applying}
                                        disabled={applying}
                                    >
                                        Submit Application
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowApplyModal(false)}
                                        disabled={applying}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default JobDetails;