import React, { useState } from 'react';
import { FiBookmark, FiCheck } from 'react-icons/fi';
import { workerAPI } from '../../services/api';
import toast from '../../utils/toast';
import Modal from './Modal';

/**
 * SaveSearchButton Component
 * Allows users to save their current search filters for quick access later
 */
const SaveSearchButton = ({ filters, onSaved, className = '' }) => {
    const [showModal, setShowModal] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [notifyOnNewMatches, setNotifyOnNewMatches] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!searchName.trim()) {
            toast.error('Please enter a name for this search');
            return;
        }

        setLoading(true);
        try {
            const response = await workerAPI.createSavedSearch({
                name: searchName.trim(),
                filters,
                notifyOnNewMatches
            });

            toast.success('Search saved successfully!');
            setShowModal(false);
            setSearchName('');
            if (onSaved) onSaved(response.data.data);
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to save search';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Check if there are any active filters
    const hasActiveFilters = Object.values(filters || {}).some(value => {
        if (typeof value === 'boolean') return value;
        return value && value.trim && value.trim() !== '';
    });

    if (!hasActiveFilters) {
        return null; // Don't show button if no filters are active
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-primary-500 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-sm hover:shadow-md ${className}`}
                title="Save this search for quick access later"
            >
                <FiBookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Save Search</span>
            </button>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Save This Search"
                size="md"
            >
                <div className="space-y-6">
                    {/* Description */}
                    <p className="text-gray-600">
                        Save your current search filters to quickly access matching jobs in the future.
                    </p>

                    {/* Active Filters Preview */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Active Filters:</h4>
                        <div className="flex flex-wrap gap-2">
                            {filters.search && (
                                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                                    "{filters.search}"
                                </span>
                            )}
                            {filters.category && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                    {filters.category}
                                </span>
                            )}
                            {filters.experienceLevel && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                    {filters.experienceLevel}
                                </span>
                            )}
                            {(filters.salaryMin || filters.salaryMax) && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                    ${filters.salaryMin || '0'} - ${filters.salaryMax || '∞'}
                                </span>
                            )}
                            {filters.location && (
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                                    📍 {filters.location}
                                </span>
                            )}
                            {filters.remoteOnly && (
                                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                                    Remote Only
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Search Name Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Search Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            placeholder="e.g., Senior React Jobs in NYC"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            maxLength={50}
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {searchName.length}/50 characters
                        </p>
                    </div>

                    {/* Notification Toggle */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <input
                            type="checkbox"
                            id="notifyOnNewMatches"
                            checked={notifyOnNewMatches}
                            onChange={(e) => setNotifyOnNewMatches(e.target.checked)}
                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-offset-0 mt-0.5"
                        />
                        <label htmlFor="notifyOnNewMatches" className="flex-1 cursor-pointer">
                            <span className="block text-sm font-semibold text-gray-900">
                                Notify me of new matches
                            </span>
                            <span className="block text-xs text-gray-600 mt-1">
                                Get email notifications when new jobs match this search
                            </span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || !searchName.trim()}
                            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FiCheck className="w-5 h-5" />
                                    Save Search
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default SaveSearchButton;
