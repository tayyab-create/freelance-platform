import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, Clock, FileText, ArrowRight } from 'lucide-react';

const ApprovalHistoryTimeline = ({ history = [] }) => {
    if (!history || history.length === 0) {
        return null;
    }

    // Sort history by date (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const getStatusIcon = (action) => {
        switch (action) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'submitted':
            case 'resubmitted':
                return <FileText className="w-5 h-5 text-blue-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (action) => {
        switch (action) {
            case 'approved':
                return 'bg-green-100 border-green-200';
            case 'rejected':
                return 'bg-red-50 border-red-200';
            case 'submitted':
            case 'resubmitted':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Application History
            </h3>

            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pl-6 pb-2">
                {sortedHistory.map((event, index) => (
                    <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[33px] top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${getStatusColor(event.action)}`}>
                            {getStatusIcon(event.action)}
                        </div>

                        {/* Content Card */}
                        <div className={`card p-4 border ${getStatusColor(event.action)}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-900 capitalize">
                                        {event.action === 'submitted' ? 'Application Submitted' :
                                            event.action === 'resubmitted' ? 'Application Resubmitted' :
                                                `Application ${event.action}`}
                                    </h4>
                                    <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                                </div>
                            </div>

                            {event.reason && (
                                <div className="mt-3 bg-white/50 rounded-lg p-3 text-sm text-gray-700">
                                    <span className="font-semibold block mb-1">Feedback:</span>
                                    {event.reason}
                                </div>
                            )}

                            {event.metadata?.changes && event.metadata.changes.length > 0 && (
                                <div className="mt-3 bg-blue-50/50 rounded-lg p-3 text-sm text-blue-700">
                                    <span className="font-semibold block mb-1">Updated:</span>
                                    {event.metadata.changes.map(field =>
                                        field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                                    ).join(', ')}
                                </div>
                            )}

                            {event.reviewedBy && (
                                <p className="text-xs text-gray-400 mt-2">
                                    Reviewed by Admin
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

ApprovalHistoryTimeline.propTypes = {
    history: PropTypes.arrayOf(
        PropTypes.shape({
            action: PropTypes.string.isRequired,
            timestamp: PropTypes.string.isRequired,
            reason: PropTypes.string,
            reviewedBy: PropTypes.string
        })
    )
};

export default ApprovalHistoryTimeline;
