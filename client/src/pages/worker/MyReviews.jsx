import React, { useEffect, useState } from 'react';
import { workerAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiStar, FiBriefcase } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await workerAPI.getMyReviews();
      const reviewData = response.data.data;
      setReviews(reviewData);

      // Calculate statistics
      if (reviewData.length > 0) {
        const avgRating = reviewData.reduce((sum, r) => sum + r.rating, 0) / reviewData.length;
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewData.forEach(r => {
          breakdown[r.rating]++;
        });

        setStats({
          averageRating: avgRating.toFixed(1),
          totalReviews: reviewData.length,
          ratingBreakdown: breakdown,
        });
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Reviews</h1>
          <p className="text-gray-600 mt-2">See what clients think about your work</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Average Rating */}
              <div className="card text-center">
                <p className="text-gray-600 mb-2">Average Rating</p>
                <p className="text-5xl font-bold text-primary-600 mb-2">
                  {stats.averageRating}
                </p>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(parseFloat(stats.averageRating)))}
                </div>
                <p className="text-sm text-gray-500">Based on {stats.totalReviews} reviews</p>
              </div>

              {/* Rating Breakdown */}
              <div className="card col-span-2">
                <h3 className="font-bold mb-4">Rating Breakdown</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-sm font-medium">{rating}</span>
                        <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-primary-600 h-full rounded-full transition-all"
                          style={{
                            width: `${stats.totalReviews > 0 ? (stats.ratingBreakdown[rating] / stats.totalReviews) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {stats.ratingBreakdown[rating]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="card text-center py-12">
                <FiStar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No reviews yet</p>
                <p className="text-sm text-gray-500">
                  Complete jobs to receive reviews from clients
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="card">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {review.companyInfo?.logo ? (
                          <img
                            src={review.companyInfo.logo}
                            alt={review.companyInfo.companyName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <FiBriefcase className="h-6 w-6 text-primary-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold">
                            {review.companyInfo?.companyName || 'Company'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {renderStars(review.rating)}
                    </div>

                    {/* Job */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Project</p>
                      <p className="font-semibold">{review.job?.title}</p>
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-700 mb-4">{review.reviewText}</p>

                    {/* Tags */}
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {review.tags.map((tag, index) => (
                          <span key={index} className="badge badge-info text-xs">
                            {tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Would Hire Again */}
                    {review.wouldHireAgain && (
                      <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm">
                        ✓ Would hire again
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyReviews;