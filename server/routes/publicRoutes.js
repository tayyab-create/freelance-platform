const express = require('express');
const router = express.Router();
const { Review, WorkerProfile, CompanyProfile } = require('../models');

// @desc    Get reviews for a specific worker
// @route   GET /api/public/workers/:workerId/reviews
// @access  Public
router.get('/workers/:workerId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('job', 'title')
      .populate('company', 'email')
      .sort('-createdAt');

    // Get company profiles
    const reviewsWithCompanyInfo = await Promise.all(
      reviews.map(async (review) => {
        const reviewObj = review.toObject();
        if (reviewObj.company) {
          const companyProfile = await CompanyProfile.findOne({ user: reviewObj.company._id });
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
});

module.exports = router;