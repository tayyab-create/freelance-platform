import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import CompanyInfoStep from '../../components/onboarding/steps/company/CompanyInfoStep';
import CompanyDetailsStep from '../../components/onboarding/steps/company/CompanyDetailsStep';
import CompanyDocumentsStep from '../../components/onboarding/steps/company/CompanyDocumentsStep';
import CompanyReviewStep from '../../components/onboarding/steps/company/CompanyReviewStep';
import api from '../../services/api';

const STEPS = [
    { id: 'info', label: 'Company Info', subtitle: 'Basic details' },
    { id: 'details', label: 'Contact & Location', subtitle: 'Where to find you' },
    { id: 'documents', label: 'Verification', subtitle: 'Legal documents' },
    { id: 'review', label: 'Review', subtitle: 'Final check' }
];

const CompanyOnboarding = () => {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

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
        companyVideo: null
    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [profileCompleteness, setProfileCompleteness] = useState(0);

    // Load saved progress
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
                    // Merge saved profile data
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

    // Auto-save
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
        setErrors({});
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
                // Final validation
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
            await api.post('/auth/onboarding/submit');
            alert('Company profile submitted successfully! We will review your application shortly.');
            navigate('/onboarding/status');
        } catch (error) {
            const message = error.response?.data?.message || 'Error submitting profile';
            alert(message);
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
                    />
                );
            case 2:
                return (
                    <CompanyDetailsStep
                        formData={formData}
                        onChange={handleFormChange}
                        errors={errors}
                    />
                );
            case 3:
                return (
                    <CompanyDocumentsStep
                        formData={formData}
                        onChange={handleFormChange}
                        onFileUpload={handleFileUpload}
                        errors={errors}
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

export default CompanyOnboarding;
