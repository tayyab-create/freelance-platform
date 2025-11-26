const { Job, CompanyProfile } = require('../../models');

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
