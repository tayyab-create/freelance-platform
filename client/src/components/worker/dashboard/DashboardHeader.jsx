import React from 'react';
import { Avatar } from '../../shared';

const DashboardHeader = ({ user, dashboardData }) => {
    return (
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 right-20 w-40 h-40 bg-white opacity-5 rounded-full"></div>
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={user?.profilePhoto}
                        name={user?.name || 'Worker'}
                        size="2xl"
                        className="border-4 border-white shadow-xl"
                    />
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            Welcome back, {user?.name || dashboardData.profile?.name || 'Worker'}! 👋
                        </h1>
                        <p className="text-primary-100 text-lg">Here's your performance overview</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold">${(dashboardData.earnings?.total || 0).toLocaleString()}</div>
                    <div className="text-primary-100 text-sm">Total Earnings</div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
