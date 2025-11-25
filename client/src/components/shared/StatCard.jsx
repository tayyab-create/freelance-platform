import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const StatCard = ({
    title,
    value,
    change,
    trend = 'neutral', // 'up', 'down', 'neutral'
    icon: Icon,
    gradient = 'from-primary-500 to-primary-600',
    onClick,
    loading = false,
    className = ''
}) => {
    const getTrendIcon = () => {
        if (trend === 'up') return <FiTrendingUp className="w-4 h-4" />;
        if (trend === 'down') return <FiTrendingDown className="w-4 h-4" />;
        return <FiMinus className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-600 bg-green-50';
        if (trend === 'down') return 'text-red-600 bg-red-50';
        return 'text-gray-600 bg-gray-50';
    };

    if (loading) {
        return (
            <div className={`card animate-pulse ${className}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
        );
    }

    return (
        <div
            className={`card group ${onClick ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1' : ''} ${className}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {value}
                    </h3>
                </div>

                {Icon && (
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>

            {change !== undefined && change !== null && (
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${getTrendColor()}`}>
                        {getTrendIcon()}
                        <span>{Math.abs(change)}%</span>
                    </span>
                    <span className="text-xs text-gray-500">vs last period</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;