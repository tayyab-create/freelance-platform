import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiSearch, FiX, FiLoader, FiBriefcase, FiUser } from 'react-icons/fi';
import { jobAPI, companyAPI, adminAPI } from '../../services/api';

const GlobalSearch = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState({ jobs: [], users: [] });
    const [loading, setLoading] = useState(false);
    const searchTimeoutRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setResults({ jobs: [], users: [] });
        }
    }, [isOpen]);

    const performSearch = async (query) => {
        if (!query.trim()) {
            setResults({ jobs: [], users: [] });
            setLoading(false);
            return;
        }

        setLoading(true);
        const searchResults = { jobs: [], users: [] };

        try {
            if (user?.role === 'worker') {
                const response = await jobAPI.getAllJobs({ search: query, limit: 5 });
                searchResults.jobs = response.data?.data || [];
            } else if (user?.role === 'company') {
                const response = await companyAPI.getMyJobs();
                const allJobs = response.data?.data || [];
                searchResults.jobs = allJobs
                    .filter(job =>
                        job.title.toLowerCase().includes(query.toLowerCase()) ||
                        job.description.toLowerCase().includes(query.toLowerCase())
                    )
                    .slice(0, 5);
            } else if (user?.role === 'admin') {
                const response = await adminAPI.getAllUsers();
                const allUsers = response.data?.data || [];
                searchResults.users = allUsers
                    .filter(u =>
                        u.name.toLowerCase().includes(query.toLowerCase()) ||
                        u.email.toLowerCase().includes(query.toLowerCase())
                    )
                    .slice(0, 5);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setResults(searchResults);
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            performSearch(query);
        }, 300);
    };

    const handleResultClick = (type, item) => {
        onClose();
        if (type === 'job') {
            if (user?.role === 'worker') {
                navigate(`/worker/jobs/${item._id}`);
            } else if (user?.role === 'company') {
                navigate(`/company/jobs/${item._id}`);
            }
        } else if (type === 'user') {
            navigate(`/admin/users/${item._id}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="min-h-screen px-4 text-center">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                ></div>

                <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

                <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            className="block w-full pl-10 pr-3 py-4 border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            {loading ? (
                                <FiLoader className="h-5 w-5 text-primary-500 animate-spin" />
                            ) : (
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <FiX className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {(results.jobs.length > 0 || results.users.length > 0) && (
                        <div className="mt-4 max-h-96 overflow-y-auto">
                            {results.jobs.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Jobs
                                    </h3>
                                    <ul className="space-y-2">
                                        {results.jobs.map((job) => (
                                            <li
                                                key={job._id}
                                                onClick={() => handleResultClick('job', job)}
                                                className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors duration-150 flex items-center gap-3"
                                            >
                                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                                    <FiBriefcase className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{job.title}</p>
                                                    <p className="text-xs text-gray-500 truncate">{job.company?.name || 'Company'}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {results.users.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Users
                                    </h3>
                                    <ul className="space-y-2">
                                        {results.users.map((userItem) => (
                                            <li
                                                key={userItem._id}
                                                onClick={() => handleResultClick('user', userItem)}
                                                className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors duration-150 flex items-center gap-3"
                                            >
                                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                                    <FiUser className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{userItem.name}</p>
                                                    <p className="text-xs text-gray-500">{userItem.email}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {searchQuery && !loading && results.jobs.length === 0 && results.users.length === 0 && (
                        <div className="mt-8 text-center text-gray-500">
                            <p>No results found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
