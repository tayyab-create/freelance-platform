import React, { useState } from 'react';
import Button from '../common/Button';
import { FiStar, FiUser } from 'react-icons/fi';

const ReviewModal = ({ job, worker, onSubmit, onClose, loading }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    reviewText: '',
    wouldHireAgain: true,
    tags: [],
  });

  const [hoveredRating, setHoveredRating] = useState(0);

  const availableTags = [
    'professional',
    'quality-work',
    'on-time',
    'great-communication',
    'creative',
    'reliable'
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Review Worker</h2>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            {worker?.profilePicture ? (
              <img
                src={worker.profilePicture}
                alt="Worker"
                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  console.error('Failed to load image:', worker.profilePicture);
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <FiUser className="h-6 w-6 text-primary-600" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Worker</p>
              <p className="font-semibold">{worker?.fullName || worker?.email}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Job</p>
          <p className="font-semibold">{job?.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="label">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <FiStar
                    className={`h-10 w-10 transition ${star <= (hoveredRating || formData.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                      }`}
                  />
                </button>
              ))}
              {formData.rating > 0 && (
                <span className="ml-4 text-lg font-semibold text-gray-700">
                  {formData.rating} / 5
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="label">Review *</label>
            <textarea
              value={formData.reviewText}
              onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
              placeholder="Share your experience working with this freelancer..."
              rows="6"
              required
              minLength={10}
              maxLength={500}
              className="input-field"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.reviewText.length} / 500 characters (min 10)
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${formData.tags.includes(tag)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Would Hire Again */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.wouldHireAgain}
                onChange={(e) => setFormData({ ...formData, wouldHireAgain: e.target.checked })}
                className="h-5 w-5 text-primary-600 rounded"
              />
              <span className="font-medium">I would hire this freelancer again</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Submit Review
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
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