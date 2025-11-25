import React from 'react';

const SectionCard = ({ title, color = 'primary', children, className = '' }) => {
    const colorClasses = {
        primary: 'bg-primary-600',
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        purple: 'bg-purple-600',
        orange: 'bg-orange-600',
    };

    return (
        <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-8 ${className}`}>
            <div className="flex items-center gap-4 mb-6">
                <div className={`h-8 w-1.5 rounded-full ${colorClasses[color] || colorClasses.primary}`}></div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <div className="text-gray-700 leading-relaxed">
                {children}
            </div>
        </div>
    );
};

export default SectionCard;
