const { User, WorkerProfile, CompanyProfile } = require('../models');
const { logSubmission, logResubmission, getApprovalHistory } = require('../middleware/approvalHistory');
const {
    calculateWorkerProfileCompleteness,
    calculateCompanyProfileCompleteness,
    getWorkerMissingFields,
    getCompanyMissingFields
} = require('../utils/profileCompleteness');

// @desc    Save onboarding progress (auto-save)
// @route   PUT /api/auth/onboarding/save
// @access  Private
exports.saveOnboardingProgress = async (req, res) => {
    try {
        console.log('🔵 [BACKEND] Save onboarding progress request received');
        console.log('🔵 [BACKEND] User ID:', req.user._id);
        console.log('🔵 [BACKEND] Step:', req.body.step);
        console.log('🔵 [BACKEND] Profile data:', req.body.profileData);
        console.log('🔵 [BACKEND] Profile picture:', req.body.profileData?.profilePicture);
        console.log('🔵 [BACKEND] Resume:', req.body.profileData?.resume);

        const user = await User.findById(req.user._id);
        const { step, profileData } = req.body;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update onboarding step
        if (step !== undefined) {
            user.onboardingStep = step;
            await user.save();
            console.log('🔵 [BACKEND] Updated user onboarding step to:', step);
        }

        // Update profile based on role  
        const Profile = user.role === 'worker' ? WorkerProfile : CompanyProfile;
        let profile = await Profile.findOne({ user: user._id });
        console.log('🔵 [BACKEND] Found profile:', profile ? 'Yes' : 'No');

        if (profile && profileData) {
            // Update profile fields
            Object.keys(profileData).forEach(key => {
                console.log(`🔵 [BACKEND] Setting ${key}:`, profileData[key]);
                profile[key] = profileData[key];
            });

            // Calculate and update completeness
            const completeness = user.role === 'worker'
                ? calculateWorkerProfileCompleteness(profile)
                : calculateCompanyProfileCompleteness(profile);

            profile.profileCompleteness = completeness;
            console.log('🔵 [BACKEND] Saving profile with completeness:', completeness);
            console.log('🔵 [BACKEND] Profile picture in DB:', profile.profilePicture);
            console.log('🔵 [BACKEND] Resume in DB:', profile.resume);

            // Retry save if version conflict occurs
            let retries = 3;
            while (retries > 0) {
                try {
                    await profile.save();
                    console.log('🔵 [BACKEND] Profile saved successfully');
                    break;
                } catch (saveError) {
                    if (saveError.name === 'VersionError' && retries > 1) {
                        console.log(`⚠️ [BACKEND] Version conflict, retrying... (${retries - 1} attempts left)`);
                        // Reload the profile to get the latest version
                        await profile.reload();
                        // Reapply the changes
                        Object.keys(profileData).forEach(key => {
                            profile[key] = profileData[key];
                        });
                        profile.profileCompleteness = completeness;
                        retries--;
                    } else {
                        throw saveError;
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            message: 'Progress saved successfully',
            onboardingStep: user.onboardingStep,
            profileCompleteness: profile?.profileCompleteness || 0
        });

    } catch (error) {
        console.error('❌ [BACKEND] Save Onboarding Progress Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving progress',
            error: error.message
        });
    }
};

// @desc    Submit onboarding for approval
// @route   POST /api/auth/onboarding/submit
// @access  Private
exports.submitOnboarding = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get profile
        const Profile = user.role === 'worker' ? WorkerProfile : CompanyProfile;
        const profile = await Profile.findOne({ user: user._id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Calculate completeness
        const completeness = user.role === 'worker'
            ? calculateWorkerProfileCompleteness(profile)
            : calculateCompanyProfileCompleteness(profile);

        // Check minimum completeness (70%)
        if (completeness < 70) {
            const missingFields = user.role === 'worker'
                ? getWorkerMissingFields(profile)
                : getCompanyMissingFields(profile);

            return res.status(400).json({
                success: false,
                message: 'Profile is incomplete. Please fill in required fields.',
                profileCompleteness: completeness,
                missingFields
            });
        }

        // Update user status
        user.onboardingCompleted = true;
        user.status = 'pending';
        user.submittedAt = new Date();
        await user.save();

        // Update profile completeness
        profile.profileCompleteness = completeness;
        await profile.save();

        // Log submission in approval history
        await logSubmission(user._id, user.role, req);

        res.status(200).json({
            success: true,
            message: 'Profile submitted for review successfully',
            profileCompleteness: completeness,
            status: user.status
        });

    } catch (error) {
        console.error('Submit Onboarding Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting profile',
            error: error.message
        });
    }
};

// @desc    Resubmit onboarding after rejection
// @route   POST /api/auth/onboarding/resubmit
// @access  Private
exports.resubmitOnboarding = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user was actually rejected
        if (user.status !== 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'Only rejected profiles can be resubmitted'
            });
        }

        // Get profile
        const Profile = user.role === 'worker' ? WorkerProfile : CompanyProfile;
        const profile = await Profile.findOne({ user: user._id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Calculate completeness
        const completeness = user.role === 'worker'
            ? calculateWorkerProfileCompleteness(profile)
            : calculateCompanyProfileCompleteness(profile);

        // Check minimum completeness (70%)
        if (completeness < 70) {
            const missingFields = user.role === 'worker'
                ? getWorkerMissingFields(profile)
                : getCompanyMissingFields(profile);

            return res.status(400).json({
                success: false,
                message: 'Profile is still incomplete. Please address the rejection feedback.',
                profileCompleteness: completeness,
                missingFields
            });
        }

        // Update user status
        user.status = 'pending';
        user.submittedAt = new Date();
        user.rejectionReason = ''; // Clear previous rejection reason
        await user.save();

        // Update profile completeness
        profile.profileCompleteness = completeness;
        await profile.save();

        // Log resubmission in approval history
        await logResubmission(user._id, user.role, req);

        res.status(200).json({
            success: true,
            message: 'Profile resubmitted for review successfully',
            profileCompleteness: completeness,
            status: user.status
        });

    } catch (error) {
        console.error('Resubmit Onboarding Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resubmitting profile',
            error: error.message
        });
    }
};

// @desc    Get onboarding status and approval history
// @route   GET /api/auth/onboarding/status
// @access  Private
exports.getOnboardingStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get profile
        const Profile = user.role === 'worker' ? WorkerProfile : CompanyProfile;
        const profile = await Profile.findOne({ user: user._id });

        // Calculate completeness
        const completeness = profile
            ? (user.role === 'worker'
                ? calculateWorkerProfileCompleteness(profile)
                : calculateCompanyProfileCompleteness(profile))
            : 0;

        // Get approval history
        const approvalHistory = await getApprovalHistory(user._id);

        res.status(200).json({
            success: true,
            onboardingCompleted: user.onboardingCompleted,
            onboardingStep: user.onboardingStep,
            status: user.status,
            profileCompleteness: completeness,
            submittedAt: user.submittedAt,
            reviewedAt: user.reviewedAt,
            rejectionReason: user.rejectionReason || null,
            approvalHistory
        });

    } catch (error) {
        console.error('Get Onboarding Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching onboarding status',
            error: error.message
        });
    }
};
