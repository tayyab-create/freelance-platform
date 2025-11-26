const { Job, Application } = require('../../models');
const { enrichWithWorkerInfo } = require('../../utils/workerInfoHelper');

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

        // Enrich with worker profile information
        const applicationsWithWorkerInfo = await enrichWithWorkerInfo(applications);

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
