import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';

const ReviewsTab = ({ profile }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Client Reviews</h3>
                <Link to="/worker/reviews" className="text-primary-600 text-sm font-bold hover:underline">View All</Link>
            </div>

            {profile?.totalReviews > 0 ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="text-center px-4 border-r border-gray-200">
                            <span className="text-3xl font-black text-gray-900">{profile.averageRating?.toFixed(1)}</span>
                            <div className="flex text-yellow-400 text-sm mt-1">
                                {[1, 2, 3, 4, 5].map(s => <FiStar key={s} className={s <= Math.round(profile.averageRating) ? "fill-current" : "text-gray-300"} />)}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{profile.totalReviews} reviews</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 italic">"Great work! Highly recommended."</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {profile.recentReviews?.slice(0, 3).map((review, i) => (
                            <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                <div className="flex justify-between mb-2">
                                    <h4 className="font-bold text-gray-900 text-sm">{review.companyName || 'Client'}</h4>
                                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex text-yellow-400 text-xs mb-2">
                                    {[1, 2, 3, 4, 5].map(s => <FiStar key={s} className={s <= review.rating ? "fill-current" : "text-gray-300"} />)}
                                </div>
                                <p className="text-sm text-gray-600">{review.reviewText}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">No reviews yet.</div>
            )}
        </div>
    );
};

export default ReviewsTab;
