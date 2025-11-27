import React, { useEffect, useState } from 'react';
import { adminAPI, jobAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiFilter, FiTrash2, FiEye, FiCalendar, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import { toast } from '../../utils/toast';
import {
    PageHeader,
    SkeletonLoader,
    StatusBadge,
    ResponsiveTable,
    DeleteConfirmationModal,
    Modal,
    Select
} from '../../components/shared';
import useUndo from '../../hooks/useUndo';

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({ status: '', category: '' });

    // Modal State
    const [selectedJob, setSelectedJob] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Delete State
    const [itemToDelete, setItemToDelete] = useState(null);
    const { executeWithUndo } = useUndo();

    useEffect(() => {
        fetchJobs();
        fetchCategories();
    }, [filters]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllJobs(filters);
            setJobs(response.data.data);
        } catch (error) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await jobAPI.getCategories();
            setCategories(response.data.data);
        } catch (error) {
            console.error('Failed to load categories');
        }
    };

    const handleDeleteClick = (job) => {
        setItemToDelete(job);
    };

    const handleDeleteConfirm = async () => {
        const item = itemToDelete;
        setItemToDelete(null);

        // Optimistic update
        const previousJobs = [...jobs];
        setJobs(jobs.filter(j => j._id !== item._id));

        if (selectedJob && selectedJob._id === item._id) {
            closeModal();
        }

        executeWithUndo({
            action: async () => {
                await adminAPI.deleteJob(item._id);
                // Optional: fetchJobs() to sync
            },
            message: 'Job deleted',
            onUndo: () => {
                setJobs(previousJobs);
            },
            undoMessage: 'Job restored'
        });
    };

    const openModal = (job) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedJob(null);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'posted':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"><FiCheckCircle className="h-3 w-3" /> Active</span>;
            case 'assigned':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"><FiClock className="h-3 w-3" /> In Progress</span>;
            case 'completed':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700"><FiCheckCircle className="h-3 w-3" /> Completed</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">{status}</span>;
        }
    };

    const columns = [
        {
            key: 'title',
            label: 'Job Title',
            primary: true,
            render: (value, row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{row.category}</div>
                </div>
            )
        },
        {
            key: 'company',
            label: 'Company',
            render: (value, row) => (
                <div className="flex items-center gap-2">
                    {row.companyInfo?.logo ? (
                        <img src={row.companyInfo.logo} alt="" className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                        <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {row.companyInfo?.companyName?.charAt(0) || 'C'}
                        </div>
                    )}
                    <span className="text-sm text-gray-700">{row.companyInfo?.companyName || 'Unknown Company'}</span>
                </div>
            )
        },
        {
            key: 'salary',
            label: 'Budget',
            render: (value, row) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">${row.salary}</div>
                    <div className="text-xs text-gray-500 capitalize">{row.salaryType}</div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => getStatusBadge(value)
        },
        {
            key: 'createdAt',
            label: 'Posted Date',
            render: (value) => new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
                        <p className="text-gray-500 text-sm mt-1">Monitor and manage all job postings</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-48">
                            <Select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                options={[
                                    { value: "", label: "All Categories" },
                                    ...categories.map(cat => ({ value: cat, label: cat }))
                                ]}
                            />
                        </div>
                        <div className="w-40">
                            <Select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                options={[
                                    { value: "", label: "All Status" },
                                    { value: "posted", label: "Active" },
                                    { value: "assigned", label: "In Progress" },
                                    { value: "completed", label: "Completed" }
                                ]}
                            />
                        </div>
                        <button onClick={fetchJobs} className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                            <FiFilter className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Table View */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <ResponsiveTable
                        columns={columns}
                        data={jobs}
                        loading={loading}
                        emptyMessage="No jobs found matching your filters."
                        actions={(row) => [
                            {
                                label: 'View Details',
                                icon: FiEye,
                                onClick: () => openModal(row)
                            },
                            {
                                label: 'Delete',
                                icon: FiTrash2,
                                variant: 'danger',
                                onClick: () => handleDeleteClick(row)
                            }
                        ]}
                    />
                </div>

                {/* Job Details Modal */}
                <Modal
                    isOpen={isModalOpen && !!selectedJob}
                    onClose={closeModal}
                    title={selectedJob?.title}
                    size="lg"
                    footer={
                        <>
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleDeleteClick(selectedJob)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                                <FiTrash2 /> Delete Job
                            </button>
                        </>
                    }
                >
                    {selectedJob && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                    {selectedJob.category}
                                </span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                                    {selectedJob.experienceLevel} Level
                                </span>
                                {getStatusBadge(selectedJob.status)}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Company</div>
                                    <div className="flex items-center gap-3">
                                        {selectedJob.companyInfo?.logo ? (
                                            <img src={selectedJob.companyInfo.logo} alt="" className="h-10 w-10 rounded-lg object-cover" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                {selectedJob.companyInfo?.companyName?.charAt(0) || 'C'}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-bold text-gray-900">{selectedJob.companyInfo?.companyName || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{selectedJob.company?.email}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                                    <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Budget</div>
                                    <div className="flex items-center gap-2">
                                        <FiDollarSign className="text-green-600 h-5 w-5" />
                                        <div>
                                            <div className="font-bold text-gray-900">${selectedJob.salary}</div>
                                            <div className="text-xs text-gray-500 capitalize">{selectedJob.salaryType}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {selectedJob.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedJob.tags?.map((tag, i) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-sm">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Deadline</div>
                                    <div className="flex items-center gap-2 font-medium text-gray-900">
                                        <FiCalendar className="text-gray-400" />
                                        {new Date(selectedJob.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Duration</div>
                                    <div className="flex items-center gap-2 font-medium text-gray-900">
                                        <FiClock className="text-gray-400" />
                                        {selectedJob.duration}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={!!itemToDelete}
                    onClose={() => setItemToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    itemName={itemToDelete?.title}
                    itemType="job"
                />
            </div>
        </DashboardLayout>
    );
};

export default ManageJobs;
