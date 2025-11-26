const WorkerProfile = require('../../models/WorkerProfile');
const Job = require('../../models/Job');

/**
 * @desc    Get all saved searches for the logged-in worker
 * @route   GET /api/worker/saved-searches
 * @access  Private (Worker)
 */
exports.getSavedSearches = async (req, res) => {
    try {
        const workerProfile = await WorkerProfile.findOne({ user: req.user._id });

        if (!workerProfile) {
            return res.status(404).json({
                success: false,
                message: 'Worker profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: workerProfile.savedSearches || []
        });
    } catch (error) {
        console.error('Get saved searches error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch saved searches',
            error: error.message
        });
    }
};

/**
 * @desc    Create a new saved search
 * @route   POST /api/worker/saved-searches
 * @access  Private (Worker)
 */
exports.createSavedSearch = async (req, res) => {
    try {
        const { name, filters, notifyOnNewMatches } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Search name is required'
            });
        }

        const workerProfile = await WorkerProfile.findOne({ user: req.user._id });

        if (!workerProfile) {
            return res.status(404).json({
                success: false,
                message: 'Worker profile not found'
            });
        }

        // Check if search name already exists
        const existingSearch = workerProfile.savedSearches.find(
            search => search.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (existingSearch) {
            return res.status(400).json({
                success: false,
                message: 'A saved search with this name already exists'
            });
        }

        // Limit to 10 saved searches
        if (workerProfile.savedSearches.length >= 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum of 10 saved searches allowed. Please delete one to add a new search.'
            });
        }

        // Create new saved search
        const newSavedSearch = {
            name: name.trim(),
            filters: filters || {},
            notifyOnNewMatches: notifyOnNewMatches !== undefined ? notifyOnNewMatches : true,
            createdAt: new Date()
        };

        workerProfile.savedSearches.push(newSavedSearch);
        await workerProfile.save();

        // Return the newly created search
        const createdSearch = workerProfile.savedSearches[workerProfile.savedSearches.length - 1];

        res.status(201).json({
            success: true,
            message: 'Search saved successfully',
            data: createdSearch
        });
    } catch (error) {
        console.error('Create saved search error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save search',
            error: error.message
        });
    }
};

/**
 * @desc    Update a saved search
 * @route   PUT /api/worker/saved-searches/:id
 * @access  Private (Worker)
 */
exports.updateSavedSearch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, filters, notifyOnNewMatches } = req.body;

        const workerProfile = await WorkerProfile.findOne({ user: req.user._id });

        if (!workerProfile) {
            return res.status(404).json({
                success: false,
                message: 'Worker profile not found'
            });
        }

        const savedSearch = workerProfile.savedSearches.id(id);

        if (!savedSearch) {
            return res.status(404).json({
                success: false,
                message: 'Saved search not found'
            });
        }

        // Update fields
        if (name) savedSearch.name = name.trim();
        if (filters) savedSearch.filters = filters;
        if (notifyOnNewMatches !== undefined) savedSearch.notifyOnNewMatches = notifyOnNewMatches;

        await workerProfile.save();

        res.status(200).json({
            success: true,
            message: 'Search updated successfully',
            data: savedSearch
        });
    } catch (error) {
        console.error('Update saved search error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update search',
            error: error.message
        });
    }
};

/**
 * @desc    Delete a saved search
 * @route   DELETE /api/worker/saved-searches/:id
 * @access  Private (Worker)
 */
exports.deleteSavedSearch = async (req, res) => {
    try {
        const { id } = req.params;

        const workerProfile = await WorkerProfile.findOne({ user: req.user._id });

        if (!workerProfile) {
            return res.status(404).json({
                success: false,
                message: 'Worker profile not found'
            });
        }

        const savedSearch = workerProfile.savedSearches.id(id);

        if (!savedSearch) {
            return res.status(404).json({
                success: false,
                message: 'Saved search not found'
            });
        }

        savedSearch.remove();
        await workerProfile.save();

        res.status(200).json({
            success: true,
            message: 'Search deleted successfully'
        });
    } catch (error) {
        console.error('Delete saved search error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete search',
            error: error.message
        });
    }
};

/**
 * @desc    Get jobs matching a saved search
 * @route   GET /api/worker/saved-searches/:id/jobs
 * @access  Private (Worker)
 */
exports.getJobsForSavedSearch = async (req, res) => {
    try {
        const { id } = req.params;

        const workerProfile = await WorkerProfile.findOne({ user: req.user._id });

        if (!workerProfile) {
            return res.status(404).json({
                success: false,
                message: 'Worker profile not found'
            });
        }

        const savedSearch = workerProfile.savedSearches.id(id);

        if (!savedSearch) {
            return res.status(404).json({
                success: false,
                message: 'Saved search not found'
            });
        }

        // Build query based on saved filters
        const query = { status: 'open' };
        const { filters } = savedSearch;

        if (filters.search) {
            query.$or = [
                { title: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } }
            ];
        }

        if (filters.category) {
            query.category = filters.category;
        }

        if (filters.experienceLevel) {
            query.experienceLevel = filters.experienceLevel;
        }

        if (filters.salaryMin || filters.salaryMax) {
            query.salary = {};
            if (filters.salaryMin) query.salary.$gte = parseInt(filters.salaryMin);
            if (filters.salaryMax) query.salary.$lte = parseInt(filters.salaryMax);
        }

        if (filters.location) {
            query.location = { $regex: filters.location, $options: 'i' };
        }

        if (filters.remoteOnly) {
            query.isRemote = true;
        }

        // Sorting
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (filters.sortBy === 'oldest') sortOption = { createdAt: 1 };
        else if (filters.sortBy === 'salary-high') sortOption = { salary: -1 };
        else if (filters.sortBy === 'salary-low') sortOption = { salary: 1 };
        else if (filters.sortBy === 'deadline') sortOption = { deadline: 1 };

        const jobs = await Job.find(query)
            .populate('company', 'companyName logo')
            .sort(sortOption)
            .limit(50);

        res.status(200).json({
            success: true,
            data: jobs,
            count: jobs.length
        });
    } catch (error) {
        console.error('Get jobs for saved search error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch jobs',
            error: error.message
        });
    }
};
