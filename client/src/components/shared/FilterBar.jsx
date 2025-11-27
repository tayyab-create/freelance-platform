import React, { useState } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import Select from './CustomSelect';
import DatePicker from './DatePicker';

const FilterBar = ({
    onSearch,
    onFilterChange,
    filters = [],
    searchPlaceholder = 'Search...',
    className = ''
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState({});
    const [showFilters, setShowFilters] = useState(false);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    const handleFilterChange = (filterKey, value) => {
        const newFilters = { ...activeFilters };

        if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
            delete newFilters[filterKey];
        } else {
            newFilters[filterKey] = value;
        }

        setActiveFilters(newFilters);

        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    const clearAllFilters = () => {
        setActiveFilters({});
        setSearchQuery('');
        if (onFilterChange) {
            onFilterChange({});
        }
        if (onSearch) {
            onSearch('');
        }
    };

    const getActiveFilterCount = () => {
        return Object.keys(activeFilters).length + (searchQuery ? 1 : 0);
    };

    const removeFilter = (filterKey) => {
        handleFilterChange(filterKey, null);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Search and Filter Toggle */}
            <div className="flex gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                </div>

                {/* Filter Toggle Button */}
                {filters.length > 0 && (
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`
              px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${showFilters
                                ? 'bg-primary-500 text-white'
                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                            }
            `}
                    >
                        <FiFilter className="w-5 h-5" />
                        <span className="hidden sm:inline">Filters</span>
                        {getActiveFilterCount() > 0 && (
                            <span className="bg-white text-primary-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                {getActiveFilterCount()}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* Active Filter Tags */}
            {getActiveFilterCount() > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">Active filters:</span>

                    {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                            Search: "{searchQuery}"
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    if (onSearch) onSearch('');
                                }}
                                className="hover:bg-primary-200 rounded-full p-0.5"
                            >
                                <FiX className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {Object.entries(activeFilters).map(([key, value]) => {
                        const filter = filters.find(f => f.key === key);
                        const displayValue = Array.isArray(value) ? value.join(', ') : value;

                        return (
                            <span
                                key={key}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                            >
                                {filter?.label}: {displayValue}
                                <button
                                    onClick={() => removeFilter(key)}
                                    className="hover:bg-gray-200 rounded-full p-0.5"
                                >
                                    <FiX className="w-3 h-3" />
                                </button>
                            </span>
                        );
                    })}

                    <button
                        onClick={clearAllFilters}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Filter Panel */}
            {showFilters && filters.length > 0 && (
                <div className="card bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filters.map((filter) => (
                            <div key={filter.key}>
                                <label className="label">{filter.label}</label>

                                {filter.type === 'select' && (
                                    <Select
                                        value={activeFilters[filter.key] || ''}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                        options={[
                                            { value: "", label: "All" },
                                            ...filter.options
                                        ]}
                                    />
                                )}

                                {filter.type === 'multiselect' && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {filter.options.map((option) => (
                                            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={(activeFilters[filter.key] || []).includes(option.value)}
                                                    onChange={(e) => {
                                                        const current = activeFilters[filter.key] || [];
                                                        const newValue = e.target.checked
                                                            ? [...current, option.value]
                                                            : current.filter(v => v !== option.value);
                                                        handleFilterChange(filter.key, newValue);
                                                    }}
                                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                />
                                                <span className="text-sm text-gray-700">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {filter.type === 'range' && (
                                    <div className="space-y-2">
                                        <input
                                            type="range"
                                            min={filter.min}
                                            max={filter.max}
                                            step={filter.step || 1}
                                            value={activeFilters[filter.key] || filter.min}
                                            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span>{filter.min}</span>
                                            <span className="font-bold">{activeFilters[filter.key] || filter.min}</span>
                                            <span>{filter.max}</span>
                                        </div>
                                    </div>
                                )}

                                {filter.type === 'date' && (
                                    <DatePicker
                                        value={activeFilters[filter.key] || ''}
                                        onChange={(date) => handleFilterChange(filter.key, date ? date.toISOString().split('T')[0] : null)}
                                        className="w-full"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterBar;