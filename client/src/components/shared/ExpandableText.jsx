import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ExpandableText = ({ text, limit = 200, className = '', textClassName = '' }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) return null;

    const shouldTruncate = text.length > limit;

    return (
        <div className={className}>
            <div className={`transition-all duration-300 ${!isExpanded && shouldTruncate ? 'max-h-24 overflow-hidden relative' : ''}`}>
                <p className={`whitespace-pre-line ${textClassName}`}>
                    {isExpanded || !shouldTruncate ? text : `${text.slice(0, limit)}...`}
                </p>
                {!isExpanded && shouldTruncate && (
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/80 to-transparent pointer-events-none"></div>
                )}
            </div>
            {shouldTruncate && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700 transition-colors text-sm group"
                >
                    <span>{isExpanded ? 'See Less' : 'See More'}</span>
                    {isExpanded ? (
                        <FiChevronUp className="w-3 h-3 transition-transform duration-200 group-hover:-translate-y-0.5" />
                    ) : (
                        <FiChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:translate-y-0.5" />
                    )}
                </button>
            )}
        </div>
    );
};

export default ExpandableText;
