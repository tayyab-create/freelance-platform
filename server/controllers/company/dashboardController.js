const { CompanyProfile, Job, Application } = require('../../models');

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
                    ...profile.toObject(),
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
