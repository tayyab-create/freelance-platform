const { Review, Job, CompanyProfile, WorkerProfile } = require('../../models');
const { getCompanyProfile } = require('../../utils/companyInfoHelper');
const notificationService = require('../../services/notificationService');

// @desc    Get worker's reviews (reviews received from companies)
// @route   GET /api/workers/reviews
// @access  Private/Worker
exports.getMyReviews = async (req, res) => {
    try {
        // Only get reviews where companies reviewed the worker, not reviews the worker wrote about companies
        const reviews = await Review.find({
            worker: req.user._id,
            reviewedBy: 'company'
        })
            .populate('job', 'title')
            .populate({
                path: 'company',
                select: 'email',
            })
            .sort('-createdAt');

        // Get company profiles
        const reviewsWithCompanyInfo = await Promise.all(
            reviews.map(async (review) => {
                const reviewObj = review.toObject();
                if (reviewObj.company) {
                    const companyProfile = await getCompanyProfile(reviewObj.company._id);
                    if (companyProfile) {
                        reviewObj.companyInfo = {
                            companyName: companyProfile.companyName,
                            logo: companyProfile.logo
                        };
                    }
                }
                return reviewObj;
            })
        );

        res.status(200).json({
            success: true,
            count: reviewsWithCompanyInfo.length,
            data: reviewsWithCompanyInfo
        });
    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get reviews for a specific worker (public)
// @route   GET /api/workers/:workerId/reviews
// @access  Public
exports.getWorkerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            worker: req.params.workerId,
            reviewedBy: 'company'
        })
            .populate('job', 'title')
            .populate({
                path: 'company',
                select: 'email',
            })
            .sort('-createdAt');

        // Get company profiles
        const reviewsWithCompanyInfo = await Promise.all(
            reviews.map(async (review) => {
                const reviewObj = review.toObject();
                if (reviewObj.company) {
                    const companyProfile = await getCompanyProfile(reviewObj.company._id);
                    if (companyProfile) {
                        reviewObj.companyInfo = {
                            companyName: companyProfile.companyName,
                            logo: companyProfile.logo
                        };
                    }
                }
                return reviewObj;
            })
        );

        res.status(200).json({
            success: true,
            count: reviewsWithCompanyInfo.length,
            data: reviewsWithCompanyInfo
        });
    } catch (error) {
        console.error('Get Worker Reviews Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get reviews for a specific job
// @route   GET /api/workers/jobs/:jobId/reviews
// @access  Private/Worker
exports.getJobReviews = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Check if job exists and worker is assigned
        const job = await Job.findOne({
            _id: jobId,
            assignedWorker: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or not assigned to you'
            });
        }

        // Fetch both reviews for this job
        const [workerReview, companyReview] = await Promise.all([
            Review.findOne({
                job: jobId,
                worker: req.user._id,
                reviewedBy: 'worker'
            }).populate('company', 'email'),
            Review.findOne({
                job: jobId,
                worker: req.user._id,
                reviewedBy: 'company'
            }).populate('company', 'email')
        ]);

        // Get company profile info and worker profile info if reviews exist
        let workerReviewData = null;
        let companyReviewData = null;

        // Get worker profile for displaying worker's own avatar
        const workerProfile = await WorkerProfile.findOne({ user: req.user._id });

        if (workerReview) {
            const reviewObj = workerReview.toObject();
            if (reviewObj.company) {
                const companyProfile = await getCompanyProfile(reviewObj.company._id);
                if (companyProfile) {
                    reviewObj.companyInfo = {
                        companyName: companyProfile.companyName,
                        logo: companyProfile.logo
                    };
                }
            }
            // Add worker's own profile info for their review
            if (workerProfile) {
                reviewObj.workerInfo = {
                    fullName: workerProfile.fullName,
                    profilePicture: workerProfile.profilePicture
                };
            }
            workerReviewData = reviewObj;
        }

        if (companyReview) {
            const reviewObj = companyReview.toObject();
            if (reviewObj.company) {
                const companyProfile = await getCompanyProfile(reviewObj.company._id);
                if (companyProfile) {
                    reviewObj.companyInfo = {
                        companyName: companyProfile.companyName,
                        logo: companyProfile.logo
                    };
                }
            }
            companyReviewData = reviewObj;
        }

        res.status(200).json({
            success: true,
            data: {
                workerReview: workerReviewData,
                companyReview: companyReviewData,
                hasWorkerReviewed: !!workerReview,
                hasCompanyReviewed: !!companyReview
            }
        });
    } catch (error) {
        console.error('Get Job Reviews Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Review a company
// @route   POST /api/workers/review/:companyId
// @access  Private/Worker
exports.reviewCompany = async (req, res) => {
    try {
        const { jobId, rating, reviewText } = req.body;

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
            company: req.params.companyId,
            assignedWorker: req.user._id,
            status: "completed",
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found, not assigned to you, or not completed",
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            job: jobId,
            worker: req.user._id,
            reviewedBy: 'worker'
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed the company for this job",
            });
        }

        // Create review
        const review = await Review.create({
            job: jobId,
            worker: req.user._id,
            company: req.params.companyId,
            rating,
            reviewText,
            reviewedBy: 'worker'
        });

        // Update company's average rating
        const allReviews = await Review.find({ company: req.params.companyId, reviewedBy: 'worker' });

        // Calculate average rating, handling case where there are no reviews yet
        const avgRating = allReviews.length > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            : 0;

        await CompanyProfile.findOneAndUpdate(
            { user: req.params.companyId },
            {
                averageRating: parseFloat(avgRating.toFixed(2)),
                totalReviews: allReviews.length,
            }
        );

        // Notify company about new review
        await notificationService.createNotification(
            req.params.companyId,
            'review',
            'New Review Received',
            `You received a ${rating}-star review for "${job.title}"`,
            `/company/reviews`,
            {
                jobId: jobId,
                reviewId: review._id,
                rating: rating
            }
        );

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: review,
        });
    } catch (error) {
        console.error("Review Company Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
