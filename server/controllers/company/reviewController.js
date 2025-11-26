const { Job, Review, WorkerProfile } = require('../../models');

// @desc    Review a worker
// @route   POST /api/companies/review/:workerId
// @access  Private/Company
exports.reviewWorker = async (req, res) => {
    try {
        const { jobId, rating, reviewText, skills, wouldHireAgain, tags } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }

        // Check if job exists and is completed
        const job = await Job.findOne({
            _id: jobId,
            company: req.user._id,
            assignedWorker: req.params.workerId,
            status: "completed",
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found, not assigned to this worker, or not completed",
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            job: jobId,
            worker: req.params.workerId,
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "Review already submitted for this job",
            });
        }

        // Create review
        const review = await Review.create({
            job: jobId,
            worker: req.params.workerId,
            company: req.user._id,
            rating,
            reviewText,
            skills: skills || [],
            wouldHireAgain: wouldHireAgain !== undefined ? wouldHireAgain : true,
            tags: tags || [],
        });

        // Update worker's average rating
        const allReviews = await Review.find({ worker: req.params.workerId });
        const avgRating =
            allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await WorkerProfile.findOneAndUpdate(
            { user: req.params.workerId },
            {
                averageRating: parseFloat(avgRating.toFixed(2)),
                totalReviews: allReviews.length,
                $inc: { totalJobsCompleted: 1 },
            }
        );

        // Populate review data for response
        const populatedReview = await Review.findById(review._id)
            .populate("job", "title")
            .populate("company", "email")
            .populate("worker", "email");

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: populatedReview,
        });
    } catch (error) {
        console.error("Review Worker Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
