import React from 'react';
import { FiStar, FiUser, FiBriefcase } from 'react-icons/fi';
import ExpandableText from './ExpandableText';

const ReviewCard = ({ review, reviewerType, reviewerName, reviewerLogo }) => {
    if (!review) return null;

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                        key={star}
                        className={`w-5 h-5 ${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    const getRatingLabel = (rating) => {
        const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
        return labels[rating - 1] || '';
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    {/* Reviewer Avatar/Logo */}
                    <div className="flex-shrink-0">
                        {reviewerLogo ? (
                            <img
                                src={reviewerLogo}
                                alt={reviewerName}
                                className="h-12 w-12 rounded-xl object-cover border border-gray-100"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                {reviewerType === 'company' ? (
                                    <FiBriefcase className="h-6 w-6 text-gray-400" />
                                ) : (
                                    <FiUser className="h-6 w-6 text-gray-400" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reviewer Info */}
                    <div>
                        <h4 className="text-base font-bold text-gray-900 truncate max-w-[150px]" title={reviewerName}>{reviewerName}</h4>
                        <p className="text-sm text-gray-500 capitalize">
                            {reviewerType === 'company' ? 'Company Review' : 'Your Review'}
                        </p>
                    </div>
                </div>

                {/* Rating Badge */}
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-gray-900">{review.rating}</span>
                        <FiStar className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500">
                        {getRatingLabel(review.rating)}
                    </span>
                </div>
            </div>

            {/* Star Rating Visual */}
            <div className="mb-4">
                {renderStars(review.rating)}
            </div>

            {/* Review Text */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <ExpandableText
                    text={review.reviewText}
                    limit={150}
                    textClassName="text-sm text-gray-700 leading-relaxed"
                />
            </div>

            {/* Additional Tags/Skills (for company reviews) */}
            {review.skills && review.skills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Skills Highlighted
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {review.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-100"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Tags (for company reviews) */}
            {review.tags && review.tags.length > 0 && (
                <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                        {review.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 text-xs font-medium rounded-lg bg-purple-50 text-purple-700 border border-purple-100"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Would Hire Again Badge (for company reviews) */}
            {reviewerType === 'company' && review.wouldHireAgain !== undefined && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${review.wouldHireAgain
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                        {review.wouldHireAgain ? '✓ Would hire again' : 'Would not hire again'}
                    </div>
                </div>
            )}

            {/* Timestamp */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                    Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </p>
            </div>
        </div>
    );
};

export default ReviewCard;
