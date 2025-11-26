import React from 'react';
import { StatCard } from '../../shared';
import { FiBriefcase, FiCheckCircle, FiClock, FiStar } from 'react-icons/fi';

const StatsOverview = ({ dashboardData }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
                title="Applications"
                value={dashboardData.applications?.total || 0}
                change={dashboardData.trends?.applications || 0}
                trend={dashboardData.trends?.applications >= 0 ? "up" : "down"}
                icon={FiBriefcase}
                gradient="from-blue-500 to-cyan-500"
            />

            <StatCard
                title="Jobs Completed"
                value={dashboardData.jobs?.completed || 0}
                change={dashboardData.trends?.completedJobs || 0}
                trend={dashboardData.trends?.completedJobs >= 0 ? "up" : "down"}
                icon={FiCheckCircle}
                gradient="from-green-500 to-emerald-500"
            />

            <StatCard
                title="Active Jobs"
                value={dashboardData.jobs?.active || 0}
                change={dashboardData.trends?.activeJobs || 0}
                trend={dashboardData.trends?.activeJobs >= 0 ? "up" : "down"}
                icon={FiClock}
                gradient="from-purple-500 to-pink-500"
            />

            <StatCard
                title="Avg Rating"
                value={dashboardData.profile?.rating?.toFixed(1) || '0.0'}
                icon={FiStar}
                gradient="from-yellow-500 to-orange-500"
            />
        </div>
    );
};

export default StatsOverview;
