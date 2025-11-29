import React from 'react';
import { FiCheckCircle, FiClock, FiAlertCircle, FiFileText, FiAward } from 'react-icons/fi';

const OnboardingInfoPanel = ({ profileCompleteness, status, rejectionReason, approvalHistory }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'incomplete': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'approved': return <FiCheckCircle className="h-5 w-5" />;
            case 'rejected': return <FiAlertCircle className="h-5 w-5" />;
            case 'pending': return <FiClock className="h-5 w-5" />;
            case 'incomplete': return <FiFileText className="h-5 w-5" />;
            default: return <FiFileText className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Profile Completeness */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiAward className="text-primary-600" />
                    Profile Completeness
                </h3>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                                Progress
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-primary-600">
                                {profileCompleteness}%
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-100">
                        <div
                            style={{ width: `${profileCompleteness}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
                        ></div>
                    </div>
                    <p className="text-sm text-gray-500">
                        Complete your profile to increase your chances of getting approved.
                    </p>
                </div>
            </div>

            {/* Application Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Application Status</h3>
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${getStatusColor()}`}>
                    <div className="mt-0.5">{getStatusIcon()}</div>
                    <div>
                        <p className="font-bold capitalize">{status || 'Not Submitted'}</p>
                        <p className="text-sm opacity-90 mt-1">
                            {status === 'pending' && 'Your application is under review. We will notify you once a decision is made.'}
                            {status === 'approved' && 'Congratulations! Your profile has been approved. You can now start applying for jobs.'}
                            {status === 'rejected' && 'Unfortunately, your application was not approved. Please review the feedback below.'}
                            {status === 'incomplete' && 'Please complete all steps and submit your profile for review.'}
                            {!status && 'Please complete all steps and submit your profile for review.'}
                        </p>
                    </div>
                </div>

                {/* Rejection Reason */}
                {status === 'rejected' && rejectionReason && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                        <h4 className="font-bold text-red-800 text-sm mb-2">Reason for Rejection:</h4>
                        <p className="text-sm text-red-700">{rejectionReason}</p>
                    </div>
                )}
            </div>

            {/* History / Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">History</h3>
                <div className="space-y-4">
                    {approvalHistory && approvalHistory.length > 0 ? (
                        approvalHistory.slice(0, 5).map((item, index) => (
                            <div key={item._id || index} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className={`w-2 h-2 rounded-full mt-2 ${item.action === 'approved' ? 'bg-green-500' :
                                        item.action === 'rejected' ? 'bg-red-500' :
                                            'bg-primary-500'
                                        }`}></div>
                                    {index !== approvalHistory.length - 1 && (
                                        <div className="w-0.5 h-full bg-gray-100 my-1"></div>
                                    )}
                                </div>
                                <div className="pb-4">
                                    <p className="text-sm font-medium text-gray-900 capitalize">
                                        {item.action === 'resubmitted' ? 'Resubmitted for Review' :
                                            item.action === 'submitted' ? 'Application Submitted' :
                                                item.action}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(item.timestamp).toLocaleString(undefined, {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                    {item.reason && (
                                        <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded border border-gray-100">
                                            {item.reason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            No history available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingInfoPanel;
