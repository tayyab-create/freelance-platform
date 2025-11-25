// BACKEND UPDATE: Replace the "Trend Calculations" section in workerController.js getDashboard function
// This is around lines 510-519

// Trend Calculations
const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const sixtyDaysAgo = new Date(); sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

// Total Applications Trend (created in last 30 days vs previous 30 days)
const appsLast30Days = await Application.countDocuments({ worker: req.user._id, createdAt: { $gte: thirtyDaysAgo } });
const appsPrevious30Days = await Application.countDocuments({ worker: req.user._id, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
const appsTrend = appsPrevious30Days > 0 ? Math.round(((appsLast30Days - appsPrevious30Days) / appsPrevious30Days) * 100) : (appsLast30Days > 0 ? 100 : 0);

// Pending Applications Trend (current pending vs 30 days ago)
const pendingNow = pendingApplications;
const pending30DaysAgo = await Application.countDocuments({
    worker: req.user._id,
    status: 'pending',
    createdAt: { $lte: thirtyDaysAgo }
});
const pendingTrend = pending30DaysAgo > 0 ? Math.round(((pendingNow - pending30DaysAgo) / pending30DaysAgo) * 100) : (pendingNow > 0 ? 100 : 0);

// Active Jobs Trend (current active vs 30 days ago) 
const activeNow = activeJobs;
const active30DaysAgo = await Job.countDocuments({
    assignedWorker: req.user._id,
    status: { $in: ['assigned', 'in-progress'] },
    assignedDate: { $lte: thirtyDaysAgo }
});
const activeTrend = active30DaysAgo > 0 ? Math.round(((activeNow - active30DaysAgo) / active30DaysAgo) * 100) : (activeNow > 0 ? 100 : 0);

// Completed Jobs Trend (completed in last 30 days vs previous 30 days)
const jobsLast30Days = completedJobsData.filter(j => j.completedDate && j.completedDate >= thirtyDaysAgo).length;
const jobsPrevious30Days = completedJobsData.filter(j => j.completedDate && j.completedDate >= sixtyDaysAgo && j.completedDate < thirtyDaysAgo).length;
const jobsTrend = jobsPrevious30Days > 0 ? Math.round(((jobsLast30Days - jobsPrevious30Days) / jobsPrevious30Days) * 100) : (jobsLast30Days > 0 ? 100 : 0);

// THEN UPDATE THE RESPONSE (around line 528) to include all 4 trends:
res.status(200).json({
    success: true,
    data: {
        profile: { ...profile.toObject(), name: profile.fullName, rating: profile.averageRating || 0, totalReviews: profile.totalReviews || 0, availability: profile.availability },
        applications: { total: totalApplications, pending: pendingApplications, accepted: acceptedApplications },
        jobs: { active: activeJobs, completed: completedJobs },
        earnings: { total: totalEarnings },
        trends: {
            applications: appsTrend,
            pending: pendingTrend,           // NEW
            activeJobs: activeTrend,         // NEW
            completedJobs: jobsTrend
        },
        applicationsTrend: formattedApplicationsTrend,
        earningsTrend: earningsTrend,
        recentActivities: topActivities,
        upcomingDeadlines: formattedDeadlines,
        achievements: achievements
    }
});
