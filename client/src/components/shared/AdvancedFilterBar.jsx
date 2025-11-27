import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiFilter, FiX, FiDollarSign, FiBriefcase, FiCalendar, FiCheck, FiChevronDown } from 'react-icons/fi';
import DatePicker from './DatePicker';
import CustomSelect from './CustomSelect';

const AdvancedFilterBar = ({
    onFilterChange,
    searchPlaceholder = 'Search...',
    statusOptions = [], // [{ value: 'pending', label: 'Pending', count: 5 }]
    showStatusFilter = true,
    initialFilters = {}
}) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        status: [], // Array of selected status values
        company: '',
        level: '',
        budgetMin: '',
        budgetMax: '',
        deadlineStart: null,
        deadlineEnd: null,
        ...initialFilters
    });

    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const statusDropdownRef = useRef(null);

    // Close status dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setIsStatusDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounce search and notify parent
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange(filters);
        }, 300);
        return () => clearTimeout(timer);
    }, [filters, onFilterChange]);

    const handleFilterUpdate = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const toggleStatus = (value) => {
        setFilters(prev => {
            const current = prev.status || [];
            const isSelected = current.includes(value);
            if (isSelected) {
                return { ...prev, status: current.filter(item => item !== value) };
            } else {
                return { ...prev, status: [...current, value] };
            }
        });
    };

    const clearAllFilters = () => {
        setFilters({
            search: '',
            status: [],
            company: '',
            level: '',
            budgetMin: '',
            budgetMax: '',
            deadlineStart: null,
            deadlineEnd: null
        });
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.status?.length > 0) count++;
        if (filters.company) count++;
        if (filters.level) count++;
        if (filters.budgetMin || filters.budgetMax) count++;
        if (filters.deadlineStart || filters.deadlineEnd) count++;
        return count;
    };

    const activeCount = getActiveFilterCount();

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={filters.search}
                        onChange={(e) => handleFilterUpdate('search', e.target.value)}
                        className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all shadow-sm"
                    />
                    {filters.search && (
                        <button
                            onClick={() => handleFilterUpdate('search', '')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                        >
                            <FiX className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm border ${showFilters || activeCount > 0
                        ? 'bg-primary-600 text-white border-primary-600 shadow-primary-500/30'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <FiFilter className="h-5 w-5" />
                    Filters
                    {activeCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold ${showFilters || activeCount > 0 ? 'bg-white text-primary-600' : 'bg-primary-100 text-primary-700'
                            }`}>
                            {activeCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Expanded Filter Panel */}
            {showFilters && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg animate-fade-in space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Status Filter (Multi-select) */}
                        {showStatusFilter && (
                            <div className="space-y-2" ref={statusDropdownRef}>
                                <label className="text-sm font-bold text-gray-700 block">Status</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                        className="w-full px-4 py-2.5 text-left bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                                    >
                                        <span className="text-gray-700 truncate">
                                            {filters.status?.length > 0
                                                ? `${filters.status.length} selected`
                                                : 'Select Status'}
                                        </span>
                                        <FiChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isStatusDropdownOpen && (
                                        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
                                            {statusOptions.map((option) => (
                                                <div
                                                    key={option.value}
                                                    onClick={() => toggleStatus(option.value)}
                                                    className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                                >
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.status.includes(option.value)
                                                        ? 'bg-primary-600 border-primary-600 text-white'
                                                        : 'border-gray-300 bg-white'
                                                        }`}>
                                                        {filters.status.includes(option.value) && <FiCheck className="h-3.5 w-3.5" />}
                                                    </div>
                                                    <span className="flex-1 text-gray-700 font-medium">{option.label}</span>
                                                    {option.count !== undefined && (
                                                        <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                                                            {option.count}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Company Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 block">Company</label>
                            <div className="relative">
                                <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Company Name"
                                    value={filters.company}
                                    onChange={(e) => handleFilterUpdate('company', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Experience Level */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 block">Experience Level</label>
                            <CustomSelect
                                value={filters.level}
                                onChange={(e) => handleFilterUpdate('level', e.target.value)}
                                options={[
                                    { value: '', label: 'All Levels' },
                                    { value: 'entry', label: 'Entry Level' },
                                    { value: 'intermediate', label: 'Intermediate' },
                                    { value: 'expert', label: 'Expert' }
                                ]}
                                placeholder="All Levels"
                            />
                        </div>

                        {/* Budget Range */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 block">Budget Range</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.budgetMin}
                                        onChange={(e) => handleFilterUpdate('budgetMin', e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.budgetMax}
                                        onChange={(e) => handleFilterUpdate('budgetMax', e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Deadline Range */}
                        <div className="space-y-2 md:col-span-2 lg:col-span-1">
                            <label className="text-sm font-bold text-gray-700 block">Deadline Range</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <DatePicker
                                        placeholder="From"
                                        value={filters.deadlineStart}
                                        onChange={(date) => handleFilterUpdate('deadlineStart', date)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex-1">
                                    <DatePicker
                                        placeholder="To"
                                        value={filters.deadlineEnd}
                                        onChange={(date) => handleFilterUpdate('deadlineEnd', date)}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            onClick={clearAllFilters}
                            className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilterBar;
