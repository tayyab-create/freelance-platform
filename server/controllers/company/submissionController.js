const { Job, Submission, Review, CompanyProfile } = require('../../models');
const { getWorkerProfile } = require('../../utils/workerInfoHelper');

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
                    const workerProfile = await getWorkerProfile(submissionObj.worker._id);
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

                // Check if review exists (only if both job and worker exist)
                let reviewExists = null;
                if (submission.job && submission.worker) {
                    reviewExists = await Review.findOne({
                        job: submission.job._id,
                        worker: submission.worker._id,
                        company: req.user._id,
                    });
                }

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

// @desc    Request revision for a job submission
// @route   PUT /api/companies/jobs/:jobId/revision
// @access  Private/Company
exports.requestRevision = async (req, res) => {
    try {
        const { feedback, newDeadline, attachments } = req.body;

        if (!feedback || !newDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Feedback and new deadline are required'
            });
        }

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
                message: "Can only request revision for submitted jobs",
            });
        }

        // Update submission
        const submission = await Submission.findOne({ job: req.params.jobId });

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found",
            });
        }

        submission.status = 'revision-requested';
        submission.revisionFeedback = feedback;
        submission.revisionDeadline = newDeadline;
        submission.revisionAttachments = attachments || [];
        submission.reviewedAt = Date.now();
        await submission.save();

        // Update job status
        job.status = 'revision-requested';
        await job.save();

        res.status(200).json({
            success: true,
            message: "Revision requested successfully",
            data: submission,
        });
    } catch (error) {
        console.error("Request Revision Error:", error);
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
        job.completedDate = Date.now();
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
