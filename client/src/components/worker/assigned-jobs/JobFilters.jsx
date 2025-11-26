import React from 'react';
import { FiSearch } from 'react-icons/fi';

const JobFilters = ({
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    counts
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search jobs by title or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all shadow-sm"
                />
            </div>

            {/* Filter Tabs */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-1.5 overflow-x-auto w-full md:w-auto">
                <div className="flex gap-1 min-w-max">
                    {[
                        { key: 'all', label: 'All Jobs' },
                        { key: 'assigned', label: 'Assigned' },
                        { key: 'in-progress', label: 'In Progress' },
                        { key: 'submitted', label: 'Submitted' },
                        { key: 'completed', label: 'Completed' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${filter === tab.key
                                ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                                : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${filter === tab.key ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {counts[tab.key] || 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JobFilters;
