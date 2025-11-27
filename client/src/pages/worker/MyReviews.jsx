import React, { useEffect, useState } from 'react';
import { workerAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiStar, FiBriefcase, FiTrendingUp, FiAward, FiFilter, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { SkeletonLoader, PageHeader, EmptyState, ExpandableText } from '../../components/shared';
import { useNavigate } from 'react-router-dom';

const MyReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState('all');
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    wouldHireAgainCount: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    // Filter reviews based on selected rating
    if (selectedRating === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(r => r.rating === parseInt(selectedRating)));
    }
  }, [selectedRating, reviews]);

  const fetchReviews = async () => {
    try {
      const response = await workerAPI.getMyReviews();
      const reviewData = response.data.data;
      setReviews(reviewData);
      setFilteredReviews(reviewData);

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
            className={`h-5 w-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
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

  const getRatingLabel = (rating) => {
    const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[rating - 1] || '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <PageHeader
          title="My Reviews"
          subtitle="See what clients think about your work"
          breadcrumbs={[
            { label: 'Dashboard', href: '/worker/dashboard' },
            { label: 'Reviews' }
          ]}
          actions={
            reviews.length > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-br from-yellow-500 to-orange-600 px-6 py-3 rounded-2xl shadow-lg">
                <FiStar className="w-5 h-5 text-white fill-white" />
                <p className="text-white font-bold text-lg">{stats.averageRating} Rating</p>
              </div>
            )
          }
        />

        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : (
          <>
            {/* Statistics Cards */}
            {reviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Average Rating Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-yellow-50 rounded-xl">
                      <FiStar className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Average Rating</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-gray-900">{stats.averageRating}</p>
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
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <FiTrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Reviews</p>
                      <p className="text-3xl font-black text-gray-900">{stats.totalReviews}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">From completed jobs</p>
                </div>

                {/* Would Hire Again Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <FiAward className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Would Hire Again</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-gray-900">{stats.wouldHireAgainCount}</p>
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
                    <span className="text-sm font-bold text-gray-700">
                      {stats.totalReviews > 0 ? Math.round((stats.wouldHireAgainCount / stats.totalReviews) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Rating Breakdown */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Rating Breakdown</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-16">
                        <span className="text-sm font-bold text-gray-900">{rating}</span>
                        <FiStar className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${getRatingPercentage(rating)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2 w-20 justify-end">
                        <span className="text-sm font-bold text-gray-700">
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

            {/* Filter Section */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-gray-700 font-bold">
                    <FiFilter className="h-5 w-5" />
                    <span>Filter by Rating:</span>
                  </div>
                  <button
                    onClick={() => setSelectedRating('all')}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      selectedRating === 'all'
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({reviews.length})
                  </button>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(rating.toString())}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                        selectedRating === rating.toString()
                          ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rating}
                      <FiStar className={`h-4 w-4 ${selectedRating === rating.toString() ? 'fill-white' : ''}`} />
                      <span className="text-xs">({stats.ratingBreakdown[rating]})</span>
                    </button>
                  ))}
                  {selectedRating !== 'all' && (
                    <button
                      onClick={() => setSelectedRating('all')}
                      className="ml-auto px-4 py-2 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                      <FiX className="h-4 w-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <EmptyState
                icon={FiStar}
                title="No reviews yet"
                description="Complete jobs to receive reviews from clients"
                actionLabel="Browse Jobs"
                onAction={() => navigate('/worker/jobs')}
              />
            ) : filteredReviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FiStar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-500 mb-6">
                  No reviews match the selected filter
                </p>
                <button
                  onClick={() => setSelectedRating('all')}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  Clear Filter
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedRating === 'all' ? 'All Reviews' : `${selectedRating}-Star Reviews`}
                  </h3>
                  <span className="text-sm text-gray-500">
                    Showing {filteredReviews.length} of {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {filteredReviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all p-6 shadow-sm hover:shadow-md"
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
                          <h4 className="font-bold text-gray-900">
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
                      <div className="flex flex-col items-start sm:items-end gap-1">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm font-bold text-gray-900 ml-1">
                            {review.rating}.0
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-500">
                          {getRatingLabel(review.rating)}
                        </span>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Project</p>
                      <p className="font-bold text-gray-900">{review.job?.title}</p>
                    </div>

                    {/* Review Text */}
                    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 mb-4">
                      <ExpandableText
                        text={review.reviewText}
                        limit={200}
                        textClassName="text-gray-700 leading-relaxed"
                      />
                    </div>

                    {/* Tags and Would Hire Again */}
                    <div className="flex flex-wrap items-center gap-2">
                      {review.tags && review.tags.length > 0 && (
                        <>
                          {review.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-xl border border-purple-200"
                            >
                              {getTagLabel(tag)}
                            </span>
                          ))}
                        </>
                      )}
                      {review.wouldHireAgain && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
                          <FiAward className="h-3.5 w-3.5" />
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
