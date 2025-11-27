import React, { useState } from 'react';
import { FiStar, FiUser, FiBriefcase, FiChevronDown, FiChevronUp, FiThumbsUp } from 'react-icons/fi';

const ReviewCard = ({ review, reviewerType, reviewerName, reviewerLogo, projectTitle }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!review) return null;

    const isLongText = (review.reviewText || '').length > 150;

    // Determine styles based on rating
    const getTheme = (rating) => {
        if (rating >= 5) return {
            container: 'bg-emerald-50 border-emerald-100 shadow-sm hover:shadow-emerald-100',
            headerText: 'text-emerald-800',
            star: 'text-emerald-500 fill-emerald-500',
            ratingText: 'text-emerald-700',
            quote: 'text-emerald-200',
            badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            button: 'text-emerald-700 hover:text-emerald-800'
        };
        if (rating >= 4) return {
            container: 'bg-blue-50 border-blue-100 shadow-sm hover:shadow-blue-100',
            headerText: 'text-blue-800',
            star: 'text-blue-500 fill-blue-500',
            ratingText: 'text-blue-700',
            quote: 'text-blue-200',
            badge: 'bg-blue-100 text-blue-700 border-blue-200',
            button: 'text-blue-700 hover:text-blue-800'
        };
        if (rating >= 3) return {
            container: 'bg-amber-50 border-amber-100 shadow-sm hover:shadow-amber-100',
            headerText: 'text-amber-800',
            star: 'text-amber-500 fill-amber-500',
            ratingText: 'text-amber-700',
            quote: 'text-amber-200',
            badge: 'bg-amber-100 text-amber-700 border-amber-200',
            button: 'text-amber-700 hover:text-amber-800'
        };
        return {
            container: 'bg-red-50 border-red-100 shadow-sm hover:shadow-red-100',
            headerText: 'text-red-800',
            star: 'text-red-500 fill-red-500',
            ratingText: 'text-red-700',
            quote: 'text-red-200',
            badge: 'bg-red-100 text-red-700 border-red-200',
            button: 'text-red-700 hover:text-red-800'
        };
    };

    const theme = getTheme(review.rating);

    return (
        <div className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 group ${theme.container}`}>
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform duration-500 group-hover:scale-110">
                <FiStar className="w-32 h-32" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    {/* Avatar/Logo */}
                    <div className="flex-shrink-0">
                        {reviewerLogo ? (
                            <img
                                src={reviewerLogo}
                                alt={reviewerName}
                                className="h-12 w-12 rounded-xl object-cover border border-white/50 shadow-sm"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-xl bg-white/50 flex items-center justify-center border border-white/50 shadow-sm">
                                {reviewerType === 'company' ? (
                                    <FiBriefcase className={`h-6 w-6 ${theme.headerText}`} />
                                ) : (
                                    <FiUser className={`h-6 w-6 ${theme.headerText}`} />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <h4 className={`text-base font-bold truncate max-w-[150px] ${theme.headerText}`} title={reviewerName}>
                            {reviewerName}
                        </h4>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating
                                            ? `${theme.star} drop-shadow-sm`
                                            : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className={`text-sm font-bold ${theme.ratingText}`}>
                                {review.rating}.0
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-xs font-medium text-gray-400 bg-white/50 px-3 py-1 rounded-full border border-white/50 backdrop-blur-sm">
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {/* Project Title */}
            {projectTitle && (
                <div className="relative z-10 mb-4 pb-4 border-b border-black/5">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Project</p>
                    <p className="font-bold text-gray-900 truncate" title={projectTitle}>{projectTitle}</p>
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 mb-6">
                <div className="relative">
                    <span className={`absolute -top-2 -left-2 text-4xl font-serif leading-none select-none opacity-50 ${theme.quote}`}>"</span>
                    <div className="text-gray-700 leading-relaxed text-sm pl-4 relative z-10 italic">
                        {isExpanded ? review.reviewText : (
                            <>
                                {(review.reviewText || '').slice(0, 150)}
                                {isLongText && '...'}
                            </>
                        )}
                    </div>
                    <span className={`absolute -bottom-4 right-0 text-4xl font-serif leading-none select-none opacity-50 ${theme.quote}`}>"</span>
                </div>
                {isLongText && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`mt-2 text-xs font-bold hover:underline flex items-center gap-1 pl-4 relative z-20 ${theme.button}`}
                    >
                        {isExpanded ? (
                            <>Show Less <FiChevronUp /></>
                        ) : (
                            <>Read More <FiChevronDown /></>
                        )}
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="relative z-10 flex flex-wrap items-center gap-3 pt-4 border-t border-black/5">
                {reviewerType === 'company' && review.wouldHireAgain && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${theme.badge}`}>
                        <FiThumbsUp className="w-3.5 h-3.5" />
                        Would Hire Again
                    </div>
                )}

                {review.tags && review.tags.map((tag, index) => (
                    <span
                        key={index}
                        className="px-3 py-1.5 bg-white/60 text-gray-600 text-xs font-medium rounded-lg capitalize border border-black/5 shadow-sm"
                    >
                        {tag.replace('-', ' ')}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ReviewCard;
