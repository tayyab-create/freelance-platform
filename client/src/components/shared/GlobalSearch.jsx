import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiSearch, FiX, FiBriefcase, FiUser, FiMessageCircle, FiClock, FiTrendingUp } from 'react-icons/fi';
import { jobAPI, workerAPI, companyAPI, adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const GlobalSearch = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    jobs: [],
    users: [],
    recent: []
  });
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults({ jobs: [], users: [], recent: [] });
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) return;

    setLoading(true);
    try {
      const searchResults = { jobs: [], users: [], recent: [] };

      // Search jobs based on role
      if (user?.role === 'worker') {
        try {
          const jobsResponse = await jobAPI.searchJobs({ search: searchQuery, limit: 5 });
          searchResults.jobs = jobsResponse.data?.data?.jobs || [];
        } catch (error) {
          console.error('Job search error:', error);
        }
      } else if (user?.role === 'company') {
        try {
          const jobsResponse = await companyAPI.getJobs();
          const filteredJobs = (jobsResponse.data?.data || [])
            .filter(job =>
              job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              job.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .slice(0, 5);
          searchResults.jobs = filteredJobs;
        } catch (error) {
          console.error('Job search error:', error);
        }
      }

      // Admin can search users
      if (user?.role === 'admin') {
        try {
          const usersResponse = await adminAPI.getAllUsers();
          const filteredUsers = (usersResponse.data?.data || [])
            .filter(u =>
              u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.email?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .slice(0, 5);
          searchResults.users = filteredUsers;
        } catch (error) {
          console.error('User search error:', error);
        }
      }

      setResults(searchResults);
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (type, item) => {
    // Save to recent searches
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const newSearch = { type, item, timestamp: Date.now() };
    const updatedSearches = [newSearch, ...recentSearches.filter(s => s.item._id !== item._id)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

    // Navigate based on type
    if (type === 'job') {
      if (user?.role === 'worker') {
        navigate(`/worker/jobs/${item._id}`);
      } else if (user?.role === 'company') {
        navigate(`/company/jobs/${item._id}`);
      }
    } else if (type === 'user') {
      navigate(`/admin/users`);
    }

    onClose();
    setQuery('');
  };

  const loadRecentSearches = () => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setResults({ ...results, recent });
  };

  useEffect(() => {
    if (isOpen && query.length === 0) {
      loadRecentSearches();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allResults = [
    ...results.jobs.map(job => ({ type: 'job', data: job })),
    ...results.users.map(user => ({ type: 'user', data: user }))
  ];

  const filteredResults = activeCategory === 'all'
    ? allResults
    : allResults.filter(r => r.type === activeCategory);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="flex items-start justify-center min-h-screen pt-20 px-4">
        <div
          ref={modalRef}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all animate-slide-up"
        >
          {/* Search Input */}
          <div className="relative border-b border-gray-200">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, users, messages..."
              className="w-full pl-16 pr-16 py-5 text-lg outline-none rounded-t-2xl"
              autoComplete="off"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-16 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close search"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Category Filters */}
          {query.length >= 2 && (
            <div className="flex gap-2 px-6 py-3 border-b border-gray-100 overflow-x-auto">
              {[
                { key: 'all', label: 'All', count: allResults.length },
                { key: 'job', label: 'Jobs', count: results.jobs.length },
                ...(user?.role === 'admin' ? [{ key: 'user', label: 'Users', count: results.users.length }] : [])
              ].map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    activeCategory === category.key
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                  {category.count > 0 && (
                    <span className={`ml-2 ${activeCategory === category.key ? 'text-white/80' : 'text-gray-500'}`}>
                      ({category.count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto scrollbar-custom">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : query.length >= 2 ? (
              filteredResults.length > 0 ? (
                <div className="py-2">
                  {filteredResults.map((result, index) => (
                    <button
                      key={`${result.type}-${result.data._id}-${index}`}
                      onClick={() => handleResultClick(result.type, result.data)}
                      className="w-full px-6 py-4 hover:bg-gray-50 transition-colors flex items-start gap-4 text-left group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        result.type === 'job'
                          ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                          : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
                      }`}>
                        {result.type === 'job' ? <FiBriefcase className="w-5 h-5" /> : <FiUser className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                          {result.type === 'job' ? result.data.title : result.data.name}
                        </h4>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {result.type === 'job'
                            ? result.data.description?.substring(0, 100) + '...'
                            : result.data.email
                          }
                        </p>
                        {result.type === 'job' && result.data.salary && (
                          <p className="text-sm font-medium text-green-600 mt-1">
                            ${result.data.salary} {result.data.salaryType}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 flex-shrink-0">
                        {result.type === 'job' ? 'Job' : 'User'}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <FiSearch className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">Try adjusting your search query</p>
                </div>
              )
            ) : (
              <div className="py-8 px-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  Recent Searches
                </h3>
                {results.recent.length > 0 ? (
                  <div className="space-y-2">
                    {results.recent.map((recent, index) => (
                      <button
                        key={index}
                        onClick={() => handleResultClick(recent.type, recent.item)}
                        className="w-full px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 text-left"
                      >
                        <FiTrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{recent.item.title || recent.item.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recent searches</p>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Tips</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                      Type at least 2 characters to search
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                      Use filters to narrow results
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                      Press <kbd className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">Esc</kbd> to close
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer with keyboard shortcuts */}
          <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded font-mono">↑</kbd>
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded font-mono">↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded font-mono">Enter</kbd>
                  <span>Select</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded font-mono">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
