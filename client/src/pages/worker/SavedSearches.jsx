import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookmark, FiTrash2, FiEdit2, FiBriefcase, FiBell, FiBellOff, FiSearch } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageHeader, SkeletonLoader } from '../../components/shared';
import { workerAPI } from '../../services/api';
import toast from '../../utils/toast';
import Modal from '../../components/shared/Modal';

const SavedSearches = () => {
    const navigate = useNavigate();
    const [savedSearches, setSavedSearches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ show: false, search: null });
    const [editModal, setEditModal] = useState({ show: false, search: null, name: '' });

    useEffect(() => {
        fetchSavedSearches();
    }, []);

    const fetchSavedSearches = async () => {
        try {
            setLoading(true);
            const response = await workerAPI.getSavedSearches();
            setSavedSearches(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load saved searches');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await workerAPI.deleteSavedSearch(deleteModal.search._id);
            toast.success('Search deleted successfully');
            setSavedSearches(savedSearches.filter(s => s._id !== deleteModal.search._id));
            setDeleteModal({ show: false, search: null });
        } catch (error) {
            toast.error('Failed to delete search');
        }
    };

    const handleEdit = async () => {
        if (!editModal.name.trim()) {
            toast.error('Please enter a name');
            return;
        }

        try {
            await workerAPI.updateSavedSearch(editModal.search._id, {
                name: editModal.name.trim()
            });
            toast.success('Search updated successfully');
            setSavedSearches(savedSearches.map(s =>
                s._id === editModal.search._id ? { ...s, name: editModal.name.trim() } : s
            ));
            setEditModal({ show: false, search: null, name: '' });
        } catch (error) {
            toast.error('Failed to update search');
        }
    };

    const toggleNotifications = async (search) => {
        try {
            await workerAPI.updateSavedSearch(search._id, {
                notifyOnNewMatches: !search.notifyOnNewMatches
            });
            setSavedSearches(savedSearches.map(s =>
                s._id === search._id ? { ...s, notifyOnNewMatches: !s.notifyOnNewMatches } : s
            ));
            toast.success(
                search.notifyOnNewMatches
                    ? 'Notifications disabled'
                    : 'Notifications enabled'
            );
        } catch (error) {
            toast.error('Failed to update notifications');
        }
    };

    const viewJobs = (search) => {
        // Navigate to browse jobs with the saved filters
        const queryParams = new URLSearchParams();
        if (search.filters.search) queryParams.set('search', search.filters.search);
        if (search.filters.category) queryParams.set('category', search.filters.category);
        if (search.filters.experienceLevel) queryParams.set('experienceLevel', search.filters.experienceLevel);
        if (search.filters.salaryMin) queryParams.set('salaryMin', search.filters.salaryMin);
        if (search.filters.salaryMax) queryParams.set('salaryMax', search.filters.salaryMax);
        if (search.filters.location) queryParams.set('location', search.filters.location);
        if (search.filters.remoteOnly) queryParams.set('remoteOnly', 'true');
        if (search.filters.sortBy) queryParams.set('sortBy', search.filters.sortBy);

        navigate(`/worker/browse-jobs?${queryParams.toString()}`);
    };

    const getFilterCount = (filters) => {
        let count = 0;
        if (filters.search) count++;
        if (filters.category) count++;
        if (filters.experienceLevel) count++;
        if (filters.salaryMin || filters.salaryMax) count++;
        if (filters.location) count++;
        if (filters.remoteOnly) count++;
        return count;
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-8">
                {/* Header */}
                <PageHeader
                    title="Saved Searches"
                    subtitle="Quick access to your favorite job searches"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/worker/dashboard' },
                        { label: 'Saved Searches' }
                    ]}
                    actions={
                        <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-3 rounded-2xl shadow-lg">
                            <p className="text-white font-bold text-lg">{savedSearches.length}/10 Saved</p>
                        </div>
                    }
                />

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SkeletonLoader type="card" count={3} />
                    </div>
                ) : savedSearches.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
                            <FiBookmark className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            No saved searches yet
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Save your job searches to quickly access matching jobs in the future.
                        </p>
                        <button
                            onClick={() => navigate('/worker/browse-jobs')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30"
                        >
                            <FiSearch className="w-5 h-5" />
                            Browse Jobs
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedSearches.map((search) => (
                            <div
                                key={search._id}
                                className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-primary-300 hover:shadow-lg transition-all group"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                                            {search.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {getFilterCount(search.filters)} filter{getFilterCount(search.filters) !== 1 ? 's' : ''} active
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleNotifications(search)}
                                            className={`p-2 rounded-lg transition-colors ${search.notifyOnNewMatches
                                                ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                }`}
                                            title={search.notifyOnNewMatches ? 'Notifications enabled' : 'Notifications disabled'}
                                        >
                                            {search.notifyOnNewMatches ? (
                                                <FiBell className="w-4 h-4" />
                                            ) : (
                                                <FiBellOff className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {search.filters.search && (
                                        <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium">
                                            "{search.filters.search}"
                                        </span>
                                    )}
                                    {search.filters.category && (
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                                            {search.filters.category}
                                        </span>
                                    )}
                                    {search.filters.experienceLevel && (
                                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                                            {search.filters.experienceLevel}
                                        </span>
                                    )}
                                    {(search.filters.salaryMin || search.filters.salaryMax) && (
                                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                                            ${search.filters.salaryMin || '0'} - ${search.filters.salaryMax || '∞'}
                                        </span>
                                    )}
                                    {search.filters.location && (
                                        <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium">
                                            📍 {search.filters.location}
                                        </span>
                                    )}
                                    {search.filters.remoteOnly && (
                                        <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium">
                                            Remote
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => viewJobs(search)}
                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiBriefcase className="w-4 h-4" />
                                        View Jobs
                                    </button>
                                    <button
                                        onClick={() => setEditModal({ show: true, search, name: search.name })}
                                        className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                                        title="Edit name"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteModal({ show: true, search })}
                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                        title="Delete search"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Created Date */}
                                <p className="text-xs text-gray-400 mt-3">
                                    Saved {new Date(search.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, search: null })}
                title="Delete Saved Search"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete "<strong>{deleteModal.search?.name}</strong>"? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteModal({ show: false, search: null })}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModal.show}
                onClose={() => setEditModal({ show: false, search: null, name: '' })}
                title="Edit Search Name"
                size="sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Search Name
                        </label>
                        <input
                            type="text"
                            value={editModal.name}
                            onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            maxLength={50}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setEditModal({ show: false, search: null, name: '' })}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEdit}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default SavedSearches;
