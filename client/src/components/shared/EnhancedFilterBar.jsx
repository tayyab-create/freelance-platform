import React, { useState, useCallback, useEffect } from 'react';
import { FiSearch, FiFilter, FiX, FiMapPin, FiDollarSign, FiHome, FiTrendingUp } from 'react-icons/fi';
import CustomSelect from './CustomSelect';

const EnhancedFilterBar = ({
    onSearch,
    onFilterChange,
    searchPlaceholder = 'Search jobs...',
    showSalaryFilter = true,
    showLocationFilter = true,
    showRemoteFilter = true,
    showSortOptions = true,
    className = '',
    initialFilters = {}
}) => {
    const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        salaryMin: initialFilters.salaryMin || '',
        salaryMax: initialFilters.salaryMax || '',
        location: initialFilters.location || '',
        remoteOnly: initialFilters.remoteOnly || false,
        sortBy: initialFilters.sortBy || 'newest',
        category: initialFilters.category || '',
        experienceLevel: initialFilters.experienceLevel || '',
        ...initialFilters
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch) {
                onSearch(searchQuery);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, onSearch]);

    // Notify parent of filter changes
    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(filters);
        }
    }, [filters, onFilterChange]);

    const handleFilterUpdate = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearAllFilters = () => {
        const clearedFilters = {
            salaryMin: '',
            salaryMax: '',
            location: '',
            remoteOnly: false,
            sortBy: 'newest',
            category: '',
            experienceLevel: ''
        };
        setFilters(clearedFilters);
        setSearchQuery('');
        if (onSearch) onSearch('');
        if (onFilterChange) onFilterChange(clearedFilters);
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (searchQuery) count++;
        if (filters.salaryMin || filters.salaryMax) count++;
        if (filters.location) count++;
        if (filters.remoteOnly) count++;
        if (filters.category) count++;
        if (filters.experienceLevel) count++;
        return count;
    };

    const removeFilter = (filterKey) => {
        if (filterKey === 'search') {
            setSearchQuery('');
            if (onSearch) onSearch('');
        } else if (filterKey === 'salary') {
            handleFilterUpdate('salaryMin', '');
            handleFilterUpdate('salaryMax', '');
        } else {
            handleFilterUpdate(filterKey, filterKey === 'remoteOnly' ? false : '');
        }
    };

    const activeFilterCount = getActiveFilterCount();

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Search and Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                if (onSearch) onSearch('');
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiX className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`
                        px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap
                        ${showFilters
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600'
                        }
                    `}
                >
                    <FiFilter className="w-5 h-5" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${showFilters ? 'bg-white text-primary-600' : 'bg-primary-50 text-primary-600'}`}>
                            {activeFilterCount}
                        </span>
                    )}
                </button>


                {/* Sort Dropdown */}
                {showSortOptions && (
                    <CustomSelect
                        value={filters.sortBy}
                        onChange={(e) => handleFilterUpdate('sortBy', e.target.value)}
                        options={[
                            { value: 'newest', label: 'Newest First' },
                            { value: 'oldest', label: 'Oldest First' },
                            { value: 'salary-high', label: 'Highest Salary' },
                            { value: 'salary-low', label: 'Lowest Salary' },
                            { value: 'deadline', label: 'Deadline Soon' }
                        ]}
                        icon={FiTrendingUp}
                    />
                )}
            </div>

            {/* Active Filter Tags */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">Active:</span>

                    {searchQuery && (
                        <FilterTag
                            label={`"${searchQuery}"`}
                            onRemove={() => removeFilter('search')}
                        />
                    )}

                    {(filters.salaryMin || filters.salaryMax) && (
                        <FilterTag
                            label={`$${filters.salaryMin || '0'} - $${filters.salaryMax || '∞'}`}
                            icon={<FiDollarSign className="w-3 h-3" />}
                            onRemove={() => removeFilter('salary')}
                        />
                    )}

                    {filters.location && (
                        <FilterTag
                            label={filters.location}
                            icon={<FiMapPin className="w-3 h-3" />}
                            onRemove={() => removeFilter('location')}
                        />
                    )}

                    {filters.remoteOnly && (
                        <FilterTag
                            label="Remote Only"
                            icon={<FiHome className="w-3 h-3" />}
                            onRemove={() => removeFilter('remoteOnly')}
                        />
                    )}

                    {filters.category && (
                        <FilterTag
                            label={filters.category}
                            onRemove={() => removeFilter('category')}
                        />
                    )}

                    {filters.experienceLevel && (
                        <FilterTag
                            label={filters.experienceLevel}
                            onRemove={() => removeFilter('experienceLevel')}
                        />
                    )}

                    <button
                        onClick={clearAllFilters}
                        className="text-sm text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Advanced Filter Panel */}
            {showFilters && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg animate-slide-down">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Salary Range Filter */}
                        {showSalaryFilter && (
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <FiDollarSign className="w-4 h-4 text-primary-500" />
                                    Salary Range
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.salaryMin}
                                        onChange={(e) => handleFilterUpdate('salaryMin', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                                    />
                                    <span className="text-gray-400 self-center">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.salaryMax}
                                        onChange={(e) => handleFilterUpdate('salaryMax', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                                    />
                                </div>
                                {(filters.salaryMin || filters.salaryMax) && (
                                    <p className="text-xs text-gray-500">
                                        ${filters.salaryMin || '0'} - ${filters.salaryMax || 'No limit'}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Location Filter */}
                        {showLocationFilter && (
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <FiMapPin className="w-4 h-4 text-primary-500" />
                                    Location
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., New York, Remote"
                                    value={filters.location}
                                    onChange={(e) => handleFilterUpdate('location', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                                />
                            </div>
                        )}

                        {/* Remote Toggle */}
                        {showRemoteFilter && (
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <FiHome className="w-4 h-4 text-primary-500" />
                                    Work Type
                                </label>
                                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={filters.remoteOnly}
                                        onChange={(e) => handleFilterUpdate('remoteOnly', e.target.checked)}
                                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-offset-0"
                                    />
                                    <span className="text-sm text-gray-700 font-medium">Remote jobs only</span>
                                </label>
                            </div>
                        )}

                        {/* Category Filter */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FiTrendingUp className="w-4 h-4 text-primary-500" />
                                Category
                            </label>
                            <CustomSelect
                                value={filters.category}
                                onChange={(e) => handleFilterUpdate('category', e.target.value)}
                                options={[
                                    { value: '', label: 'All Categories' },
                                    { value: 'Web Development', label: 'Web Development' },
                                    { value: 'Mobile Development', label: 'Mobile Development' },
                                    { value: 'Design', label: 'Design' },
                                    { value: 'Writing', label: 'Writing' },
                                    { value: 'Marketing', label: 'Marketing' },
                                    { value: 'Data Science', label: 'Data Science' }
                                ]}
                                placeholder="All Categories"
                            />
                        </div>

                        {/* Experience Level Filter */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FiTrendingUp className="w-4 h-4 text-primary-500" />
                                Experience Level
                            </label>
                            <CustomSelect
                                value={filters.experienceLevel}
                                onChange={(e) => handleFilterUpdate('experienceLevel', e.target.value)}
                                options={[
                                    { value: '', label: 'All Levels' },
                                    { value: 'entry', label: 'Entry Level' },
                                    { value: 'intermediate', label: 'Intermediate' },
                                    { value: 'expert', label: 'Expert' }
                                ]}
                                placeholder="All Levels"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Filter Tag Component
const FilterTag = ({ label, icon, onRemove }) => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium border border-primary-200 shadow-sm">
        {icon}
        {label}
        <button
            onClick={onRemove}
            className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${label} filter`}
        >
            <FiX className="w-3.5 h-3.5" />
        </button>
    </span>
);

export default EnhancedFilterBar;
