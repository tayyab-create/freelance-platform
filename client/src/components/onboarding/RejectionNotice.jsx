import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, ArrowRight, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RejectionNotice = ({ reason, onEdit }) => {
    return (
        <div className="card border-l-4 border-l-red-500 shadow-lg animate-fade-in">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>

                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Action Required: Application Returned</h2>

                    <p className="text-gray-600 mb-4">
                        Thank you for your interest. Our team has reviewed your application, but we need a few changes before we can approve your profile.
                    </p>

                    <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-100">
                        <h3 className="font-semibold text-red-800 mb-2 text-sm uppercase tracking-wide">Reviewer Feedback</h3>
                        <p className="text-gray-800 whitespace-pre-wrap">{reason || "Please review your profile details and ensure all information is accurate and complete."}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onEdit}
                            className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit & Resubmit Application
                        </button>

                        <button className="btn-secondary flex items-center justify-center gap-2 px-6 py-3">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

RejectionNotice.propTypes = {
    reason: PropTypes.string,
    onEdit: PropTypes.func.isRequired
};

export default RejectionNotice;
