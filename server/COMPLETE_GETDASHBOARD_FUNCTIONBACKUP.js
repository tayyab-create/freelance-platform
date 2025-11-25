// COMPLETE getDashboard FUNCTION - Replace your entire getDashboard function with this

exports.getDashboard = async (req, res) => {
    try {
        // Get or create profile
        let profile = await WorkerProfile.findOne({ user: req.user._id });
        if (!profile) {
            profile = await WorkerProfile.create({
                user: req.user._id,
                fullName: req.user.email.split('@')[0]
            });
        }

        // Basic counts
        const totalApplications = await Application.countDocuments({ worker: req.user._id });
        const pendingApplications = await Application.countDocuments({ worker: req.user._id, status: 'pending' });
        const acceptedApplications = await Application.countDocuments({ worker: req.user._id, status: 'accepted' });
        const activeJobs = await Job.countDocuments({ assignedWorker: req.user._id, status: { $in: ['assigned', 'in-progress'] } });
        const completedJobs = await Job.countDocuments({ assignedWorker: req.user._id, status: 'completed' });

        // Monthly Applications Trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const applicationsTrend = await Application.aggregate([
            { $match: { worker: req.user._id, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    applications: { $sum: 1 },
                    accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedApplicationsTrend = applicationsTrend.map(item => ({
            month: monthNames[item._id.month - 1],
            applications: item.applications,
            accepted: item.accepted
        }));

        // Monthly Earnings Trend (last 6 months for the chart)
        const completedJobsData = await Job.find({
            assignedWorker: req.user._id,
            status: 'completed',
            completedDate: { $gte: sixMonthsAgo }
        }).select('salary completedDate');

        const earningsByMonth = {};
        completedJobsData.forEach(job => {
            if (job.completedDate) {
                const monthKey = `${job.completedDate.getFullYear()}-${job.completedDate.getMonth()}`;
                earningsByMonth[monthKey] = (earningsByMonth[monthKey] || 0) + (job.salary || 0);
            }
        });

        const earningsTrend = Object.keys(earningsByMonth).map(key => {
            const [year, monthIndex] = key.split('-');
            return { month: monthNames[parseInt(monthIndex)], earnings: earningsByMonth[key] };
        });

        // Calculate total earnings from ALL completed jobs (not just last 6 months)
        const allCompletedJobs = await Job.find({
            assignedWorker: req.user._id,
            status: 'completed'
        }).select('salary');

        const totalEarnings = allCompletedJobs.reduce((sum, job) => sum + (job.salary || 0), 0);

        // Recent Activities
        const recentActivities = [];
        const recentApps = await Application.find({ worker: req.user._id }).sort('-createdAt').limit(5).populate('job', 'title');
        recentApps.forEach(app => {
            if (app.job) recentActivities.push({ id: app._id, action: `Applied to ${app.job.title}`, time: app.createdAt, type: 'application' });
        });

        const recentCompletedJobs = await Job.find({ assignedWorker: req.user._id, status: 'completed' }).sort('-completedDate').limit(3).select('title completedDate');
        recentCompletedJobs.forEach(job => {
            recentActivities.push({ id: job._id, action: `Completed project: ${job.title}`, time: job.completedDate, type: 'job_completed' });
        });

        const recentReviews = await Review.find({ worker: req.user._id }).sort('-createdAt').limit(3).populate('company', 'email');
        for (const review of recentReviews) {
            let companyName = 'Client';
            if (review.company) {
                const companyProfile = await CompanyProfile.findOne({ user: review.company._id });
                if (companyProfile) companyName = companyProfile.companyName;
            }
            recentActivities.push({ id: review._id, action: `Received ${review.rating}-star review from ${companyName}`, time: review.createdAt, type: 'review' });
        }

        recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
        const topActivities = recentActivities.slice(0, 10);

        // Upcoming Deadlines
        const upcomingDeadlines = await Job.find({
            assignedWorker: req.user._id,
            status: { $in: ['assigned', 'in-progress'] },
            deadline: { $exists: true, $gte: new Date() }
        }).sort('deadline').limit(5).select('title deadline');

        const formattedDeadlines = upcomingDeadlines.map(job => {
            const daysUntil = Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            let deadlineText, priority;
            if (daysUntil <= 2) { deadlineText = `${daysUntil} days`; priority = 'high'; }
            else if (daysUntil <= 5) { deadlineText = `${daysUntil} days`; priority = 'medium'; }
            else if (daysUntil <= 7) { deadlineText = '1 week'; priority = 'low'; }
            else { deadlineText = `${Math.ceil(daysUntil / 7)} weeks`; priority = 'low'; }
            return { id: job._id, project: job.title, deadline: deadlineText, priority };
        });

        // Achievements
        const achievements = [
            { id: 1, title: 'Rising Star', description: 'Complete 5 jobs', unlocked: completedJobs >= 5, icon: '⭐' },
            { id: 2, title: 'Perfect Score', description: 'Maintain 5.0 rating', unlocked: (profile.averageRating || 0) >= 5.0 && (profile.totalReviews || 0) >= 3, icon: '🏆' },
            { id: 3, title: 'Speed Demon', description: 'Complete job in 24hrs', unlocked: false, icon: '⚡' },
            { id: 4, title: 'Century Club', description: 'Earn $10,000', unlocked: totalEarnings >= 10000, icon: '💰' }
        ];

        // ===== TREND CALCULATIONS (ADD THESE 4 TREND CALCULATIONS) =====
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        // 1. Total Applications Trend
        const appsLast30Days = await Application.countDocuments({ worker: req.user._id, createdAt: { $gte: thirtyDaysAgo } });
        const appsPrevious30Days = await Application.countDocuments({ worker: req.user._id, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
        const appsTrend = appsPrevious30Days > 0 ? Math.round(((appsLast30Days - appsPrevious30Days) / appsPrevious30Days) * 100) : (appsLast30Days > 0 ? 100 : 0);

        // 2. Pending Applications Trend
        const pendingNow = pendingApplications;
        const pending30DaysAgo = await Application.countDocuments({
            worker: req.user._id,
            status: 'pending',
            createdAt: { $lte: thirtyDaysAgo }
        });
        const pendingTrend = pending30DaysAgo > 0 ? Math.round(((pendingNow - pending30DaysAgo) / pending30DaysAgo) * 100) : (pendingNow > 0 ? 100 : 0);

        // 3. Active Jobs Trend
        const activeNow = activeJobs;
        const active30DaysAgo = await Job.countDocuments({
            assignedWorker: req.user._id,
            status: { $in: ['assigned', 'in-progress'] },
            assignedDate: { $lte: thirtyDaysAgo }
        });
        const activeTrend = active30DaysAgo > 0 ? Math.round(((activeNow - active30DaysAgo) / active30DaysAgo) * 100) : (activeNow > 0 ? 100 : 0);

        // 4. Completed Jobs Trend
        const jobsLast30Days = completedJobsData.filter(j => j.completedDate && j.completedDate >= thirtyDaysAgo).length;
        const jobsPrevious30Days = completedJobsData.filter(j => j.completedDate && j.completedDate >= sixtyDaysAgo && j.completedDate < thirtyDaysAgo).length;
        const jobsTrend = jobsPrevious30Days > 0 ? Math.round(((jobsLast30Days - jobsPrevious30Days) / jobsPrevious30Days) * 100) : (jobsLast30Days > 0 ? 100 : 0);

        // RESPONSE
        res.status(200).json({
            success: true,
            data: {
                profile: {
                    ...profile.toObject(),
                    name: profile.fullName,
                    rating: profile.averageRating || 0,
                    totalReviews: profile.totalReviews || 0,
                    availability: profile.availability
                },
                applications: {
                    total: totalApplications,
                    pending: pendingApplications,
                    accepted: acceptedApplications
                },
                jobs: {
                    active: activeJobs,
                    completed: completedJobs
                },
                earnings: {
                    total: totalEarnings
                },
                trends: {
                    applications: appsTrend,
                    pending: pendingTrend,
                    activeJobs: activeTrend,
                    completedJobs: jobsTrend
                },
                applicationsTrend: formattedApplicationsTrend,
                earningsTrend: earningsTrend,
                recentActivities: topActivities,
                upcomingDeadlines: formattedDeadlines,
                achievements: achievements
            }
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
