import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyAPI, uploadAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import { toast } from '../../utils/toast';
import { PageHeader, ConfirmationModal, SuccessAnimation } from '../../components/shared';
import AutoSaveIndicator from '../../components/common/AutoSaveIndicator';
import UnsavedChangesModal from '../../components/common/UnsavedChangesModal';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChanges';
import { validationRules, ValidationSchema } from '../../utils/validation';

// Import sub-components
import JobBasicInfo from './post-job/JobBasicInfo';
import JobBudgetTimeline from './post-job/JobBudgetTimeline';
import JobRequirements from './post-job/JobRequirements';
import JobAttachments from './post-job/JobAttachments';

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
                        <JobBasicInfo
                            formData={formData}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            touched={touched}
                            errors={errors}
                        />

                        <JobBudgetTimeline
                            formData={formData}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            touched={touched}
                            errors={errors}
                            setFieldValue={setFieldValue}
                        />

                        <JobRequirements
                            formData={formData}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                        />

                        <JobAttachments
                            uploadingFiles={uploadingFiles}
                            uploadProgress={uploadProgress}
                            uploadedFiles={uploadedFiles}
                            handleFileUpload={handleFileUpload}
                            handleRemoveFile={handleRemoveFile}
                        />

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
