const { WorkerProfile, Job, Application, Submission, CompanyProfile, Review } = require('../models');

// @desc    Get worker profile
// @route   GET /api/workers/profile
// @access  Private/Worker
exports.getProfile = async (req, res) => {
  try {
    // 1️⃣ Fetch worker profile
    const profile = await WorkerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // 2️⃣ Fetch all reviews for this worker
    const reviews = await Review.find({ worker: req.user._id })
      .populate("job", "title")
      .populate("company", "email")
      .sort({ createdAt: -1 });

    // 3️⃣ Add company profile info (name & logo)
    const formattedReviews = await Promise.all(
      reviews.map(async (rev) => {
        const companyProfile = await CompanyProfile.findOne({ user: rev.company._id });

        return {
          rating: rev.rating,
          reviewText: rev.reviewText,
          tags: rev.tags,
          wouldHireAgain: rev.wouldHireAgain,
          createdAt: rev.createdAt,
          jobTitle: rev.job?.title || "N/A",

          // WHAT YOUR UI EXPECTS
          companyName: companyProfile?.companyName || "Client",
          companyLogo: companyProfile?.logo || null,
        };
      })
    );

    // 4️⃣ Calculate total & average rating
    const totalReviews = formattedReviews.length;

    const averageRating =
      totalReviews > 0
        ? formattedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    // 5️⃣ Get ONLY the recent 3 reviews for frontend
    const recentReviews = formattedReviews.slice(0, 3);

    // 6️⃣ Send all data to frontend
    res.status(200).json({
      success: true,
      data: {
        ...profile.toObject(),
        totalReviews,
        averageRating,
        recentReviews
      }
    });

  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


// @desc    Update worker profile
// @route   PUT /api/workers/profile
// @access  Private/Worker
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'fullName', 'phone', 'bio', 'skills', 'githubProfile',
      'linkedinProfile', 'hourlyRate', 'availability', 'profilePicture'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const profile = await WorkerProfile.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add certification
// @route   POST /api/workers/profile/certifications
// @access  Private/Worker
exports.addCertification = async (req, res) => {
  try {
    const { title, issuedBy, issuedDate, certificateUrl } = req.body;

    const profile = await WorkerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.certifications.push({ title, issuedBy, issuedDate, certificateUrl });
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Certification added successfully',
      data: profile
    });
  } catch (error) {
    console.error('Add Certification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add experience
// @route   POST /api/workers/profile/experience
// @access  Private/Worker
exports.addExperience = async (req, res) => {
  try {
    const { title, company, startDate, endDate, current, description } = req.body;

    const profile = await WorkerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.experience.push({ title, company, startDate, endDate, current, description });
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Experience added successfully',
      data: profile
    });
  } catch (error) {
    console.error('Add Experience Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Apply for a job
// @route   POST /api/workers/apply/:jobId
// @access  Private/Worker
exports.applyForJob = async (req, res) => {
  try {
    const { proposal, proposedRate, coverLetter, estimatedDuration } = req.body;
    const jobId = req.params.jobId;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if job is still available
    if (job.status !== 'posted') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      worker: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      worker: req.user._id,
      proposal,
      proposedRate,
      coverLetter,
      estimatedDuration
    });

    // Update job's total applications count
    job.totalApplications += 1;
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Apply for Job Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get worker's applications
// @route   GET /api/workers/applications
// @access  Private/Worker
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ worker: req.user._id })
      .populate({
        path: 'job',
        select: 'title description salary status company',
        populate: {
          path: 'company',
          select: 'email role'
        }
      })
      .sort('-createdAt');

    // Get company profiles for each application
    const applicationsWithCompanyInfo = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();
        if (appObj.job && appObj.job.company) {
          const companyProfile = await CompanyProfile.findOne({ user: appObj.job.company._id });
          if (companyProfile) {
            appObj.job.companyInfo = {
              companyName: companyProfile.companyName,
              logo: companyProfile.logo
            };
          }
        }
        return appObj;
      })
    );

    // Filter out applications where job is null (deleted jobs)
    const validApplications = applicationsWithCompanyInfo.filter(app => app.job);
    const deletedCount = applicationsWithCompanyInfo.length - validApplications.length;

    res.status(200).json({
      success: true,
      count: validApplications.length,
      deletedCount: deletedCount,
      data: validApplications
    });
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get assigned jobs
// @route   GET /api/workers/jobs/assigned
// @access  Private/Worker
exports.getAssignedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      assignedWorker: req.user._id,
      status: { $in: ['assigned', 'in-progress'] }
    })
      .populate('company', 'email')
      .sort('-assignedDate');

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Get Assigned Jobs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Submit work for a job
// @route   POST /api/workers/submit/:jobId
// @access  Private/Worker
exports.submitWork = async (req, res) => {
  try {
    const { description, links, files } = req.body;
    const jobId = req.params.jobId;

    // Check if job exists and is assigned to this worker
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

    // Check if already submitted
    const existingSubmission = await Submission.findOne({ job: jobId });
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Work already submitted for this job'
      });
    }

    // Create submission
    const submission = await Submission.create({
      job: jobId,
      worker: req.user._id,
      company: job.company,
      description,
      links: links || [],
      files: files || []
    });

    // Update job status
    job.status = 'submitted';
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Work submitted successfully',
      data: submission
    });
  } catch (error) {
    console.error('Submit Work Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get worker dashboard stats
// @route   GET /api/workers/dashboard
// @access  Private/Worker
exports.getDashboard = async (req, res) => {
  try {
    // Get or create profile
    let profile = await WorkerProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await WorkerProfile.create({
        user: req.user._id,
        fullName: req.user.email.split('@')[0]
      });
    }

    // Helper function to count applications with valid jobs
    const countValidApplications = async (query = {}) => {
      const result = await Application.aggregate([
        { $match: { worker: req.user._id, ...query } },
        { $lookup: { from: 'jobs', localField: 'job', foreignField: '_id', as: 'jobData' } },
        { $match: { 'jobData.0': { $exists: true } } },
        { $count: 'count' }
      ]);
      return result.length > 0 ? result[0].count : 0;
    };

    // Basic counts (Filtered for deleted jobs)
    const totalApplications = await countValidApplications();
    const pendingApplications = await countValidApplications({ status: 'pending' });
    const acceptedApplications = await countValidApplications({ status: 'accepted' });

    // For jobs, we query the Job model directly, so deleted jobs are naturally excluded
    const activeJobs = await Job.countDocuments({ assignedWorker: req.user._id, status: { $in: ['assigned', 'in-progress'] } });
    const completedJobs = await Job.countDocuments({ assignedWorker: req.user._id, status: 'completed' });

    // Monthly Applications Trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // We need to filter trends too, but for simplicity and performance in aggregation, 
    // we might accept that historical trend data includes deleted jobs, 
    // OR we can add the lookup to the trend aggregation. Let's add the lookup.
    const applicationsTrend = await Application.aggregate([
      { $match: { worker: req.user._id, createdAt: { $gte: sixMonthsAgo } } },
      { $lookup: { from: 'jobs', localField: 'job', foreignField: '_id', as: 'jobData' } },
      { $match: { 'jobData.0': { $exists: true } } }, // Filter out deleted jobs
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          applications: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedApplicationsTrend = applicationsTrend.map(item => ({
      month: monthNames[item._id.month - 1],
      applications: item.applications,
      accepted: item.accepted
    }));

    // Monthly Earnings Trend
    const completedJobsData = await Job.find({
      assignedWorker: req.user._id,
      status: 'completed',
      completedDate: { $gte: sixMonthsAgo }
    }).select('salary completedDate');

    const earningsByMonth = {};
    completedJobsData.forEach(job => {
      if (job.completedDate) {
        const monthKey = `${job.completedDate.getFullYear()}-${job.completedDate.getMonth()}`;
        earningsByMonth[monthKey] = (earningsByMonth[monthKey] || 0) + (job.salary || 0);
      }
    });

    const earningsTrend = Object.keys(earningsByMonth).map(key => {
      const [year, monthIndex] = key.split('-');
      return { month: monthNames[parseInt(monthIndex)], earnings: earningsByMonth[key] };
    });

    const totalEarnings = Object.values(earningsByMonth).reduce((sum, val) => sum + val, 0);

    // Recent Activities
    const recentActivities = [];
    const recentApps = await Application.find({ worker: req.user._id }).sort('-createdAt').limit(10).populate('job', 'title');
    recentApps.forEach(app => {
      if (app.job) recentActivities.push({ id: app._id, action: `Applied to ${app.job.title}`, time: app.createdAt, type: 'application' });
    });

    const recentCompletedJobs = await Job.find({ assignedWorker: req.user._id, status: 'completed' }).sort('-completedDate').limit(3).select('title completedDate');
    recentCompletedJobs.forEach(job => {
      recentActivities.push({ id: job._id, action: `Completed project: ${job.title}`, time: job.completedDate, type: 'job_completed' });
    });

    const recentReviews = await Review.find({ worker: req.user._id }).sort('-createdAt').limit(3).populate('company', 'email');
    for (const review of recentReviews) {
      let companyName = 'Client';
      if (review.company) {
        const companyProfile = await CompanyProfile.findOne({ user: review.company._id });
        if (companyProfile) companyName = companyProfile.companyName;
      }
      recentActivities.push({ id: review._id, action: `Received ${review.rating}-star review from ${companyName}`, time: review.createdAt, type: 'review' });
    }

    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const topActivities = recentActivities.slice(0, 10);

    // Upcoming Deadlines
    const upcomingDeadlines = await Job.find({
      assignedWorker: req.user._id,
      status: { $in: ['assigned', 'in-progress'] },
      deadline: { $exists: true, $gte: new Date() }
    }).sort('deadline').limit(5).select('title deadline');

    const formattedDeadlines = upcomingDeadlines.map(job => {
      const daysUntil = Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      let deadlineText, priority;
      if (daysUntil <= 2) { deadlineText = `${daysUntil} days`; priority = 'high'; }
      else if (daysUntil <= 5) { deadlineText = `${daysUntil} days`; priority = 'medium'; }
      else if (daysUntil <= 7) { deadlineText = '1 week'; priority = 'low'; }
      else { deadlineText = `${Math.ceil(daysUntil / 7)} weeks`; priority = 'low'; }
      return { id: job._id, project: job.title, deadline: deadlineText, priority };
    });

    // Achievements
    const achievements = [
      { id: 1, title: 'Rising Star', description: 'Complete 5 jobs', unlocked: completedJobs >= 5, icon: '⭐' },
      { id: 2, title: 'Perfect Score', description: 'Maintain 5.0 rating', unlocked: (profile.averageRating || 0) >= 5.0 && (profile.totalReviews || 0) >= 3, icon: '🏆' },
      { id: 3, title: 'Speed Demon', description: 'Complete job in 24hrs', unlocked: false, icon: '⚡' },
      { id: 4, title: 'Century Club', description: 'Earn $10,000', unlocked: totalEarnings >= 10000, icon: '💰' }
    ];

    // ===== TREND CALCULATIONS =====
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // 1. Total Applications Trend (Filtered)
    const countAppsTrend = async (startDate, endDate) => {
      const query = { createdAt: { $gte: startDate } };
      if (endDate) query.createdAt.$lt = endDate;
      return await countValidApplications(query);
    };

    const appsLast30Days = await countAppsTrend(thirtyDaysAgo);
    const appsPrevious30Days = await countAppsTrend(sixtyDaysAgo, thirtyDaysAgo);
    const appsTrend = appsPrevious30Days > 0 ? Math.round(((appsLast30Days - appsPrevious30Days) / appsPrevious30Days) * 100) : (appsLast30Days > 0 ? 100 : 0);

    // 2. Pending Applications Trend (Filtered)
    const pendingNow = pendingApplications;
    const pending30DaysAgo = await countValidApplications({ status: 'pending', createdAt: { $lte: thirtyDaysAgo } });
    const pendingTrend = pending30DaysAgo > 0 ? Math.round(((pendingNow - pending30DaysAgo) / pending30DaysAgo) * 100) : (pendingNow > 0 ? 100 : 0);

    // 3. Active Jobs Trend
    const activeNow = activeJobs;
    const active30DaysAgo = await Job.countDocuments({
      assignedWorker: req.user._id,
      status: { $in: ['assigned', 'in-progress'] },
      assignedDate: { $lte: thirtyDaysAgo }
    });
    const activeTrend = active30DaysAgo > 0 ? Math.round(((activeNow - active30DaysAgo) / active30DaysAgo) * 100) : (activeNow > 0 ? 100 : 0);

    // 4. Completed Jobs Trend
    const jobsLast30Days = completedJobsData.filter(j => j.completedDate && j.completedDate >= thirtyDaysAgo).length;
    const jobsPrevious30Days = completedJobsData.filter(j => j.completedDate && j.completedDate >= sixtyDaysAgo && j.completedDate < thirtyDaysAgo).length;
    const jobsTrend = jobsPrevious30Days > 0 ? Math.round(((jobsLast30Days - jobsPrevious30Days) / jobsPrevious30Days) * 100) : (jobsLast30Days > 0 ? 100 : 0);

    // RESPONSE
    res.status(200).json({
      success: true,
      data: {
        profile: {
          ...profile.toObject(),
          name: profile.fullName,
          rating: profile.averageRating || 0,
          totalReviews: profile.totalReviews || 0,
          availability: profile.availability
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          accepted: acceptedApplications
        },
        jobs: {
          active: activeJobs,
          completed: completedJobs
        },
        earnings: {
          total: totalEarnings
        },
        trends: {
          applications: appsTrend,
          pending: pendingTrend,
          activeJobs: activeTrend,
          completedJobs: jobsTrend
        },
        applicationsTrend: formattedApplicationsTrend,
        earningsTrend: earningsTrend,
        recentActivities: topActivities,
        upcomingDeadlines: formattedDeadlines,
        achievements: achievements
      }
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


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
};

// @desc    Update experience
// @route   PUT /api/workers/profile/experience/:expId
// @access  Private/Worker
exports.updateExperience = async (req, res) => {
  try {
    const { title, company, startDate, endDate, current, description } = req.body;
    const expId = req.params.expId;

    const profile = await WorkerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const experience = profile.experience.id(expId);
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    experience.title = title || experience.title;
    experience.company = company || experience.company;
    experience.startDate = startDate || experience.startDate;
    experience.endDate = endDate;
    experience.current = current !== undefined ? current : experience.current;
    experience.description = description || experience.description;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Experience updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update Experience Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete experience
// @route   DELETE /api/workers/profile/experience/:expId
// @access  Private/Worker
exports.deleteExperience = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.experience.pull(req.params.expId);
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Experience deleted successfully',
      data: profile
    });
  } catch (error) {
    console.error('Delete Experience Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update certification
// @route   PUT /api/workers/profile/certifications/:certId
// @access  Private/Worker
exports.updateCertification = async (req, res) => {
  try {
    const { title, issuedBy, issuedDate, certificateUrl } = req.body;
    const certId = req.params.certId;

    const profile = await WorkerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const certification = profile.certifications.id(certId);
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    certification.title = title || certification.title;
    certification.issuedBy = issuedBy || certification.issuedBy;
    certification.issuedDate = issuedDate || certification.issuedDate;
    certification.certificateUrl = certificateUrl || certification.certificateUrl;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Certification updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update Certification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete certification
// @route   DELETE /api/workers/profile/certifications/:certId
// @access  Private/Worker
exports.deleteCertification = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.certifications.pull(req.params.certId);
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Certification deleted successfully',
      data: profile
    });
  } catch (error) {
    console.error('Delete Certification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};