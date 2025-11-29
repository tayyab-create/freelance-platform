const { CompanyProfile } = require('../../models');

// @desc    Get company profile
// @route   GET /api/companies/profile
// @access  Private/Company
exports.getProfile = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne({ user: req.user._id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

// @desc    Update company profile
// @route   PUT /api/companies/profile
// @access  Private/Company
exports.updateProfile = async (req, res) => {
    try {
        const allowedFields = [
            "companyName",
            "logo",
            "tagline",
            "description",
            "website",
            "linkedinProfile",
            "industry",
            "companySize",
            "address",
            "contactPerson",
            "taxDocuments",
            "professionalLinks",
            "socialMedia",
            "registrationNumber",
            "foundedYear",
            "companyVideo",
            "companySize",
            "benefits"
        ];

        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const profile = await CompanyProfile.findOneAndUpdate(
            { user: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile,
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
