const express = require('express');
const router = express.Router();
const { Job, CompanyProfile } = require('../models');
const { protect, checkApproval } = require('../middleware/auth');

// @desc    Get all jobs with filters and search
// @route   GET /api/jobs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      experienceLevel,
      salaryType,
      search,
      minSalary,
      maxSalary,
      page = 1,
      limit = 10
    } = req.query;

    let query = { status: 'posted', isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by experience level
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Filter by salary type
    if (salaryType) {
      query.salaryType = salaryType;
    }

    // Filter by salary range
    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) query.salary.$gte = Number(minSalary);
      if (maxSalary) query.salary.$lte = Number(maxSalary);
    }

    // Search in title, description, and tags using Regex for partial matching
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    // Populate company information correctly
    const jobs = await Job.find(query)
      .populate({
        path: 'company',
        select: 'email role'
      })
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip);

    // Get company profiles separately
    const jobsWithCompanyInfo = await Promise.all(
      jobs.map(async (job) => {
        const jobObj = job.toObject();
        if (jobObj.company) {
          const companyProfile = await CompanyProfile.findOne({ user: jobObj.company._id });
          jobObj.companyInfo = companyProfile ? {
            companyName: companyProfile.companyName,
            logo: companyProfile.logo,
            tagline: companyProfile.tagline
          } : null;
        }
        return jobObj;
      })
    );

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobsWithCompanyInfo.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: jobsWithCompanyInfo
    });
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single job details
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate({
        path: 'company',
        select: 'email role'
      })
      .populate('assignedWorker', 'email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const jobObj = job.toObject();

    // Get company profile separately
    if (jobObj.company) {
      const companyProfile = await CompanyProfile.findOne({ user: jobObj.company._id });
      jobObj.companyInfo = companyProfile ? {
        companyName: companyProfile.companyName,
        logo: companyProfile.logo,
        tagline: companyProfile.tagline,
        description: companyProfile.description,
        website: companyProfile.website,
        linkedinProfile: companyProfile.linkedinProfile,
        industry: companyProfile.industry,
        companySize: companyProfile.companySize
      } : null;
    }

    res.status(200).json({
      success: true,
      data: jobObj
    });
  } catch (error) {
    console.error('Get Job Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get job categories
// @route   GET /api/jobs/meta/categories
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Job.distinct('category');

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;