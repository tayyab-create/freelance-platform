const { Job, Submission, Review } = require('../../models');
const { getCompanyProfile } = require('../../utils/companyInfoHelper');
const notificationService = require('../../services/notificationService');

// @desc    Get assigned jobs
// @route   GET /api/workers/jobs/assigned
// @access  Private/Worker
exports.getAssignedJobs = async (req, res) => {
    try {
        const jobs = await Job.find({
            assignedWorker: req.user._id,
            status: { $in: ['assigned', 'in-progress', 'submitted', 'revision-requested', 'completed'] }
        })
            .populate('company', 'email')
            .sort('-assignedDate');

        // Get company profiles and client ratings
        const jobsWithCompanyInfo = await Promise.all(
            jobs.map(async (job) => {
                const jobObj = job.toObject();

                // Get company profile
                if (jobObj.company) {
                    const companyProfile = await getCompanyProfile(jobObj.company._id);
                    if (companyProfile) {
                        jobObj.companyInfo = {
                            companyName: companyProfile.companyName,
                            logo: companyProfile.logo
                        };
                    }
                }

                // Get client rating if job is completed
                if (jobObj.status === 'completed') {
                    const review = await Review.findOne({
                        job: jobObj._id,
                        reviewedBy: 'company'
                    }).select('rating');

                    if (review) {
                        jobObj.clientRating = review.rating;
                    }
                }

                return jobObj;
            })
        );

        res.status(200).json({
            success: true,
            count: jobsWithCompanyInfo.length,
            data: jobsWithCompanyInfo
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

// @desc    Get assigned job by ID
// @route   GET /api/workers/jobs/assigned/:jobId
// @access  Private/Worker
exports.getAssignedJobById = async (req, res) => {
    try {
        const jobId = req.params.jobId;

        const job = await Job.findOne({
            _id: jobId,
            assignedWorker: req.user._id
        }).populate('company', 'email');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or not assigned to you'
            });
        }

        const jobObj = job.toObject();

        // Get company profile
        if (jobObj.company) {
            const companyProfile = await getCompanyProfile(jobObj.company._id);
            if (companyProfile) {
                jobObj.companyInfo = {
                    companyName: companyProfile.companyName,
                    logo: companyProfile.logo,
                    tagline: companyProfile.tagline
                };
            }
        }

        // Get client rating if job is completed
        if (jobObj.status === 'completed') {
            const review = await Review.findOne({
                job: jobObj._id,
                reviewedBy: 'company'
            }).select('rating');

            if (review) {
                jobObj.clientRating = review.rating;
            }
        }

        res.status(200).json({
            success: true,
            data: jobObj
        });
    } catch (error) {
        console.error('Get Assigned Job By ID Error:', error);
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

        // Check if submission already exists
        const existingSubmission = await Submission.findOne({ job: jobId });

        if (existingSubmission) {
            // Handle resubmission (revision case)
            if (existingSubmission.status === 'revision-requested') {
                // Move current submission data to revision history
                existingSubmission.revisionHistory.push({
                    files: existingSubmission.files,
                    description: existingSubmission.description,
                    submittedAt: existingSubmission.createdAt,
                    feedback: existingSubmission.revisionFeedback,
                    revisionDeadline: existingSubmission.revisionDeadline,
                    attachments: existingSubmission.revisionAttachments
                });

                // Increment revision count
                existingSubmission.revisionCount += 1;

                // Update with new submission data
                existingSubmission.description = description;
                existingSubmission.links = links || [];
                existingSubmission.files = files || [];
                existingSubmission.status = 'submitted';

                // Clear revision-specific fields
                existingSubmission.revisionFeedback = undefined;
                existingSubmission.revisionDeadline = undefined;
                existingSubmission.revisionAttachments = [];

                await existingSubmission.save();

                // Update job status back to submitted
                job.status = 'submitted';
                await job.save();

                // Notify company about revision submission
                await notificationService.createNotification(
                    job.company,
                    'submission',
                    'Revision Submitted',
                    `Revised work has been submitted for "${job.title}". Please review the changes.`,
                    `/company/submissions/${existingSubmission._id}`,
                    {
                        jobId: job._id,
                        submissionId: existingSubmission._id,
                        workerId: req.user._id,
                        isRevision: true
                    }
                );

                return res.status(200).json({
                    success: true,
                    message: 'Revision submitted successfully',
                    data: existingSubmission
                });
            } else {
                // Already submitted and not in revision state
                return res.status(400).json({
                    success: false,
                    message: 'Work already submitted for this job'
                });
            }
        }

        // Create new submission (first submission)
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

        // Notify company about submission
        await notificationService.createNotification(
            job.company,
            'submission',
            'Work Submitted',
            `New work has been submitted for "${job.title}". Please review and provide feedback.`,
            `/company/submissions/${submission._id}`,
            {
                jobId: job._id,
                submissionId: submission._id,
                workerId: req.user._id
            }
        );

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

// @desc    Get submission details for a job
// @route   GET /api/workers/submission/:jobId
// @access  Private/Worker
exports.getSubmission = async (req, res) => {
    try {
        const jobId = req.params.jobId;

        // Find the submission for this job
        const submission = await Submission.findOne({
            job: jobId,
            worker: req.user._id
        })
            .populate('job', 'title description salary status')
            .populate('company', 'email');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Get company profile
        const submissionObj = submission.toObject();
        if (submissionObj.company) {
            const companyProfile = await getCompanyProfile(submissionObj.company._id);
            if (companyProfile) {
                submissionObj.companyInfo = {
                    companyName: companyProfile.companyName,
                    logo: companyProfile.logo
                };
            }
        }

        res.status(200).json({
            success: true,
            data: submissionObj
        });
    } catch (error) {
        console.error('Get Submission Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Start working on a job (change status to in-progress)
// @route   PUT /api/workers/jobs/:jobId/start
// @access  Private/Worker
exports.startJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;

        // Find the job and verify it's assigned to this worker
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

        if (job.status !== 'assigned') {
            return res.status(400).json({
                success: false,
                message: 'Job must be in assigned status to start working'
            });
        }

        // Update job status to in-progress
        job.status = 'in-progress';
        await job.save();

        // Notify company that worker has started
        await notificationService.createNotification(
            job.company,
            'job',
            'Work Started',
            `Work has started on "${job.title}"`,
            `/company/jobs/${job._id}`,
            {
                jobId: job._id,
                workerId: req.user._id,
                status: 'in-progress'
            }
        );

        res.status(200).json({
            success: true,
            message: 'Job started successfully',
            data: job
        });
    } catch (error) {
        console.error('Start Job Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
