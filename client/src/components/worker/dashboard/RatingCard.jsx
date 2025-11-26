import React from 'react';
import { FiStar } from 'react-icons/fi';

const RatingCard = ({ rating, totalReviews }) => {
    return (
        <div className="bg-[#FFFBEB] p-6 rounded-2xl shadow-sm border border-yellow-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <FiStar className="text-yellow-500 fill-current" />
                Your Rating
            </h3>

            <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                        key={star}
                        className={`h-8 w-8 ${star <= Math.round(rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>

            <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-black text-gray-900">
                    {rating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-gray-500 font-medium">/ 5.0</span>
            </div>

            <p className="text-gray-600 font-medium">
                Based on {totalReviews || 0} reviews
            </p>
        </div>
    );
};

export default RatingCard;
