import React from 'react';
import { Link } from 'react-router-dom';
import { FiActivity, FiBriefcase, FiCheckCircle, FiStar, FiArrowRight } from 'react-icons/fi';

const RecentActivity = ({ activities }) => {
    return (
        <div className="card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FiActivity className="text-primary-600" />
                Recent Activity
            </h3>
            <div className="space-y-4">
                {activities.length > 0 ? (
                    activities.map((activity) => {
                        let icon = FiActivity;
                        let color = 'blue';

                        if (activity.type === 'application') {
                            icon = FiBriefcase;
                            color = 'blue';
                        } else if (activity.type === 'job_completed') {
                            icon = FiCheckCircle;
                            color = 'green';
                        } else if (activity.type === 'review') {
                            icon = FiStar;
                            color = 'yellow';
                        }

                        const Icon = icon;

                        return (
                            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                <div className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                                    <Icon className={`h-5 w-5 text-${color}-600`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-900 font-medium text-sm">{activity.action}</p>
                                    <p className="text-gray-500 text-xs mt-1">{new Date(activity.time).toLocaleString()}</p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
            </div>
            <Link
                to="/worker/applications"
                className="mt-4 w-full py-2.5 flex items-center justify-center gap-2 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-primary-600 hover:border-primary-200 transition-all duration-200"
            >
                View All Activity
                <FiArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
};

export default RecentActivity;
