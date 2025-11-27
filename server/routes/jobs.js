const express = require('express');
const router = express.Router();
const { Job, CompanyProfile, Application, User } = require('../models');
const { protect, checkApproval } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Helper to get user from token (optional auth)
const getUserFromToken = async (req) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select('-password');
  } catch (error) {
    return null;
  }
};

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
      limit = 10,
      sortBy
    } = req.query;

    let query = { status: 'posted', isActive: true };

    // Check for authenticated user to filter applied jobs
    const user = await getUserFromToken(req);
    if (user && user.role === 'worker') {
      // Find applications where status is NOT rejected (i.e., pending, accepted)
      // If rejected, user can see the job again to re-apply
      const applications = await Application.find({
        worker: user._id,
        status: { $ne: 'rejected' }
      }).select('job');

      const appliedJobIds = applications.map(app => app.job);

      if (appliedJobIds.length > 0) {
        query._id = { $nin: appliedJobIds };
      }
    }

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
      const searchRegex = { $regex: search, $options: 'i' };
      const searchQuery = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ];

      // If we already have an _id filter (from applied jobs), we need to be careful with $or
      // But $or is top-level usually. 
      // If query._id exists, we can't just overwrite query.$or if we want AND logic.
      // Actually, Mongoose/MongoDB handles top-level implicit AND.
      // So query.$or = [...] works alongside query._id = ...
      query.$or = searchQuery;
    }

    const skip = (page - 1) * limit;

    // Determine sort order
    let sort = '-createdAt';
    if (sortBy) {
      switch (sortBy) {
        case 'oldest':
          sort = 'createdAt';
          break;
        case 'salary-high':
          sort = '-salary';
          break;
        case 'salary-low':
          sort = 'salary';
          break;
        case 'deadline':
          sort = 'deadline';
          break;
        case 'newest':
        default:
          sort = '-createdAt';
      }
    }

    // Populate company information correctly
    const jobs = await Job.find(query)
      .populate({
        path: 'company',
        select: 'email role'
      })
      .sort(sort)
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

    // Check for authenticated user to get application status
    const user = await getUserFromToken(req);
    console.log('Debug - Job Details - User:', user ? `${user._id} (${user.role})` : 'No user');

    if (user && user.role === 'worker') {
      const application = await Application.findOne({
        job: job._id,
        worker: user._id
      }).sort('-createdAt'); // Get most recent if multiple (though unique index prevents it usually)

      console.log('Debug - Job Details - Application found:', application ? application.status : 'None');

      if (application) {
        jobObj.applicationStatus = application.status;
      }
    }

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