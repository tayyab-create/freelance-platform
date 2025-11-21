import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyAPI, jobAPI, messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { FiUser, FiMail, FiStar, FiCheckCircle, FiMessageCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

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
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Job Info */}
                <div className="card">
                    <h1 className="text-2xl font-bold mb-2">{job?.title}</h1>
                    <p className="text-gray-600">
                        {applications.length} application{applications.length !== 1 ? 's' : ''} received
                    </p>
                </div>

                {/* Applications */}
                {applications.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-600">No applications received yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((application) => (
                            <div key={application._id} className="card">
                                <div className="flex items-start gap-4">
                                    {/* Worker Avatar */}
                                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                        {application.workerInfo?.profilePicture ? (
                                            <img
                                                src={application.workerInfo.profilePicture}
                                                alt={application.workerInfo.fullName}
                                                className="h-16 w-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <FiUser className="h-8 w-8 text-primary-600" />
                                        )}
                                    </div>

                                    {/* Worker Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold">
                                                    {application.workerInfo?.fullName || 'Worker'}
                                                </h3>
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <FiMail className="h-4 w-4" />
                                                    {application.worker?.email}
                                                </p>
                                                {application.workerInfo && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="flex items-center gap-1">
                                                            <FiStar className="h-4 w-4 text-yellow-400" />
                                                            <span className="text-sm font-medium">
                                                                {application.workerInfo.averageRating?.toFixed(1) || '0.0'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                ({application.workerInfo.totalReviews || 0} reviews)
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`badge ${
                                                application.status === 'pending' ? 'badge-warning' :
                                                application.status === 'accepted' ? 'badge-success' :
                                                'badge-danger'
                                            }`}>
                                                {application.status}
                                            </span>
                                        </div>

                                        {/* Skills */}
                                        {application.workerInfo?.skills && application.workerInfo.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {application.workerInfo.skills.slice(0, 5).map((skill, index) => (
                                                    <span key={index} className="badge badge-info text-xs">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Proposal */}
                                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                            <h4 className="font-semibold mb-2">Proposal:</h4>
                                            <p className="text-gray-700">{application.proposal}</p>
                                        </div>

                                        {/* Proposed Rate & Actions */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-sm text-gray-600">Proposed Rate: </span>
                                                <span className="font-bold text-primary-600">${application.proposedRate}</span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                {/* Message Button */}
                                                <Button
                                                    variant="secondary"
                                                    icon={FiMessageCircle}
                                                    onClick={() => handleMessageWorker(application.worker._id)}
                                                    loading={messagingWorker === application.worker._id}
                                                    disabled={messagingWorker !== null}
                                                >
                                                    Message
                                                </Button>

                                                {/* Assign Button */}
                                                {application.status === 'pending' && job?.status === 'posted' && (
                                                    <Button
                                                        variant="success"
                                                        icon={FiCheckCircle}
                                                        onClick={() => handleAssignJob(application.worker._id, application._id)}
                                                        loading={assigningTo === application._id}
                                                        disabled={assigningTo !== null}
                                                    >
                                                        Assign Job
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
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