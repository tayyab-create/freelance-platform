import React from 'react';

const JobMetaItem = ({ icon: Icon, label, value, subValue, color = 'blue' }) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
            <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
                {subValue && <p className="text-xs text-gray-500 font-medium mt-0.5">{subValue}</p>}
            </div>
        </div>
    );
};

export default JobMetaItem;
