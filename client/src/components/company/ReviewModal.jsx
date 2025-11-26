import React, { useState } from 'react';
import Button from '../common/Button';
import { FiStar, FiUser, FiX, FiCheckCircle } from 'react-icons/fi';

const ReviewModal = ({ job, worker, onSubmit, onClose, loading }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    reviewText: '',
    wouldHireAgain: true,
    tags: [],
  });

  const [hoveredRating, setHoveredRating] = useState(0);

  const availableTags = [
    { value: 'professional', label: 'Professional' },
    { value: 'quality-work', label: 'Quality Work' },
    { value: 'on-time', label: 'On Time' },
    { value: 'great-communication', label: 'Great Communication' },
    { value: 'creative', label: 'Creative' },
    { value: 'reliable', label: 'Reliable' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }
    onSubmit(formData);
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[rating] || '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Worker & Job Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {worker?.profilePicture ? (
              <img
                src={worker.profilePicture}
                alt="Worker"
                className="h-14 w-14 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                <FiUser className="h-7 w-7 text-primary-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">Reviewing</p>
              <p className="font-semibold text-gray-900 truncate">{worker?.fullName || worker?.email}</p>
              <p className="text-sm text-gray-600 truncate">{job?.title}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <FiStar
                      className={`h-10 w-10 transition-colors ${
                        star <= (hoveredRating || formData.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {(hoveredRating || formData.rating) > 0 && (
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {hoveredRating || formData.rating}
                  </span>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">out of 5</p>
                    <p className="text-sm font-medium text-gray-700">
                      {getRatingLabel(hoveredRating || formData.rating)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reviewText}
              onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
              placeholder="Share your experience working with this freelancer..."
              rows="6"
              required
              minLength={10}
              maxLength={500}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">Minimum 10 characters</p>
              <p className={`text-xs font-medium ${
                formData.reviewText.length >= 500 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {formData.reviewText.length} / 500
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Highlight Skills <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => toggleTag(tag.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.tags.includes(tag.value)
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Would Hire Again */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={formData.wouldHireAgain}
                  onChange={(e) => setFormData({ ...formData, wouldHireAgain: e.target.checked })}
                  className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <span className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                  I would hire this freelancer again
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  This helps other companies make informed decisions
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              className="flex-1 justify-center"
              icon={FiCheckCircle}
            >
              Submit Review
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1 justify-center"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
