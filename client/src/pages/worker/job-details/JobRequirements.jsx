import React, { useState } from 'react';
import { FiCheckCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const JobRequirements = ({ requirements }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!requirements || requirements.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Requirements</h2>
            </div>
            <ul className="space-y-3">
                {(isExpanded ? requirements : requirements.slice(0, 3)).map((req, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                        <div className="mt-0.5 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        </div>
                        <span className="text-gray-700 leading-relaxed">{req}</span>
                    </li>
                ))}
            </ul>
            {requirements.length > 3 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-100 border border-primary-200 group"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? `Show less requirements (hiding ${requirements.length - 3})` : `Show ${requirements.length - 3} more requirements`}
                >
                    <span>
                        {isExpanded
                            ? 'Show Less'
                            : `Show ${requirements.length - 3} More`}
                    </span>
                    {isExpanded ? (
                        <FiChevronUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                    ) : (
                        <FiChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                    )}
                </button>
            )}
        </div>
    );
};

export default JobRequirements;
