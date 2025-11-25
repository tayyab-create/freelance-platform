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
            <div className="max-w-5xl mx-auto space-y-8 pb-8">
                {/* Job Header - Premium Card */}
                <div className="bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 relative overflow-hidden">
                    {/* Decorative gradient overlay */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500"></div>

                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
                        <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                                {/* Company Logo */}
                                {job.companyInfo && (
                                    <>
                                        {job.companyInfo.logo ? (
                                            <img
                                                src={job.companyInfo.logo}
                                                alt={job.companyInfo.companyName}
                                                className="h-16 w-16 rounded-2xl object-cover shadow-lg border-2 border-white"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg border-2 border-white">
                                                <FiBriefcase className="h-8 w-8 text-white" />
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="flex-1">
                                    <h1 className="text-4xl font-black text-gray-900 mb-2 leading-tight">{job.title}</h1>
                                    {job.companyInfo && (
                                        <div className="space-y-1">
                                            <p className="text-lg font-bold text-gray-700">{job.companyInfo.companyName}</p>
                                            {job.companyInfo.tagline && (
                                                <p className="text-sm text-gray-600 italic">{job.companyInfo.tagline}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <span className="badge badge-success text-base px-5 py-2 shadow-md">{job.status}</span>
                            {job.deadline && (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${new Date(job.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                                    } shadow-sm`}>
                                    <FiCalendar className="h-4 w-4" />
                                    <span className="text-sm font-semibold">
                                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Job Meta Info - Grid Layout */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                    <FiDollarSign className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Budget</p>
                                    <p className="text-xl font-black text-gray-900">${job.salary}</p>
                                    <p className="text-xs text-gray-600 capitalize">{job.salaryType}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                    <FiClock className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Duration</p>
                                    <p className="text-lg font-bold text-gray-900">{job.duration}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                                    <FiBriefcase className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Level</p>
                                    <p className="text-lg font-bold text-gray-900 capitalize">{job.experienceLevel}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                                    <FiCalendar className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Posted</p>
                                    <p className="text-sm font-bold text-gray-900">{new Date(job.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Side by Side */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="primary"
                            onClick={() => setShowApplyModal(true)}
                            className="flex-1 text-lg py-4"
                        >
                            Apply for this Job
                        </Button>
                        <Button
                            variant="secondary"
                            icon={FiMessageCircle}
                            onClick={handleStartConversation}
                            className="flex-1 text-lg py-4"
                        >
                            Message Company
                        </Button>
                    </div>
                </div>

                {/* Job Description */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-1 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                        <h2 className="text-2xl font-black text-gray-900">Job Description</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">{job.description}</p>
                </div>

                {/* Skills Required */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-indigo-700 rounded-full"></div>
                        <h2 className="text-2xl font-black text-gray-900">Skills & Tags</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {job.tags?.map((tag, index) => (
                            <span
                                key={index}
                                className="px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 text-blue-700 border-2 border-blue-200/50 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-1 bg-gradient-to-b from-orange-500 to-red-700 rounded-full"></div>
                            <h2 className="text-2xl font-black text-gray-900">Requirements</h2>
                        </div>
                        <ul className="space-y-4">
                            {job.requirements.map((req, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="mt-1 h-6 w-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-md">
                                        <span className="text-white text-xs font-bold">✓</span>
                                    </div>
                                    <span className="text-gray-700 text-lg leading-relaxed">{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Application Modal - Enhanced */}
                {showApplyModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl transform animate-slide-up border border-gray-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-1 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                                <h2 className="text-3xl font-black text-gray-900">Apply for this Job</h2>
                            </div>

                            <form onSubmit={handleApply} className="space-y-6">
                                <div>
                                    <label className="label text-base">Your Proposal *</label>
                                    <textarea
                                        value={proposal}
                                        onChange={(e) => setProposal(e.target.value)}
                                        placeholder="Explain why you're the best fit for this job. Highlight your relevant experience and skills..."
                                        rows="8"
                                        required
                                        className="input-field text-base"
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                        <p className={`text-sm font-semibold ${proposal.length >= 50 ? 'text-green-600' : 'text-orange-600'
                                            }`}>
                                            {proposal.length} / 50 characters minimum
                                        </p>
                                        {proposal.length >= 50 && (
                                            <span className="text-green-600 text-sm font-bold">✓ Ready to submit</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="label text-base">Your Proposed Rate ($) *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiDollarSign className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            value={proposedRate}
                                            onChange={(e) => setProposedRate(e.target.value)}
                                            required
                                            className="input-field pl-12 text-base"
                                            placeholder="Enter your proposed rate"
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Job budget: ${job.salary} ({job.salaryType})
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        loading={applying}
                                        disabled={applying}
                                        className="flex-1 text-lg py-4"
                                    >
                                        {applying ? 'Submitting...' : 'Submit Application'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowApplyModal(false)}
                                        disabled={applying}
                                        className="flex-1 text-lg py-4"
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