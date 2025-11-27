import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { Modal } from '../../shared';
import Button from '../../common/Button';
import { workerAPI } from '../../../services/api';
import { toast } from '../../../utils/toast';

const ReviewCompanyModal = ({ isOpen, onClose, job, onReviewSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        if (!reviewText.trim() || reviewText.length < 10) {
            toast.error('Please provide a review (min 10 characters)');
            return;
        }

        setLoading(true);
        try {
            await workerAPI.reviewCompany(job.company._id, {
                jobId: job._id,
                rating,
                reviewText
            });
            toast.success('Review submitted successfully');
            if (onReviewSubmit) onReviewSubmit();
            onClose();
        } catch (error) {
            console.error('Review Error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <div className="flex gap-3 w-full justify-end">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
            </Button>
            <Button
                variant="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={loading || rating === 0 || reviewText.length < 10}
            >
                Submit Review
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Review Company"
            size="md"
            footer={footer}
        >
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        How was your experience with {job?.company?.companyName || 'this company'}?
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Your review helps other freelancers make informed decisions.
                    </p>

                    <div className="flex justify-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <FiStar
                                    className={`w-8 h-8 ${star <= (hoveredRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-sm font-medium text-gray-600 h-5">
                        {hoveredRating > 0 ? (
                            ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoveredRating - 1]
                        ) : rating > 0 ? (
                            ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]
                        ) : ''}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Share your experience
                    </label>
                    <div className="relative">
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="What did you like? What could be improved?"
                            className="w-full min-h-[120px] p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                            {reviewText.length} chars
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Minimum 10 characters required.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default ReviewCompanyModal;
