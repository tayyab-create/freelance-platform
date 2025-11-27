import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

const JobSkills = ({ tags }) => {
    if (!tags || tags.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FiTrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Skills Required</h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default JobSkills;
