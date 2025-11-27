const { Application, Job } = require('../../models');
const { enrichWithCompanyInfo, getCompanyProfile } = require('../../utils/companyInfoHelper');
const notificationService = require('../../services/notificationService');

// @desc    Apply for a job
// @route   POST /api/workers/apply/:jobId
// @access  Private/Worker
exports.applyForJob = async (req, res) => {
    try {
        const { proposal, proposedRate, coverLetter, estimatedDuration, attachments } = req.body;
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
            estimatedDuration,
            attachments
        });

        // Update job's total applications count
        job.totalApplications += 1;
        await job.save();

        // Send notification to company
        await notificationService.createNotification(
            job.company,
            'application',
            'New Job Application',
            `You received a new application for "${job.title}"`,
            `/company/jobs/${job._id}`,
            {
                jobId: job._id,
                applicationId: application._id,
                workerId: req.user._id
            }
        );

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
                select: 'title description salary status company duration experienceLevel tags salaryType createdAt attachments deadline',
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
                    const companyProfile = await getCompanyProfile(appObj.job.company._id);
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
