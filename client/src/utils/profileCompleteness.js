/**
 * Utility functions to calculate profile completeness percentage
 * for Worker and Company profiles
 */

/**
 * Calculate Worker Profile Completeness
 * @param {Object} profile - Worker profile object
 * @returns {Number} Completeness percentage (0-100)
 */
export const calculateWorkerProfileCompleteness = (profile) => {
    if (!profile) return 0;

    const fields = {
        // Required fields (higher weight)
        fullName: { value: profile.fullName, weight: 10 },
        phone: { value: profile.phone, weight: 8 },
        bio: { value: profile.bio, weight: 10 },
        skills: { value: profile.skills && profile.skills.length >= 3, weight: 15 },
        hourlyRate: { value: profile.hourlyRate, weight: 8 },

        // Important optional fields
        profilePicture: { value: profile.profilePicture, weight: 5 },
        resume: { value: profile.resume, weight: 15 },
        experience: { value: profile.experience && profile.experience.length > 0, weight: 12 },

        // Nice to have fields
        certifications: { value: profile.certifications && profile.certifications.length > 0, weight: 3 },
        portfolioLinks: { value: profile.portfolioLinks && profile.portfolioLinks.length > 0, weight: 2 },
        videoIntroduction: { value: profile.videoIntroduction, weight: 2 }
    };

    let totalWeight = 0;
    let earnedWeight = 0;

    Object.values(fields).forEach(field => {
        totalWeight += field.weight;
        if (field.value) {
            earnedWeight += field.weight;
        }
    });

    return Math.round((earnedWeight / totalWeight) * 100);
};

/**
 * Calculate Company Profile Completeness
 * @param {Object} profile - Company profile object
 * @returns {Number} Completeness percentage (0-100)
 */
export const calculateCompanyProfileCompleteness = (profile) => {
    if (!profile) return 0;

    const fields = {
        // Required fields (higher weight)
        companyName: { value: profile.companyName, weight: 10 },
        description: { value: profile.description && profile.description.length >= 100, weight: 15 },
        industry: { value: profile.industry, weight: 8 },
        companySize: { value: profile.companySize, weight: 8 },
        website: { value: profile.website, weight: 10 },

        // Important optional fields
        logo: { value: profile.logo, weight: 8 },
        tagline: { value: profile.tagline, weight: 5 },
        address: { value: profile.address && profile.address.city && profile.address.country, weight: 10 },
        contactPerson: { value: profile.contactPerson && profile.contactPerson.name && profile.contactPerson.email, weight: 10 },

        // Nice to have fields
        linkedinProfile: { value: profile.linkedinProfile, weight: 5 },
        taxDocuments: { value: profile.taxDocuments && profile.taxDocuments.length > 0, weight: 8 },
        registrationNumber: { value: profile.registrationNumber, weight: 2 },
        companyVideo: { value: profile.companyVideo, weight: 1 }
    };

    let totalWeight = 0;
    let earnedWeight = 0;

    Object.values(fields).forEach(field => {
        totalWeight += field.weight;
        if (field.value) {
            earnedWeight += field.weight;
        }
    });

    return Math.round((earnedWeight / totalWeight) * 100);
};
