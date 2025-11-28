import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import ApprovalHistoryTimeline from '../../components/onboarding/ApprovalHistoryTimeline';
import RejectionNotice from '../../components/onboarding/RejectionNotice';
import { Clock, CheckCircle, Loader, ArrowRight } from 'lucide-react';

const OnboardingStatus = () => {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await api.get('/auth/onboarding/status');
                setStatusData(response.data);
            } catch (error) {
                console.error('Error fetching status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, []);

    const handleEdit = () => {
        // Redirect to the appropriate onboarding flow based on role
        const path = user?.role === 'company' ? '/company/onboarding' : '/worker/onboarding';
        navigate(path);
    };

    const handleGoToDashboard = () => {
        const path = user?.role === 'company' ? '/company/dashboard' : '/worker/dashboard';
        navigate(path);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading status...</p>
                </div>
            </div>
        );
    }

    if (!statusData) {
        return null;
    }

    const { status, approvalHistory, rejectionReason } = statusData;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
                    <p className="mt-2 text-gray-600">Track the progress of your account verification</p>
                </div>

                {/* Main Status Card */}
                {status === 'pending' && (
                    <div className="card-premium text-center py-10">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <Clock className="w-10 h-10 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Under Review</h2>
                        <p className="text-gray-600 max-w-lg mx-auto mb-8">
                            Your application has been submitted and is currently being reviewed by our team.
                            This process typically takes 24-48 hours. You will receive an email once the review is complete.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                            Review in progress
                        </div>
                    </div>
                )}

                {status === 'rejected' && (
                    <RejectionNotice
                        reason={rejectionReason}
                        onEdit={handleEdit}
                    />
                )}

                {status === 'approved' && (
                    <div className="card-premium text-center py-10 border-t-4 border-t-green-500">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Approved!</h2>
                        <p className="text-gray-600 max-w-lg mx-auto mb-8">
                            Congratulations! Your account has been verified. You now have full access to the platform.
                        </p>
                        <button
                            onClick={handleGoToDashboard}
                            className="btn-primary px-8 py-3 flex items-center gap-2 mx-auto"
                        >
                            Go to Dashboard
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Timeline */}
                {approvalHistory && approvalHistory.length > 0 && (
                    <div className="mt-8">
                        <ApprovalHistoryTimeline history={approvalHistory} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingStatus;
