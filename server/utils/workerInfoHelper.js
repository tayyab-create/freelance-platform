const { WorkerProfile } = require('../models');

/**
 * Enriches application/job objects with worker profile information
 * @param {Array} items - Array of applications or jobs
 * @returns {Array} - Items enriched with workerInfo
 */
exports.enrichWithWorkerInfo = async (items) => {
    return Promise.all(
        items.map(async (item) => {
            const itemObj = item.toObject ? item.toObject() : item;

            if (itemObj.worker) {
                const workerId = itemObj.worker._id || itemObj.worker;
                const workerProfile = await WorkerProfile.findOne({ user: workerId });
                if (workerProfile) {
                    itemObj.workerInfo = {
                        fullName: workerProfile.fullName,
                        profilePicture: workerProfile.profilePicture,
                        skills: workerProfile.skills,
                        averageRating: workerProfile.averageRating,
                        totalReviews: workerProfile.totalReviews,
                        hourlyRate: workerProfile.hourlyRate
                    };
                }
            }
            return itemObj;
        })
    );
};

/**
 * Fetches a single worker profile by user ID
 * @param {String} userId - Worker user ID
 * @returns {Object|null} - Worker profile or null
 */
exports.getWorkerProfile = async (userId) => {
    return WorkerProfile.findOne({ user: userId });
};
