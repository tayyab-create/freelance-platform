import React from 'react';
import {
    AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, Legend, XAxis, YAxis
} from 'recharts';
import { FiActivity } from 'react-icons/fi';

const ApplicationsTrendChart = ({ data }) => {
    return (
        <div className="card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FiActivity className="text-primary-600" />
                Applications Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="applications" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorApplications)" name="Applications" />
                    <Area type="monotone" dataKey="accepted" stroke="#10b981" fillOpacity={1} fill="url(#colorAccepted)" name="Accepted" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ApplicationsTrendChart;
