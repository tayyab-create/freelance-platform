const { Job, Submission } = require('../../models');
const { getCompanyProfile } = require('../../utils/companyInfoHelper');

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

        // Get company profiles
        const jobsWithCompanyInfo = await Promise.all(
            jobs.map(async (job) => {
                const jobObj = job.toObject();
                if (jobObj.company) {
                    const companyProfile = await getCompanyProfile(jobObj.company._id);
                    if (companyProfile) {
                        jobObj.companyInfo = {
                            companyName: companyProfile.companyName,
                            logo: companyProfile.logo
                        };
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
