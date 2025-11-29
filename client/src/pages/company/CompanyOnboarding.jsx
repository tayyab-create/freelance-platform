import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getMe } from '../../redux/slices/authSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import OnboardingInfoPanel from '../../components/onboarding/OnboardingInfoPanel';
import CompanyInfoStep from '../../components/onboarding/steps/company/CompanyInfoStep';
import CompanyDetailsStep from '../../components/onboarding/steps/company/CompanyDetailsStep';
import CompanyDocumentsStep from '../../components/onboarding/steps/company/CompanyDocumentsStep';
import CompanyReviewStep from '../../components/onboarding/steps/company/CompanyReviewStep';
import api, { uploadAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { FiInfo, FiCheckCircle, FiClock } from 'react-icons/fi';

import { calculateCompanyProfileCompleteness } from '../../utils/profileCompleteness';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STEPS = [
    { id: 'info', label: 'Company Info', subtitle: 'Basic details' },
    { id: 'details', label: 'Contact & Location', subtitle: 'Where to find you' },
    { id: 'documents', label: 'Verification', subtitle: 'Legal documents' },
    { id: 'review', label: 'Review', subtitle: 'Final check' }
];

const CompanyOnboarding = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { socket } = useSocket();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Company Info
        companyName: '',
        tagline: '',
        website: '',
        industry: '',
        companySize: '',
        description: '',
        foundedYear: '',

        // Contact & Location
        contactPerson: {
            name: '',
            position: '',
            email: '',
            phone: ''
        },
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
        },
        socialMedia: {
            twitter: '',
            facebook: '',
            instagram: ''
        },
        linkedinProfile: '',

        // Documents
        logo: null,
        registrationNumber: '',
        taxDocuments: [],
        companyVideo: null,
        professionalLinks: []
    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [profileCompleteness, setProfileCompleteness] = useState(0);
    const [status, setStatus] = useState(null);
    const [rejectionReason, setRejectionReason] = useState(null);
    const [approvalHistory, setApprovalHistory] = useState([]);

    const isReadOnly = status === 'pending' || status === 'approved';

    const loadProgress = async () => {
        try {
            const response = await api.get('/auth/onboarding/status');
            if (response.data.onboardingStep) {
                setCurrentStep(response.data.onboardingStep + 1);
            }
            // Use backend value initially, but we'll update it locally
            setProfileCompleteness(response.data.profileCompleteness || 0);
            setStatus(response.data.status);
            setRejectionReason(response.data.rejectionReason);
            setApprovalHistory(response.data.approvalHistory || []);

            // Sync Redux state with latest status only if changed
            if (user?.status !== response.data.status) {
                dispatch(getMe());
            }

            // Load profile data
            const profileResponse = await api.get('/auth/me');
            if (profileResponse.data.profile) {
                // Merge saved profile data
                setFormData(prev => {
                    const newData = {
                        ...prev,
                        ...profileResponse.data.profile
                    };
                    // Calculate completeness immediately after loading data
                    setProfileCompleteness(calculateCompanyProfileCompleteness(newData));
                    return newData;
                });
            }
        } catch (error) {
            console.error('Error loading onboarding progress:', error);
        }
    };

    // Load saved progress
    useEffect(() => {
        loadProgress();
    }, []);

    // Listen for real-time status updates
    useEffect(() => {
        if (socket) {
            const handleNotification = (data) => {
                if (data.notification && (data.notification.type === 'system' || data.notification.type === 'application')) {
                    // Refresh status if we receive a relevant notification
                    // We can check metadata if available, or just refresh for any system notification
                    loadProgress();
                }
            };

            socket.on('new_notification', handleNotification);

            return () => {
                socket.off('new_notification', handleNotification);
            };
        }
    }, [socket]);





    const handleFormChange = (newData) => {
        setFormData(newData);
        setErrors({});
        // Calculate completeness in real-time
        setProfileCompleteness(calculateCompanyProfileCompleteness(newData));
    };

    const handleFileUpload = async (fieldName, file) => {
        if (!file) return;

        // Handle removal of tax documents (when file objects are passed instead of File objects)
        if (fieldName === 'taxDocuments' && Array.isArray(file)) {
            // Check if any item in the array is an actual File object (new upload)
            const hasNewFiles = file.some(f => f instanceof File);

            if (!hasNewFiles && file.length >= 0) {
                // This is a removal/update operation, extract URLs from file objects
                const urls = file.map(f => {
                    // If it's already a string (URL), return it
                    if (typeof f === 'string') return f;
                    // If it's an object with url property, extract it
                    if (f && typeof f === 'object' && f.url) return f.url;
                    // Otherwise return as is
                    return f;
                }).filter(url => typeof url === 'string'); // Only keep valid URL strings

                setFormData(prev => ({
                    ...prev,
                    taxDocuments: urls
                }));
                return; // Exit early, don't upload
            }
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            if (fieldName === 'taxDocuments') {
                // Handle multiple tax documents
                const uploadType = 'tax-documents';

                // Convert FileList to Array if needed and filter only File objects
                const filesArray = Array.isArray(file) ? file.filter(f => f instanceof File) : Array.from(file);

                // If no actual files to upload after filtering, just return
                if (filesArray.length === 0) {
                    setIsUploading(false);
                    return;
                }

                const response = await uploadAPI.uploadMultiple(filesArray, uploadType, (progress) => {
                    setUploadProgress(progress);
                });

                // Fix: Access correct response structure - server returns data as array directly
                const files = response.data.data || response.data.files || [];
                const urls = files.map(f => `${API_URL}${f.fileUrl}`);

                setFormData(prev => ({
                    ...prev,
                    taxDocuments: [...(prev.taxDocuments || []), ...urls]
                }));

                toast.success(`${filesArray.length} document(s) uploaded successfully`);
            } else {
                // Handle single file uploads (logo, companyVideo)
                const uploadType = fieldName === 'logo' ? 'company-logo' : 'company-video';

                const response = await uploadAPI.uploadSingle(file, uploadType, (progress) => {
                    setUploadProgress(progress);
                });

                // Fix: Handle both possible response structures
                const fileUrl = response.data.data?.fileUrl || response.data.fileUrl;

                setFormData(prev => ({
                    ...prev,
                    [fieldName]: `${API_URL}${fileUrl}`
                }));

                toast.success(`${fieldName === 'logo' ? 'Logo' : 'Company video'} uploaded successfully`);
            }
        } catch (error) {
            console.error(`Error uploading ${fieldName}:`, error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to upload file';
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1: // Company Info
                if (!formData.companyName) newErrors.companyName = 'Company name is required';
                if (!formData.website) newErrors.website = 'Website is required';
                if (!formData.industry) newErrors.industry = 'Industry is required';
                if (!formData.companySize) newErrors.companySize = 'Company size is required';
                if (!formData.description || formData.description.length < 100) {
                    newErrors.description = 'Description must be at least 100 characters';
                }
                break;

            case 2: // Details
                if (!formData.contactPerson?.name) newErrors['contactPerson.name'] = 'Contact name is required';
                if (!formData.contactPerson?.email) newErrors['contactPerson.email'] = 'Contact email is required';
                if (!formData.address?.city) newErrors['address.city'] = 'City is required';
                if (!formData.address?.country) newErrors['address.country'] = 'Country is required';
                break;

            case 3: // Documents
                // Documents are technically optional but highly recommended
                // We could enforce logo here if desired
                break;

            case 4: // Review
                if (!formData.companyName) newErrors.companyName = 'Company name is required';
                if (!formData.website) newErrors.website = 'Website is required';
                if (!formData.contactPerson?.name) newErrors['contactPerson.name'] = 'Contact name is required';
                if (!formData.contactPerson?.email) newErrors['contactPerson.email'] = 'Contact email is required';
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (isUploading) {
            toast.warning('Please wait for file uploads to complete');
            return;
        }

        if (!validateStep(currentStep)) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Save current step data before moving to next step
        if (currentStep < STEPS.length) {
            // Skip saving if read-only
            if (isReadOnly) {
                setCurrentStep(prev => prev + 1);
                return;
            }

            setIsSaving(true);
            try {
                const savePayload = {
                    step: currentStep - 1,
                    profileData: formData
                };
                await api.put('/auth/onboarding/save', savePayload);
                setCurrentStep(prev => prev + 1);
            } catch (error) {
                console.error('Error saving step:', error);
                toast.error('Failed to save progress. Please try again.');
            } finally {
                setIsSaving(false);
            }
        } else {
            // Submit for review
            await handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (isUploading) return;

        setIsSaving(true);
        try {
            const response = await api.post('/auth/onboarding/submit');

            // Update local state instead of redirecting
            setStatus(response.data.status);
            toast.success('Company profile submitted successfully! You will be notified once your application is reviewed.');

            // Optionally refresh full status to get updated history
            const statusResponse = await api.get('/auth/onboarding/status');
            setApprovalHistory(statusResponse.data.approvalHistory || []);

        } catch (error) {
            const message = error.response?.data?.message || 'Error submitting profile';
            toast.error(message);

            if (error.response?.data?.missingFields) {
                console.log('Missing fields:', error.response.data.missingFields);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <CompanyInfoStep
                        formData={formData}
                        onChange={handleFormChange}
                        errors={errors}
                        disabled={isReadOnly}
                    />
                );
            case 2:
                return (
                    <CompanyDetailsStep
                        formData={formData}
                        onChange={handleFormChange}
                        errors={errors}
                        disabled={isReadOnly}
                    />
                );
            case 3:
                return (
                    <CompanyDocumentsStep
                        formData={formData}
                        onChange={handleFormChange}
                        onFileUpload={handleFileUpload}
                        errors={errors}
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        disabled={isReadOnly}
                    />
                );
            case 4:
                return (
                    <CompanyReviewStep
                        formData={formData}
                        profileCompleteness={profileCompleteness}
                    />
                );
            default:
                return null;
        }
    };

    const getStepTitle = () => STEPS[currentStep - 1]?.label || '';
    const getStepSubtitle = () => STEPS[currentStep - 1]?.subtitle || '';

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.companyName && formData.website && formData.industry && formData.companySize && formData.description?.length >= 100;
            case 2:
                return formData.contactPerson?.name && formData.contactPerson?.email && formData.address?.city && formData.address?.country;
            case 3:
                return true;
            case 4:
                return profileCompleteness >= 70;
            default:
                return false;
        }
    };

    return (
        <DashboardLayout disableNavigation={true}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Steps (2 Columns) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Banner */}
                    {isReadOnly && (
                        <div className={`rounded-2xl p-6 border ${status === 'approved'
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
                            : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
                            }`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {status === 'approved' ? <FiCheckCircle className="w-6 h-6" /> : <FiClock className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold mb-1 ${status === 'approved' ? 'text-green-900' : 'text-blue-900'
                                        } flex items-center gap-2`}>
                                        {status === 'approved' ? 'Profile Approved!' : 'Application Under Review'}
                                        {status !== 'approved' && (
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                            </span>
                                        )}
                                    </h3>
                                    <p className={`${status === 'approved' ? 'text-green-700' : 'text-blue-700'
                                        } leading-relaxed`}>
                                        {status === 'approved'
                                            ? "Congratulations! Your profile has been approved. You can now access your dashboard. Editing is disabled to maintain your verified status."
                                            : "Thanks for submitting your profile! Our team is currently reviewing your application. You'll be notified once the review is complete. Editing is temporarily disabled."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        {/* Step Header */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">{STEPS[currentStep - 1]?.label}</h2>
                            <p className="text-gray-500">{STEPS[currentStep - 1]?.subtitle}</p>

                            {/* Step Progress Dots */}
                            <div className="flex items-center gap-2 mt-4">
                                {STEPS.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className={`h-2 rounded-full transition-all duration-300 ${index + 1 === currentStep
                                            ? 'w-8 bg-primary-600'
                                            : index + 1 < currentStep
                                                ? 'w-2 bg-primary-200'
                                                : 'w-2 bg-gray-100'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="min-h-[400px]">
                            {renderStep()}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 1 || isSaving}
                                className={`px-6 py-2.5 rounded-xl font-medium transition-all ${currentStep === 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={isSaving || isUploading || (currentStep === STEPS.length && isReadOnly)}
                                className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving ? 'Saving...' : currentStep === STEPS.length ? 'Submit Profile' : 'Next Step'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Side Panel - Info (1 Column) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <OnboardingInfoPanel
                            profileCompleteness={profileCompleteness}
                            status={status}
                            rejectionReason={rejectionReason}
                            approvalHistory={approvalHistory}
                            dashboardLink="/company/dashboard"
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CompanyOnboarding;
