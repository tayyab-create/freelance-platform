const { ApprovalHistory, WorkerProfile, CompanyProfile } = require('../models');
const { calculateWorkerProfileCompleteness, calculateCompanyProfileCompleteness } = require('../utils/profileCompleteness');

/**
 * Log submission event
 * @param {String} userId - User ID
 * @param {String} userRole - User role (worker/company)
 * @param {Object} req - Request object for metadata
 */
const logSubmission = async (userId, userRole, req) => {
    try {
        // Get profile snapshot
        const Profile = userRole === 'worker' ? WorkerProfile : CompanyProfile;
        const profile = await Profile.findOne({ user: userId }).lean();

        // Calculate completeness
        const completeness = userRole === 'worker'
            ? calculateWorkerProfileCompleteness(profile)
            : calculateCompanyProfileCompleteness(profile);

        await ApprovalHistory.create({
            user: userId,
            action: 'submitted',
            performedBy: null, // User action
            profileSnapshot: profile,
            metadata: {
                profileCompleteness: completeness,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent')
            }
        });
    } catch (error) {
        console.error('Error logging submission:', error);
        // Don't throw - logging shouldn't break the flow
    }
};

/**
 * Log resubmission event
 * @param {String} userId - User ID
 * @param {String} userRole - User role (worker/company)
 * @param {Object} req - Request object for metadata
 */
const logResubmission = async (userId, userRole, req) => {
    try {
        // Get profile snapshot
        const Profile = userRole === 'worker' ? WorkerProfile : CompanyProfile;
        const profile = await Profile.findOne({ user: userId }).lean();

        // Calculate completeness
        const completeness = userRole === 'worker'
            ? calculateWorkerProfileCompleteness(profile)
            : calculateCompanyProfileCompleteness(profile);

        // Find previous rejection to compare changes
        const lastRejection = await ApprovalHistory.findOne({
            user: userId,
            action: 'rejected'
        }).sort({ timestamp: -1 }).lean();

        let changes = [];
        if (lastRejection && lastRejection.profileSnapshot) {
            const oldProfile = lastRejection.profileSnapshot;

            // Helper to check if field changed
            const hasChanged = (key) => {
                const oldVal = JSON.stringify(oldProfile[key]);
                const newVal = JSON.stringify(profile[key]);
                return oldVal !== newVal;
            };

            // Check important fields based on role
            const fieldsToCheck = userRole === 'worker'
                ? ['fullName', 'bio', 'skills', 'hourlyRate', 'experience', 'resume', 'profilePicture']
                : ['companyName', 'description', 'industry', 'website', 'location', 'logo'];

            changes = fieldsToCheck.filter(field => hasChanged(field));
        }

        await ApprovalHistory.create({
            user: userId,
            action: 'resubmitted',
            performedBy: null, // User action
            profileSnapshot: profile,
            metadata: {
                profileCompleteness: completeness,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent'),
                changes: changes // Store list of changed fields
            }
        });
    } catch (error) {
        console.error('Error logging resubmission:', error);
    }
};

/**
 * Log approval event
 * @param {String} userId - User ID being approved
 * @param {String} adminId - Admin ID who approved
 * @param {String} notes - Optional admin notes
 */
const logApproval = async (userId, adminId, notes = '') => {
    try {
        await ApprovalHistory.create({
            user: userId,
            action: 'approved',
            performedBy: adminId,
            reason: notes,
            metadata: {
                profileCompleteness: 100 // Approved profiles are considered complete
            }
        });
    } catch (error) {
        console.error('Error logging approval:', error);
    }
};

/**
 * Log rejection event
 * @param {String} userId - User ID being rejected
 * @param {String} adminId - Admin ID who rejected
 * @param {String} reason - Rejection reason
 */
const logRejection = async (userId, adminId, reason) => {
    try {
        await ApprovalHistory.create({
            user: userId,
            action: 'rejected',
            performedBy: adminId,
            reason: reason,
            metadata: {}
        });
    } catch (error) {
        console.error('Error logging rejection:', error);
    }
};

/**
 * Get approval history for a user
 * @param {String} userId - User ID
 * @returns {Array} Array of approval history events
 */
const getApprovalHistory = async (userId) => {
    try {
        const history = await ApprovalHistory
            .find({ user: userId })
            .populate('performedBy', 'email role')
            .sort({ timestamp: -1 })
            .lean();

        return history;
    } catch (error) {
        console.error('Error fetching approval history:', error);
        return [];
    }
};

module.exports = {
    logSubmission,
    logResubmission,
    logApproval,
    logRejection,
    getApprovalHistory
};
