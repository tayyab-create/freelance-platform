import React from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiBriefcase, FiCheckCircle } from 'react-icons/fi';

const QuickActions = () => {
    return (
        <div className="card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiTarget className="text-primary-600" />
                Quick Actions
            </h3>
            <div className="space-y-3">
                <Link to="/worker/jobs" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    <FiBriefcase /> Browse Available Jobs
                </Link>
                <Link to="/worker/applications" className="btn-secondary w-full flex items-center justify-center gap-2 py-3">
                    <FiCheckCircle /> View My Applications
                </Link>
            </div>
        </div>
    );
};

export default QuickActions;
