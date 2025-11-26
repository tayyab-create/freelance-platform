import React from 'react';
import {
    LineChart, Line, CartesianGrid, Tooltip, ResponsiveContainer, Legend, XAxis, YAxis
} from 'recharts';
import { FiDollarSign } from 'react-icons/fi';

const EarningsTrendChart = ({ data, totalEarnings }) => {
    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <FiDollarSign className="text-green-600" />
                    Earnings Trend
                </h3>
                <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">${(totalEarnings || 0).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Earned</div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                        formatter={(value) => `$${value.toLocaleString()}`}
                        labelStyle={{ color: '#111827' }}
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="earnings"
                        name="Earnings ($)"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 5 }}
                        activeDot={{ r: 7 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EarningsTrendChart;
