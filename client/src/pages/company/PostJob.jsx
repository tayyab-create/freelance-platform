import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    FiBriefcase,
    FiDollarSign,
    FiClock,
    FiCalendar,
    FiFileText,
    FiTag,
    FiAward,
    FiArrowLeft,
    FiSend
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Select, PageHeader } from '../../components/shared';

const PostJob = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        tags: '',
        salary: '',
        salaryType: 'fixed',
        duration: '',
        experienceLevel: 'intermediate',
        requirements: '',
        deadline: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Convert tags and requirements to arrays
            const jobData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                requirements: formData.requirements.split('\n').filter(req => req.trim()),
                salary: Number(formData.salary),
            };

            await companyAPI.postJob(jobData);
            toast.success('Job posted successfully!');
            navigate('/company/jobs');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-8">
                {/* Header */}
                <PageHeader
                    title="Post a New Job"
                    subtitle="Fill in the details to find the perfect freelancer"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/company/dashboard' },
                        { label: 'My Jobs', href: '/company/jobs' },
                        { label: 'Post Job' }
                    ]}
                    actions={
                        <button
                            onClick={() => navigate('/company/jobs')}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors group"
                        >
                            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Jobs
                        </button>
                    }
                />

                <div className="max-w-4xl mx-auto">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Job Title */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                    <FiBriefcase className="w-5 h-5 text-primary-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Job Title</h2>
                            </div>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Full Stack Developer, UI/UX Designer"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-gray-700 placeholder:text-gray-400"
                            />
                        </div>

                        {/* Job Description */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <FiFileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
                            </div>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the job, responsibilities, and what you're looking for in detail..."
                                rows="6"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none text-gray-700 placeholder:text-gray-400"
                            />
                        </div>

                        {/* Category & Experience Level */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <FiTag className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Category</h2>
                                </div>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    icon={FiTag}
                                    options={[
                                        { value: '', label: 'Select Category' },
                                        { value: 'Web Development', label: 'Web Development' },
                                        { value: 'Mobile Development', label: 'Mobile Development' },
                                        { value: 'Design', label: 'Design' },
                                        { value: 'Writing', label: 'Writing' },
                                        { value: 'Marketing', label: 'Marketing' },
                                        { value: 'Data Science', label: 'Data Science' }
                                    ]}
                                />
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                        <FiAward className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Experience Level</h2>
                                </div>
                                <Select
                                    name="experienceLevel"
                                    value={formData.experienceLevel}
                                    onChange={handleChange}
                                    required
                                    icon={FiAward}
                                    options={[
                                        { value: 'entry', label: 'Entry Level' },
                                        { value: 'intermediate', label: 'Intermediate' },
                                        { value: 'expert', label: 'Expert' }
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Skills/Tags */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <FiTag className="w-5 h-5 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Skills & Tags</h2>
                            </div>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="React, Node.js, MongoDB, TypeScript (comma-separated)"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-gray-700 placeholder:text-gray-400"
                            />
                            <p className="text-sm text-gray-500 mt-2">Separate skills with commas</p>
                        </div>

                        {/* Budget & Salary Type */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                        <FiDollarSign className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Budget</h2>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiDollarSign className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        name="salary"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        placeholder="5000"
                                        required
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-gray-700"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <FiDollarSign className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Payment Type</h2>
                                </div>
                                <Select
                                    name="salaryType"
                                    value={formData.salaryType}
                                    onChange={handleChange}
                                    icon={FiDollarSign}
                                    options={[
                                        { value: 'fixed', label: 'Fixed Price' },
                                        { value: 'hourly', label: 'Hourly Rate' }
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Duration & Deadline */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <FiClock className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Duration</h2>
                                </div>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g., 2 months, 3 weeks"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-gray-700 placeholder:text-gray-400"
                                />
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                        <FiCalendar className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Deadline</h2>
                                </div>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-gray-700 bg-white"
                                />
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <FiFileText className="w-5 h-5 text-red-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Requirements</h2>
                            </div>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                placeholder="3+ years of experience&#10;Strong knowledge of React&#10;Portfolio required&#10;(one requirement per line)"
                                rows="6"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none text-gray-700 placeholder:text-gray-400"
                            />
                            <p className="text-sm text-gray-500 mt-2">Enter one requirement per line</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Posting Job...
                                    </>
                                ) : (
                                    <>
                                        <FiSend className="w-5 h-5" />
                                        Post Job
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/company/jobs')}
                                disabled={loading}
                                className="flex-1 px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold border border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PostJob;
