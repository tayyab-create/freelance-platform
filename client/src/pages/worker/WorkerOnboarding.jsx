import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/layout/DashboardLayout';
import OnboardingInfoPanel from '../../components/onboarding/OnboardingInfoPanel';
import PersonalInfoStep from '../../components/onboarding/steps/PersonalInfoStep';
import SkillsStep from '../../components/onboarding/steps/SkillsStep';
import ExperienceStep from '../../components/onboarding/steps/ExperienceStep';
import VerificationStep from '../../components/onboarding/steps/VerificationStep';
import ReviewStep from '../../components/onboarding/steps/ReviewStep';
import api, { uploadAPI } from '../../services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STEPS = [
    { id: 'personal', label: 'Personal Info', subtitle: 'Basic details' },
    { id: 'skills', label: 'Skills & Preferences', subtitle: 'Your expertise' },
    { id: 'experience', label: 'Experience', subtitle: 'Work history' },
    { id: 'verification', label: 'Verification', subtitle: 'Documents' },
    { id: 'review', label: 'Review', subtitle: 'Final check' }
];

const WorkerOnboarding = () => {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Personal Info
        fullName: '',
        phone: '',
        bio: '',
        location: '',
        profilePicture: null,
        linkedinProfile: '',
        githubProfile: '',

        // Skills
        skills: [],
        hourlyRate: '',
        preferredJobTypes: [],
        willingToRelocate: false,

        // Experience
        experience: [],
        portfolioLinks: [],

        // Verification
        resume: null
    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [profileCompleteness, setProfileCompleteness] = useState(0);
    const [status, setStatus] = useState(null);
    const [rejectionReason, setRejectionReason] = useState(null);
    const [approvalHistory, setApprovalHistory] = useState([]);

    // Load saved progress on mount
    useEffect(() => {
        const loadProgress = async () => {
            try {
                console.log('🔵 [LOAD] Fetching onboarding status...');
                const response = await api.get('/auth/onboarding/status');
                console.log('🔵 [LOAD] Onboarding status response:', response.data);

                if (response.data.onboardingStep) {
                    setCurrentStep(response.data.onboardingStep + 1);
                }
                setProfileCompleteness(response.data.profileCompleteness || 0);
                setStatus(response.data.status);
                setRejectionReason(response.data.rejectionReason);
                setApprovalHistory(response.data.approvalHistory || []);

                // Load profile data
                console.log('🔵 [LOAD] Fetching user profile...');
                const profileResponse = await api.get('/auth/me');
                console.log('🔵 [LOAD] Profile response:', profileResponse.data);
                if (profileResponse.data.profile) {
                    const loadedData = {
                        ...formData,
                        ...profileResponse.data.profile
                    };
                    setFormData(loadedData);
                }
            } catch (error) {
                console.error('❌ [LOAD] Error loading onboarding progress:', error);
            }
        };

        loadProgress();
    }, []);

    // Calculate profile completeness in real-time
    useEffect(() => {
        const calculateCompleteness = () => {
            let completedFields = 0;
            const totalFields = 13; // Total number of important fields

            // Personal Info (5 fields)
            if (formData.fullName) completedFields++;
            if (formData.phone) completedFields++;
            if (formData.bio && formData.bio.length >= 50) completedFields++;
            if (formData.location) completedFields++;
            if (formData.profilePicture) completedFields++;

            // Skills & Preferences (4 fields)
            if (formData.skills && formData.skills.length >= 3) completedFields++;
            if (formData.hourlyRate && formData.hourlyRate > 0) completedFields++;
            if (formData.preferredJobTypes && formData.preferredJobTypes.length > 0) completedFields++;
            if (formData.willingToRelocate !== undefined) completedFields++;

            // Experience & Portfolio (2 fields)
            if (formData.experience && formData.experience.length > 0) completedFields++;
            if (formData.portfolioLinks && formData.portfolioLinks.length > 0) completedFields++;

            // Verification (2 fields)
            if (formData.resume) completedFields++;
            if (formData.experience && formData.experience.length > 0) completedFields++; // Alternative to resume

            const percentage = Math.round((completedFields / totalFields) * 100);
            setProfileCompleteness(percentage);
        };

        calculateCompleteness();
    }, [formData]);

    const handleFormChange = (newData) => {
        setFormData(newData);
        setErrors({}); // Clear errors when form changes
    };

    const handleFileUpload = async (fieldName, file) => {
        // Handle file deletion (when user clicks X)
        if (!file) {
            const newFormData = {
                ...formData,
                [fieldName]: null
            };
            setFormData(newFormData);
            toast.info(`${fieldName === 'profilePicture' ? 'Profile picture' : 'File'} removed`);
            return;
        }

        setIsUploading(true);
        try {
            // Upload file immediately
            const uploadType = fieldName === 'profilePicture' ? 'profile-picture' : 'documents';
            const response = await uploadAPI.uploadSingle(file, uploadType);

            const newFormData = {
                ...formData,
                [fieldName]: `${API_URL}${response.data.data.fileUrl}`
            };
            setFormData(newFormData);

            toast.success(`${fieldName === 'profilePicture' ? 'Profile picture' : 'File'} uploaded successfully`);
        } catch (error) {
            console.error(`❌ [UPLOAD] Error uploading ${fieldName}:`, error);
            toast.error(`Failed to upload ${fieldName === 'profilePicture' ? 'profile picture' : 'file'}`);
        } finally {
            setIsUploading(false);
        }
    };

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1: // Personal Info
                if (!formData.fullName || formData.fullName.length < 2) {
                    newErrors.fullName = 'Full name is required';
                }
                if (!formData.phone) {
                    newErrors.phone = 'Phone number is required';
                }
                if (!formData.location) {
                    newErrors.location = 'Location is required';
                }
                if (!formData.bio || formData.bio.length < 50) {
                    newErrors.bio = 'Bio must be at least 50 characters';
                }
                break;

            case 2: // Skills
                if (!formData.skills || formData.skills.length < 3) {
                    newErrors.skills = 'Please add at least 3 skills';
                }
                if (!formData.hourlyRate || formData.hourlyRate < 1) {
                    newErrors.hourlyRate = 'Please set your hourly rate';
                }
                if (!formData.preferredJobTypes || formData.preferredJobTypes.length === 0) {
                    newErrors.preferredJobTypes = 'Please select at least one job type';
                }
                break;

            case 3: // Experience (optional, no strict validation)
                break;

            case 4: // Verification
                if (!formData.resume && (!formData.experience || formData.experience.length === 0)) {
                    newErrors.resume = 'Please upload your resume or add work experience';
                }
                break;

            case 5: // Review (final validation)
                if (!formData.fullName) newErrors.fullName = 'Full Name is required';
                if (!formData.phone) newErrors.phone = 'Phone is required';
                if (!formData.location) newErrors.location = 'Location is required';
                if (!formData.bio || formData.bio.length < 50) newErrors.bio = 'Bio is too short';
                if (!formData.skills || formData.skills.length < 3) newErrors.skills = 'Add at least 3 skills';
                if (!formData.hourlyRate) newErrors.hourlyRate = 'Hourly rate is required';
                if (!formData.preferredJobTypes || formData.preferredJobTypes.length === 0) newErrors.preferredJobTypes = 'Select job types';
                if (!formData.resume && (!formData.experience || formData.experience.length === 0)) newErrors.resume = 'Resume or experience required';
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
            setIsSaving(true);
            try {
                const savePayload = {
                    step: currentStep - 1,
                    profileData: formData
                };
                await api.put('/auth/onboarding/save', savePayload);
                setCurrentStep(prev => prev + 1);
            } catch (error) {
                console.error('❌ [SAVE] Error saving step:', error);
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
            toast.success('Profile submitted successfully! You will be notified once your application is reviewed.');

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
                    <PersonalInfoStep
                        formData={formData}
                        onChange={handleFormChange}
                        onFileUpload={handleFileUpload}
                        errors={errors}
                        isUploading={isUploading}
                    />
                );
            case 2:
                return (
                    <SkillsStep
                        formData={formData}
                        onChange={handleFormChange}
                        errors={errors}
                    />
                );
            case 3:
                return (
                    <ExperienceStep
                        formData={formData}
                        onChange={handleFormChange}
                        errors={errors}
                    />
                );
            case 4:
                return (
                    <VerificationStep
                        formData={formData}
                        onFileUpload={handleFileUpload}
                        errors={errors}
                        isUploading={isUploading}
                    />
                );
            case 5:
                return (
                    <ReviewStep
                        formData={formData}
                        profileCompleteness={profileCompleteness}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <DashboardLayout disableNavigation={true}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Steps (2 Columns) */}
                <div className="lg:col-span-2 space-y-6">
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
                                disabled={isSaving || isUploading}
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
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default WorkerOnboarding;
