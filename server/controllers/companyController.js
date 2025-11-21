const {
  CompanyProfile,
  Job,
  Application,
  Submission,
  Review,
  WorkerProfile,
} = require("../models");

// @desc    Get company profile
// @route   GET /api/companies/profile
// @access  Private/Company
exports.getProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Update company profile
// @route   PUT /api/companies/profile
// @access  Private/Company
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "companyName",
      "logo",
      "tagline",
      "description",
      "website",
      "linkedinProfile",
      "industry",
      "companySize",
      "address",
      "contactPerson",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const profile = await CompanyProfile.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Post a new job
// @route   POST /api/companies/jobs
// @access  Private/Company
exports.postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      salary,
      salaryType,
      duration,
      experienceLevel,
      requirements,
      deadline,
    } = req.body;

    const job = await Job.create({
      company: req.user._id,
      title,
      description,
      category,
      tags,
      salary,
      salaryType,
      duration,
      experienceLevel,
      requirements,
      deadline,
    });

    // Update company's total jobs posted
    await CompanyProfile.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { totalJobsPosted: 1 } }
    );

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      data: job,
    });
  } catch (error) {
    console.error("Post Job Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get company's posted jobs
// @route   GET /api/companies/jobs
// @access  Private/Company
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.user._id })
      .populate("assignedWorker", "email")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Get Jobs Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get applications for a specific job
// @route   GET /api/companies/jobs/:jobId/applications
// @access  Private/Company
// @desc    Get applications for a specific job
// @route   GET /api/companies/jobs/:jobId/applications
// @access  Private/Company
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      company: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate({
        path: "worker",
        select: "email role status",
      })
      .sort("-createdAt");

    // Get worker profiles for each application
    const applicationsWithWorkerInfo = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();
        if (appObj.worker) {
          const workerProfile = await WorkerProfile.findOne({
            user: appObj.worker._id,
          });
          if (workerProfile) {
            appObj.workerInfo = {
              fullName: workerProfile.fullName,
              profilePicture: workerProfile.profilePicture,
              skills: workerProfile.skills,
              hourlyRate: workerProfile.hourlyRate,
              averageRating: workerProfile.averageRating,
              totalReviews: workerProfile.totalReviews,
            };
          }
        }
        return appObj;
      })
    );

    res.status(200).json({
      success: true,
      count: applicationsWithWorkerInfo.length,
      data: applicationsWithWorkerInfo,
    });
  } catch (error) {
    console.error("Get Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Assign job to a worker
// @route   PUT /api/companies/jobs/:jobId/assign
// @access  Private/Company
exports.assignJob = async (req, res) => {
  try {
    const { workerId, applicationId } = req.body;

    const job = await Job.findOne({
      _id: req.params.jobId,
      company: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status !== "posted") {
      return res.status(400).json({
        success: false,
        message: "Job is not available for assignment",
      });
    }

    // Update job
    job.assignedWorker = workerId;
    job.status = "assigned";
    job.assignedDate = Date.now();
    await job.save();

    // Update application status
    await Application.findByIdAndUpdate(applicationId, {
      status: "accepted",
      respondedAt: Date.now(),
    });

    // Reject other applications
    await Application.updateMany(
      { job: req.params.jobId, _id: { $ne: applicationId } },
      { status: "rejected", respondedAt: Date.now() }
    );

    res.status(200).json({
      success: true,
      message: "Job assigned successfully",
      data: job,
    });
  } catch (error) {
    console.error("Assign Job Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get submissions for company's jobs
// @route   GET /api/companies/submissions
// @access  Private/Company
exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ company: req.user._id })
      .populate("job", "title description salary status")
      .populate("worker", "email")
      .sort("-createdAt");

    // Get worker profiles and check if reviews exist for each submission
    const submissionsWithDetails = await Promise.all(
      submissions.map(async (submission) => {
        const submissionObj = submission.toObject();

        // Get worker profile
        if (submissionObj.worker) {
          const workerProfile = await WorkerProfile.findOne({
            user: submissionObj.worker._id,
          });
          if (workerProfile) {
            submissionObj.workerInfo = {
              fullName: workerProfile.fullName,
              profilePicture: workerProfile.profilePicture,
              skills: workerProfile.skills,
              averageRating: workerProfile.averageRating,
              totalReviews: workerProfile.totalReviews,
            };
          }
        }

        // Check if review exists
        const reviewExists = await Review.findOne({
          job: submission.job._id,
          worker: submission.worker._id,
          company: req.user._id,
        });

        submissionObj.hasReview = !!reviewExists;

        return submissionObj;
      })
    );

    res.status(200).json({
      success: true,
      count: submissionsWithDetails.length,
      data: submissionsWithDetails,
    });
  } catch (error) {
    console.error("Get Submissions Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Review and complete a job
// @route   PUT /api/companies/jobs/:jobId/complete
// @access  Private/Company
exports.completeJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      company: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status !== "submitted") {
      return res.status(400).json({
        success: false,
        message: "Job must be in submitted status to complete",
      });
    }

    job.status = "completed";
    await job.save();

    // Update submission status
    await Submission.findOneAndUpdate(
      { job: req.params.jobId },
      { status: "approved", reviewedAt: Date.now() }
    );

    // Update company's completed jobs count
    await CompanyProfile.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { totalJobsCompleted: 1 } }
    );

    res.status(200).json({
      success: true,
      message: "Job completed successfully",
      data: job,
    });
  } catch (error) {
    console.error("Complete Job Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Review a worker
// @route   POST /api/companies/review/:workerId
// @access  Private/Company
exports.reviewWorker = async (req, res) => {
  try {
    const { jobId, rating, reviewText, skills, wouldHireAgain, tags } =
      req.body;

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

// @desc    Get company dashboard stats
// @route   GET /api/companies/dashboard
// @access  Private/Company
exports.getDashboard = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ user: req.user._id });

    const totalJobs = await Job.countDocuments({ company: req.user._id });
    const activeJobs = await Job.countDocuments({
      company: req.user._id,
      status: "posted",
    });
    const assignedJobs = await Job.countDocuments({
      company: req.user._id,
      status: { $in: ["assigned", "in-progress"] },
    });
    const completedJobs = await Job.countDocuments({
      company: req.user._id,
      status: "completed",
    });

    const totalApplications = await Application.countDocuments({
      job: { $in: await Job.find({ company: req.user._id }).distinct("_id") },
    });

    res.status(200).json({
      success: true,
      data: {
        profile: {
          name: profile.companyName,
          rating: profile.averageRating,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          assigned: assignedJobs,
          completed: completedJobs,
        },
        applications: {
          total: totalApplications,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
