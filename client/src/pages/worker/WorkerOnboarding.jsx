import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout'
import PersonalInfoStep from '../../components/onboarding/steps/PersonalInfoStep';
import SkillsStep from '../../components/onboarding/steps/SkillsStep';
import ExperienceStep from '../../components/onboarding/steps/ExperienceStep';
import VerificationStep from '../../components/onboarding/steps/VerificationStep';
import ReviewStep from '../../components/onboarding/steps/ReviewStep';
import api from '../../services/api';

const STEPS = [
    { id: 'personal', label: 'Personal Info', subtitle: 'Basic details' },
    { id: 'skills', label: 'Skills', subtitle: 'Your expertise' },
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
        resume: null,
        videoIntroduction: null
    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [profileCompleteness, setProfileCompleteness] = useState(0);

    // Load saved progress on mount
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const response = await api.get('/auth/onboarding/status');
                if (response.data.onboardingStep) {
                    setCurrentStep(response.data.onboardingStep + 1);
                }
                setProfileCompleteness(response.data.profileCompleteness || 0);

                // Load profile data
                const profileResponse = await api.get('/auth/me');
                if (profileResponse.data.profile) {
                    setFormData(prev => ({
                        ...prev,
                        ...profileResponse.data.profile
                    }));
                }
            } catch (error) {
                console.error('Error loading onboarding progress:', error);
            }
        };

        loadProgress();
    }, []);

    // Auto-save functionality (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isSaving) {
                handleAutoSave();
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [formData, currentStep]);

    const handleAutoSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/auth/onboarding/save', {
                step: currentStep - 1,
                profileData: formData
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error('Auto-save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFormChange = (newData) => {
        setFormData(newData);
        setErrors({}); // Clear errors when form changes
    };

    const handleFileUpload = (fieldName, file) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: file
        }));
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
                // All previous validations apply
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (!validateStep(currentStep)) {
            return;
        }

        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1);
            await handleAutoSave();
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
        setIsSaving(true);
        try {
            const response = await api.post('/auth/onboarding/submit');

            // Show success message and redirect to status page
            alert('Profile submitted successfully! You will be notified once your application is reviewed.');
            navigate('/onboarding/status');
        } catch (error) {
            const message = error.response?.data?.message || 'Error submitting profile';
            alert(message);

            // If incomplete, show missing fields
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

    const getStepTitle = () => {
        return STEPS[currentStep - 1]?.label || '';
    };

    const getStepSubtitle = () => {
        const subtitles = [
            'Let us know about you',
            'Showcase your expertise and set your rate',
            'Tell us about your professional journey',
            'Upload your credentials',
            'One final look before submitting'
        ];
        return subtitles[currentStep - 1] || '';
    };

    const isStepValid = () => {
        // Basic validation - could be more sophisticated
        switch (currentStep) {
            case 1:
                return formData.fullName && formData.phone && formData.bio && formData.bio.length >= 50;
            case 2:
                return formData.skills?.length >= 3 && formData.hourlyRate && formData.preferredJobTypes?.length > 0;
            case 3:
                return true; // Experience is optional
            case 4:
                return formData.resume || (formData.experience && formData.experience.length > 0);
            case 5:
                return profileCompleteness >= 70;
            default:
                return false;
        }
    };

    return (
        <OnboardingLayout
            steps={STEPS}
            currentStep={currentStep}
            title={getStepTitle()}
            subtitle={getStepSubtitle()}
            onBack={handleBack}
            onNext={handleNext}
            onSave={handleAutoSave}
            isLastStep={currentStep === STEPS.length}
            isValid={isStepValid()}
            isSaving={isSaving}
            lastSaved={lastSaved}
            profileCompleteness={profileCompleteness}
        >
            {renderStep()}
        </OnboardingLayout>
    );
};

export default WorkerOnboarding;
