import React, { useState } from 'react';
import { FiFileText, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const JobDescription = ({ description }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <FiFileText className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
            </div>
            <div className="prose prose-gray max-w-none">
                <div className={`text-gray-700 leading-relaxed whitespace-pre-line transition-all duration-300 ${!isExpanded && description.length > 500 ? 'max-h-32 overflow-hidden relative' : ''}`}>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {isExpanded || description.length <= 500
                            ? description
                            : `${description.slice(0, 500)}...`}
                    </p>
                    {!isExpanded && description.length > 500 && (
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    )}
                </div>
                {description.length > 500 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-100 border border-primary-200 group"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Show less description' : 'Show more description'}
                    >
                        <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
                        {isExpanded ? (
                            <FiChevronUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                        ) : (
                            <FiChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default JobDescription;
