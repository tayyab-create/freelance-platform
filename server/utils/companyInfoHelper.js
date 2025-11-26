const { CompanyProfile } = require('../models');

/**
 * Enriches job/application objects with company profile information
 * @param {Array} items - Array of jobs or applications
 * @param {String} companyPath - Path to company ID in the object (e.g., 'company._id' or 'job.company._id')
 * @returns {Array} - Items enriched with companyInfo
 */
exports.enrichWithCompanyInfo = async (items, companyPath = 'company._id') => {
    return Promise.all(
        items.map(async (item) => {
            const itemObj = item.toObject ? item.toObject() : item;

            // Navigate to company ID using path
            const companyId = companyPath.split('.').reduce((obj, key) => obj?.[key], itemObj);

            if (companyId) {
                const companyProfile = await CompanyProfile.findOne({ user: companyId });
                if (companyProfile) {
                    // Determine where to attach companyInfo based on path
                    if (companyPath.includes('job.company')) {
                        itemObj.job.companyInfo = {
                            companyName: companyProfile.companyName,
                            logo: companyProfile.logo
                        };
                    } else {
                        itemObj.companyInfo = {
                            companyName: companyProfile.companyName,
                            logo: companyProfile.logo
                        };
                    }
                }
            }
            return itemObj;
        })
    );
};

/**
 * Fetches a single company profile by user ID
 * @param {String} userId - Company user ID
 * @returns {Object|null} - Company profile or null
 */
exports.getCompanyProfile = async (userId) => {
    return CompanyProfile.findOne({ user: userId });
};
