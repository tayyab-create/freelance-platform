const { Review } = require('../../models');
const { getCompanyProfile } = require('../../utils/companyInfoHelper');

// @desc    Get worker's reviews
// @route   GET /api/workers/reviews
// @access  Private/Worker
exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ worker: req.user._id })
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
        const reviews = await Review.find({ worker: req.params.workerId })
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
