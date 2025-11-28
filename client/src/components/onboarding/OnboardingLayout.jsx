import React from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import StepIndicator from './StepIndicator';

const OnboardingLayout = ({
    children,
    steps,
    currentStep,
    title, subtitle,
    onBack,
    onNext,
    onSave,
    nextLabel = 'Continue',
    isLastStep = false,
    isValid = true,
    isSaving = false,
    lastSaved = null,
    profileCompleteness = 0
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 py-8 px-4">
            <div className="container-premium">
                {/* Header with Logo & Completeness */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gradient">Complete Your Profile</h1>
                        <p className="text-gray-600 mt-1">Join our platform and start your journey</p>
                    </div>

                    {/* Profile Completeness Badge */}
                    <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-glass border border-white/50">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Profile Completeness
                            </span>
                            <span className="text-2xl font-bold text-gradient">
                                {profileCompleteness}%
                            </span>
                        </div>
                        <div className="relative w-16 h-16">
                            <svg className="transform -rotate-90 w-16 h-16">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="transparent"
                                    className="text-gray-200"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="transparent"
                                    strokeDasharray={`${2 * Math.PI * 28}`}
                                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - profileCompleteness / 100)}`}
                                    className="text-primary-500 transition-all duration-500"
                                    strokeLinecap="round"
                                />
                            </svg>
                            {profileCompleteness === 100 && (
                                <CheckCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-green-500" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Step Indicator */}
                <StepIndicator steps={steps} currentStep={currentStep} />

                {/* Main Content Card */}
                <div className="card-premium max-w-4xl mx-auto">
                    {/* Step Title & Subtitle */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                        {subtitle && <p className="text-gray-600">{subtitle}</p>}
                    </div>



                    {/* Step Content */}
                    <div className="mb-8">
                        {children}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={currentStep === 1}
                            className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                transition-all duration-300 transform
                ${currentStep === 1
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                                    : 'btn-secondary hover:scale-105'
                                }
              `}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>

                        <div className="flex items-center gap-3">
                            {/* Save Draft Button (optional) */}
                            {onSave && (
                                <button
                                    type="button"
                                    onClick={onSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                    bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300
                    transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Draft
                                </button>
                            )}

                            {/* Next/Submit Button */}
                            <button
                                type="button"
                                onClick={onNext}
                                disabled={!isValid || isSaving}
                                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl font-semibold
                  transition-all duration-300 transform
                  ${!isValid || isSaving
                                        ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500'
                                        : isLastStep
                                            ? 'btn-success'
                                            : 'btn-primary'
                                    }
                `}
                            >
                                {isLastStep ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Submit for Review
                                    </>
                                ) : (
                                    <>
                                        {nextLabel}
                                        <ArrowLeft className="w-5 h-5 transform rotate-180" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

OnboardingLayout.propTypes = {
    children: PropTypes.node.isRequired,
    steps: PropTypes.array.isRequired,
    currentStep: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    onBack: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    onSave: PropTypes.func,
    nextLabel: PropTypes.string,
    isLastStep: PropTypes.bool,
    isValid: PropTypes.bool,
    isSaving: PropTypes.bool,
    lastSaved: PropTypes.instanceOf(Date),
    profileCompleteness: PropTypes.number
};

export default OnboardingLayout;
