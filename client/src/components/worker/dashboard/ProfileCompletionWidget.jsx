import React from 'react';
import { Link } from 'react-router-dom';

const ProfileCompletionWidget = ({ completion }) => {
    if (completion >= 100) return null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
                <span className="text-lg font-bold text-gray-900">{completion}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                    className="bg-[#8b5cf6] h-6 rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{ width: `${completion}%` }}
                ></div>
            </div>
            <Link to="/worker/profile" className="text-sm text-primary-600 font-medium mt-3 inline-block hover:underline">
                Complete Profile &rarr;
            </Link>
        </div>
    );
};

export default ProfileCompletionWidget;
