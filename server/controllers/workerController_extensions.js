
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
        experience.endDate = endDate; // Allow null/undefined for current jobs
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
