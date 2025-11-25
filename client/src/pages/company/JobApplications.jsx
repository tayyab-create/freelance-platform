import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyAPI, jobAPI, messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { FiUser, FiMail, FiStar, FiCheckCircle, FiMessageCircle, FiFileText, FiUsers, FiDollarSign, FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PageHeader, SkeletonLoader, EmptyState, StatusBadge, Avatar, ActionDropdown } from '../../components/shared';

const JobApplications = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigningTo, setAssigningTo] = useState(null);
    const [messagingWorker, setMessagingWorker] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [jobResponse, applicationsResponse] = await Promise.all([
                jobAPI.getJobById(id),
                companyAPI.getJobApplications(id),
            ]);
            setJob(jobResponse.data.data);
            setApplications(applicationsResponse.data.data);
        } catch (error) {
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignJob = async (workerId, applicationId) => {
        if (!window.confirm('Are you sure you want to assign this job to this freelancer?')) {
            return;
        }

        setAssigningTo(applicationId);
        try {
            await companyAPI.assignJob(id, { workerId, applicationId });
            toast.success('Job assigned successfully!');
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

    if (loading) {
        return (
            <DashboardLayout>
                <SkeletonLoader type="list" count={5} />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-8">
                {/* Job Header - Premium */}
                <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h1 className="text-4xl font-black text-gray-900 mb-3">{job?.title}</h1>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-xl shadow-md">
                                    <FiUsers className="h-5 w-5 text-primary-600" />
                                    <p className="font-bold text-gray-900">
                                        {applications.length} Application{applications.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applications */}
                {applications.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                                    <FiFileText className="h-10 w-10 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
                            <p className="text-gray-600">No workers have applied to this job yet. Sit tight!</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.map((application) => (
                            <div
                                key={application._id}
                                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-8 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 group"
                            >
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Worker Avatar & Basic Info */}
                                    <div className="flex gap-5">
                                        <div className="relative flex-shrink-0">
                                            {application.workerInfo?.profilePicture ? (
                                                <img
                                                    src={application.workerInfo.profilePicture}
                                                    alt={application.workerInfo.fullName}
                                                    className="h-24 w-24 rounded-2xl object-cover border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                                                    <FiUser className="h-12 w-12 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Worker Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-2xl font-black text-gray-900 mb-1">
                                                        {application.workerInfo?.fullName || 'Worker'}
                                                    </h3>
                                                    <p className="text-gray-600 flex items-center gap-2 mb-2">
                                                        <FiMail className="h-4 w-4" />
                                                        {application.worker?.email}
                                                    </p>
                                                    {application.workerInfo && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border border-yellow-300">
                                                                <FiStar className="h-4 w-4 text-yellow-600 fill-current" />
                                                                <span className="font-bold text-yellow-800">
                                                                    {application.workerInfo.averageRating?.toFixed(1) || '0.0'}
                                                                </span>
                                                                <span className="text-xs text-gray-600">
                                                                    ({application.workerInfo.totalReviews || 0} reviews)
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex-shrink-0">
                                        <span className={`px-5 py-2.5 text-sm font-bold rounded-xl border-2 shadow-sm uppercase ${application.status === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300' :
                                                application.status === 'accepted' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300' :
                                                    'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300'
                                            }`}>
                                            {application.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Skills */}
                                {application.workerInfo?.skills && application.workerInfo.skills.length > 0 && (
                                    <div className="mt-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FiAward className="h-5 w-5 text-primary-600" />
                                            <h4 className="font-bold text-gray-900">Skills:</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {application.workerInfo.skills.slice(0, 6).map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 text-blue-700 border border-blue-200/50 shadow-sm"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Proposal */}
                                <div className="mt-5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FiFileText className="h-5 w-5 text-purple-600" />
                                        <h4 className="font-bold text-gray-900 text-lg">Proposal:</h4>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{application.proposal}</p>
                                </div>

                                {/* Proposed Rate & Actions */}
                                <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-300">
                                        <div className="p-2 bg-green-500 rounded-lg">
                                            <FiDollarSign className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600 font-semibold uppercase block">Proposed Rate</span>
                                            <span className="text-2xl font-black text-green-800">${application.proposedRate}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <Button
                                            variant="secondary"
                                            icon={FiMessageCircle}
                                            onClick={() => handleMessageWorker(application.worker._id)}
                                            loading={messagingWorker === application.worker._id}
                                            disabled={messagingWorker !== null}
                                            className="px-6 py-3 text-lg"
                                        >
                                            Message
                                        </Button>

                                        {application.status === 'pending' && job?.status === 'posted' && (
                                            <Button
                                                variant="success"
                                                icon={FiCheckCircle}
                                                onClick={() => handleAssignJob(application.worker._id, application._id)}
                                                loading={assigningTo === application._id}
                                                disabled={assigningTo !== null}
                                                className="px-6 py-3 text-lg shadow-lg"
                                            >
                                                Assign Job
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default JobApplications;