const { WorkerProfile, Review } = require('../../models');
const { getCompanyProfile } = require('../../utils/companyInfoHelper');

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

        // 2️⃣ Fetch all reviews for this worker (only company reviews of worker)
        const reviews = await Review.find({
            worker: req.user._id,
            reviewedBy: 'company'
        })
            .populate("job", "title")
            .populate("company", "email")
            .sort({ createdAt: -1 });

        // 3️⃣ Add company profile info (name & logo)
        const formattedReviews = await Promise.all(
            reviews.map(async (rev) => {
                const companyProfile = await getCompanyProfile(rev.company._id);

                return {
                    rating: rev.rating,
                    reviewText: rev.reviewText,
                    tags: rev.tags,
                    wouldHireAgain: rev.wouldHireAgain,
                    createdAt: rev.createdAt,
                    jobTitle: rev.job?.title || "N/A",
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

        // 5️⃣ Update profile with calculated stats
        profile.averageRating = parseFloat(averageRating.toFixed(1));
        profile.totalReviews = totalReviews;
        await profile.save();

        res.status(200).json({
            success: true,
            data: {
                ...profile.toObject(),
                reviews: formattedReviews,
            },
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update worker profile
// @route   PUT /api/workers/profile
// @access  Private/Worker
exports.updateProfile = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            title,
            bio,
            skills,
            hourlyRate,
            availability,
            portfolio,
            languages,
            education,
            socialLinks,
            githubProfile,
            linkedinProfile,
            profilePicture,
            resume,
            preferredJobTypes,
            willingToRelocate,
            expectedSalary,
            website,
            twitterProfile,
            dribbbleProfile,
            behanceProfile,
            instagramProfile,
            stackoverflowProfile
        } = req.body;

        let profile = await WorkerProfile.findOne({ user: req.user._id });

        if (!profile) {
            // Create profile if it doesn't exist
            profile = await WorkerProfile.create({
                user: req.user._id,
                fullName: fullName || req.user.email.split('@')[0],
                phone,
                title,
                bio,
                skills,
                hourlyRate,
                availability,
                portfolio,
                languages,
                education,
                socialLinks,
                githubProfile,
                linkedinProfile,
                website,
                twitterProfile,
                dribbbleProfile,
                behanceProfile,
                instagramProfile,
                stackoverflowProfile,
                profilePicture
            });
        } else {
            // Update existing profile - only update fields that are provided
            if (fullName !== undefined) profile.fullName = fullName;
            if (phone !== undefined) profile.phone = phone;
            if (title !== undefined) profile.title = title;
            if (bio !== undefined) profile.bio = bio;
            if (skills !== undefined) profile.skills = skills;
            if (hourlyRate !== undefined) profile.hourlyRate = hourlyRate;
            if (availability !== undefined) profile.availability = availability;
            if (portfolio !== undefined) profile.portfolio = portfolio;
            if (languages !== undefined) profile.languages = languages;
            if (education !== undefined) profile.education = education;
            if (socialLinks !== undefined) profile.socialLinks = socialLinks;
            if (githubProfile !== undefined) profile.githubProfile = githubProfile;
            if (linkedinProfile !== undefined) profile.linkedinProfile = linkedinProfile;
            if (website !== undefined) profile.website = website;
            if (twitterProfile !== undefined) profile.twitterProfile = twitterProfile;
            if (dribbbleProfile !== undefined) profile.dribbbleProfile = dribbbleProfile;
            if (behanceProfile !== undefined) profile.behanceProfile = behanceProfile;
            if (instagramProfile !== undefined) profile.instagramProfile = instagramProfile;
            if (stackoverflowProfile !== undefined) profile.stackoverflowProfile = stackoverflowProfile;
            if (profilePicture !== undefined) profile.profilePicture = profilePicture;
            if (resume !== undefined) profile.resume = resume;
            if (preferredJobTypes !== undefined) profile.preferredJobTypes = preferredJobTypes;
            if (willingToRelocate !== undefined) profile.willingToRelocate = willingToRelocate;
            if (expectedSalary !== undefined) profile.expectedSalary = expectedSalary;

            await profile.save();
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
