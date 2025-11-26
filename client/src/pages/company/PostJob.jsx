import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyAPI, uploadAPI } from '../../services/api';
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
    FiSend,
    FiPaperclip,
    FiX,
    FiFile
} from 'react-icons/fi';
import { toast } from '../../utils/toast';
import { Select, PageHeader, ConfirmationModal, SuccessAnimation } from '../../components/shared';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import FileUpload from '../../components/common/FileUpload';
import AutoSaveIndicator from '../../components/common/AutoSaveIndicator';
import UnsavedChangesModal from '../../components/common/UnsavedChangesModal';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChanges';
import { validationRules, ValidationSchema } from '../../utils/validation';

const PostJob = () => {
    const navigate = useNavigate();
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const [draftToRestore, setDraftToRestore] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

    // Validation schema
    const validationSchema = new ValidationSchema()
        .field('title', validationRules.required, validationRules.minLength(10), validationRules.maxLength(200))
        .field('description', validationRules.required, validationRules.minLength(50), validationRules.maxLength(5000))
        .field('category', validationRules.required)
        .field('salary', validationRules.required, validationRules.min(1))
        .field('duration', validationRules.required, validationRules.minLength(2))
        .build();

    // Form validation hook
    const {
        values: formData,
        errors,
        touched,
        isDirty,
        isSubmitting,
        isValid,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        resetForm,
    } = useFormValidation(
        {
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
        },
        validationSchema,
        { validateOnChange: true, validateOnBlur: true }
    );

    // Auto-save hook
    const {
        isSaving,
        lastSaved,
        hasUnsavedChanges,
        hasSavedData,
        restoreFromStorage,
        clearSaved,
    } = useAutoSave('postJobDraft', formData, {
        enabled: true,
        debounceDelay: 2000,
        exclude: [],
    });

    // Unsaved changes warning
    useUnsavedChangesWarning(
        isDirty && !isSubmitting && !showSuccess,
        'You have unsaved changes. Are you sure you want to leave?'
    );

    // Restore draft on mount
    useEffect(() => {
        if (hasSavedData) {
            const restored = restoreFromStorage();
            if (restored) {
                setDraftToRestore(restored);
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRestoreDraft = () => {
        if (draftToRestore) {
            Object.keys(draftToRestore.data).forEach((key) => {
                setFieldValue(key, draftToRestore.data[key]);
            });
            toast.success('Draft restored successfully!');
            setDraftToRestore(null);
        }
    };

    const handleDiscardDraft = () => {
        clearSaved();
        setDraftToRestore(null);
    };

    const handleFileUpload = async (filesInput) => {
        let files;
        if (Array.isArray(filesInput)) {
            files = filesInput;
        } else if (filesInput?.target?.files) {
            files = Array.from(filesInput.target.files);
        } else {
            return;
        }

        if (files.length === 0) return;

        setUploadingFiles(true);
        setUploadProgress(0);

        try {
            let completedUploads = 0;
            const totalFiles = files.length;

            const uploadPromises = files.map(async (file) => {
                const response = await uploadAPI.uploadSingle(
                    file,
                    'documents',
                    (progress) => {
                        const overallProgress = Math.round(
                            ((completedUploads + (progress / 100)) / totalFiles) * 100
                        );
                        setUploadProgress(overallProgress);
                    }
                );
                completedUploads++;
                return response;
            });

            const responses = await Promise.all(uploadPromises);

            const newFiles = responses.map(res => ({
                fileName: res.data.data.originalName,
                fileUrl: `${API_BASE_URL}${res.data.data.fileUrl}`,
                fileType: res.data.data.mimeType,
                fileSize: res.data.data.fileSize
            }));

            setUploadedFiles(prev => [...prev, ...newFiles]);
            toast.success(`${newFiles.length} file(s) uploaded successfully!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload files');
        } finally {
            setUploadingFiles(false);
            setUploadProgress(0);
        }
    };

    const handleRemoveFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (values) => {
        try {
            // Convert tags and requirements to arrays
            const jobData = {
                ...values,
                tags: values.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                requirements: values.requirements.split('\n').filter(req => req.trim()),
                salary: Number(values.salary),
                attachments: uploadedFiles
            };

            await companyAPI.postJob(jobData);
            clearSaved(); // Clear draft after successful submission
            setShowSuccess(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post job');
            throw error;
        }
    };

    const handleCancel = () => {
        if (isDirty) {
            setPendingNavigation('/company/jobs');
            setShowUnsavedModal(true);
        } else {
            navigate('/company/jobs');
        }
    };

    const confirmLeave = () => {
        setShowUnsavedModal(false);
        if (pendingNavigation) {
            clearSaved();
            navigate(pendingNavigation);
        }
    };

    const cancelLeave = () => {
        setShowUnsavedModal(false);
        setPendingNavigation(null);
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
                        <div className="flex items-center gap-4">
                            <AutoSaveIndicator
                                isSaving={isSaving}
                                lastSaved={lastSaved}
                                hasUnsavedChanges={hasUnsavedChanges}
                            />
                            <button
                                onClick={() => navigate('/company/jobs')}
                                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors group"
                            >
                                <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back to Jobs
                            </button>
                        </div>
                    }
                />

                <div className="max-w-4xl mx-auto">
                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Job Title */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                    <FiBriefcase className="w-5 h-5 text-primary-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Job Title</h2>
                            </div>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.title ? errors.title : ''}
                                placeholder="e.g., Full Stack Developer, UI/UX Designer"
                                required
                                maxLength={200}
                                showCharacterCount
                                helperText="Choose a clear, descriptive title that highlights the role"
                                className="mb-0"
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
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.description ? errors.description : ''}
                                placeholder="Describe the job, responsibilities, and what you're looking for in detail..."
                                rows={6}
                                required
                                maxLength={5000}
                                showCharacterCount
                                helperText="Provide a detailed overview to attract qualified candidates"
                                className="mb-0"
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
                                {touched.category && errors.category && (
                                    <p className="mt-2 text-sm text-red-600">{errors.category}</p>
                                )}
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
                            <Input
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="React, Node.js, MongoDB, TypeScript (comma-separated)"
                                helperText="Separate skills with commas to help candidates find your job"
                                className="mb-0"
                            />
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
                                <Input
                                    type="number"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.salary ? errors.salary : ''}
                                    placeholder="5000"
                                    required
                                    icon={FiDollarSign}
                                    helperText={formData.salaryType === 'hourly' ? 'Per hour rate' : 'Total project budget'}
                                    className="mb-0"
                                />
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
                                <Input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.duration ? errors.duration : ''}
                                    placeholder="e.g., 2 months, 3 weeks"
                                    required
                                    helperText="Estimated project duration"
                                    className="mb-0"
                                />
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                        <FiCalendar className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Deadline</h2>
                                </div>
                                <Input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    helperText="Application deadline (optional)"
                                    className="mb-0"
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
                            <Textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="3+ years of experience&#10;Strong knowledge of React&#10;Portfolio required&#10;(one requirement per line)"
                                rows={6}
                                helperText="Enter one requirement per line for clarity"
                                showCharacterCount
                                className="mb-0"
                            />
                        </div>

                        {/* Attachments */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <FiPaperclip className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Attachments (Optional)</h2>
                            </div>

                            <div className="space-y-3">
                                {/* Upload Area */}
                                {!uploadingFiles && (
                                    <FileUpload
                                        onFileSelect={handleFileUpload}
                                        multiple={true}
                                        accept="*/*"
                                        maxSize={10}
                                        showProgress={false}
                                    >
                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-primary-300 transition-all cursor-pointer group">
                                            <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                <FiPaperclip className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-700">Click to attach files</p>
                                            <p className="text-xs text-gray-400 mt-1">Documents, specifications, or references (max 10MB per file)</p>
                                        </div>
                                    </FileUpload>
                                )}

                                {/* Upload Progress */}
                                {uploadingFiles && (
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-center gap-2 text-primary-600">
                                                <div className="h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm font-medium">Uploading files...</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-center text-gray-500">{uploadProgress}%</p>
                                        </div>
                                    </div>
                                )}

                                {/* File List */}
                                {uploadedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                    <div className="p-2 bg-white rounded-lg border border-gray-100 text-blue-600">
                                                        <FiFile className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-700 truncate">{file.fileName}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <FiX className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || !isValid}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
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
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold border border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Unsaved Changes Modal */}
            <UnsavedChangesModal
                isOpen={showUnsavedModal}
                onConfirm={confirmLeave}
                onCancel={cancelLeave}
            />

            {/* Draft Restore Confirmation */}
            <ConfirmationModal
                isOpen={!!draftToRestore}
                onClose={handleDiscardDraft}
                onConfirm={handleRestoreDraft}
                title="Restore Draft?"
                message={`We found a draft from ${draftToRestore ? new Date(draftToRestore.timestamp).toLocaleString() : ''}. Would you like to restore it?`}
                confirmText="Restore Draft"
                cancelText="Discard"
                variant="info"
            />

            {/* Success Animation */}
            <SuccessAnimation
                show={showSuccess}
                message="Job Posted Successfully!"
                description="Your job is now live and visible to workers."
                showConfetti={true}
                onComplete={() => {
                    setShowSuccess(false);
                    navigate('/company/jobs');
                }}
            />
        </DashboardLayout>
    );
};

export default PostJob;
