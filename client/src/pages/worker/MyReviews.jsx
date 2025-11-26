import React, { useEffect, useState } from 'react';
import { workerAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiStar, FiBriefcase, FiCheckCircle, FiTrendingUp, FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { SkeletonLoader } from '../../components/shared';
import { useNavigate } from 'react-router-dom';

const MyReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    wouldHireAgainCount: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await workerAPI.getMyReviews();
      const reviewData = response.data.data;
      setReviews(reviewData);

      if (reviewData.length > 0) {
        const avgRating = reviewData.reduce((sum, r) => sum + r.rating, 0) / reviewData.length;
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        const wouldHireAgainCount = reviewData.filter(r => r.wouldHireAgain).length;

        reviewData.forEach(r => {
          breakdown[r.rating]++;
        });

        setStats({
          averageRating: avgRating.toFixed(1),
          totalReviews: reviewData.length,
          ratingBreakdown: breakdown,
          wouldHireAgainCount,
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
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingPercentage = (rating) => {
    if (stats.totalReviews === 0) return 0;
    return Math.round((stats.ratingBreakdown[rating] / stats.totalReviews) * 100);
  };

  const getTagLabel = (tag) => {
    return tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Reviews</h1>
          <p className="text-gray-500 mt-1">See what clients think about your work</p>
        </div>

        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : (
          <>
            {/* Statistics Cards */}
            {reviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Average Rating Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <FiStar className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Average Rating</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
                        <p className="text-sm text-gray-500">out of 5</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(parseFloat(stats.averageRating)))}
                    <span className="text-sm text-gray-500">({stats.totalReviews} reviews)</span>
                  </div>
                </div>

                {/* Total Reviews Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FiTrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Reviews</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">From completed jobs</p>
                </div>

                {/* Would Hire Again Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <FiAward className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Would Hire Again</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-gray-900">{stats.wouldHireAgainCount}</p>
                        <p className="text-sm text-gray-500">
                          / {stats.totalReviews}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${stats.totalReviews > 0 ? (stats.wouldHireAgainCount / stats.totalReviews) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {stats.totalReviews > 0 ? Math.round((stats.wouldHireAgainCount / stats.totalReviews) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Rating Breakdown */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-16">
                        <span className="text-sm font-medium text-gray-900">{rating}</span>
                        <FiStar className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gray-900 h-full rounded-full transition-all duration-500"
                          style={{ width: `${getRatingPercentage(rating)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2 w-20 justify-end">
                        <span className="text-sm font-medium text-gray-700">
                          {stats.ratingBreakdown[rating]}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({getRatingPercentage(rating)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FiStar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500 mb-6">
                  Complete jobs to receive reviews from clients
                </p>
                <button
                  onClick={() => navigate('/worker/jobs')}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Reviews</h3>
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all p-6"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        {review.companyInfo?.logo ? (
                          <img
                            src={review.companyInfo.logo}
                            alt={review.companyInfo.companyName}
                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                            <FiBriefcase className="h-6 w-6 text-primary-600" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.companyInfo?.companyName || 'Company'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm font-semibold text-gray-900 ml-1">
                          {review.rating}.0
                        </span>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Project</p>
                      <p className="font-medium text-gray-900">{review.job?.title}</p>
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-700 leading-relaxed mb-4">{review.reviewText}</p>

                    {/* Tags and Would Hire Again */}
                    <div className="flex flex-wrap items-center gap-2">
                      {review.tags && review.tags.length > 0 && (
                        <>
                          {review.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200"
                            >
                              {getTagLabel(tag)}
                            </span>
                          ))}
                        </>
                      )}
                      {review.wouldHireAgain && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                          <FiCheckCircle className="h-3.5 w-3.5" />
                          Would hire again
                        </span>
                      )}
                    </div>
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
