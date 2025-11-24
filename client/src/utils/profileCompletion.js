export const calculateWorkerProfileCompletion = (profile) => {
    if (!profile) return 0;

    let score = 0;

    // Weights
    const weights = {
        fullName: 10,
        bio: 10,
        skills: 20,
        experience: 20,
        profilePicture: 10,
        hourlyRate: 10,
        phone: 10,
        socialLinks: 10 // Github or Linkedin
    };

    if (profile.fullName) score += weights.fullName;
    if (profile.bio && profile.bio.length > 20) score += weights.bio;
    if (profile.skills && profile.skills.length > 0) score += weights.skills;
    if (profile.experience && profile.experience.length > 0) score += weights.experience;
    if (profile.profilePicture) score += weights.profilePicture;
    if (profile.hourlyRate && profile.hourlyRate > 0) score += weights.hourlyRate;
    if (profile.phone) score += weights.phone;
    if (profile.githubProfile || profile.linkedinProfile) score += weights.socialLinks;

    return Math.min(score, 100);
};

export const calculateCompanyProfileCompletion = (profile) => {
    if (!profile) return 0;

    let score = 0;

    // Weights
    const weights = {
        companyName: 10,
        logo: 10,
        description: 15,
        website: 10,
        industry: 10,
        companySize: 5,
        address: 20,
        contactPerson: 20
    };

    if (profile.companyName) score += weights.companyName;
    if (profile.logo) score += weights.logo;
    if (profile.description && profile.description.length > 20) score += weights.description;
    if (profile.website) score += weights.website;
    if (profile.industry) score += weights.industry;
    if (profile.companySize) score += weights.companySize;

    // Address check (at least city and country)
    if (profile.address && profile.address.city && profile.address.country) {
        score += weights.address;
    }

    // Contact Person check (at least name and email)
    if (profile.contactPerson && profile.contactPerson.name && profile.contactPerson.email) {
        score += weights.contactPerson;
    }

    return Math.min(score, 100);
};
