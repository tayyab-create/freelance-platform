import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Circle } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => {
    return (
        <div className="w-full max-w-4xl mx-auto mb-8">
            {/* Progress Bar */}
            <div className="relative">
                {/* Background Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full"></div>

                {/* Progress Line */}
                <div
                    className="absolute top-5 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>

                {/* Steps */}
                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = stepNumber < currentStep;
                        const isCurrent = stepNumber === currentStep;
                        const isUpcoming = stepNumber > currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center">
                                {/* Step Circle */}
                                <div
                                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    transition-all duration-300 transform
                    ${isCompleted
                                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white scale-110 shadow-lg shadow-primary-500/40'
                                            : isCurrent
                                                ? 'bg-white border-4 border-primary-500 text-primary-600 scale-110 shadow-lg'
                                                : 'bg-white border-2 border-gray-300 text-gray-400'
                                        }
                  `}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="w-6 h-6" />
                                    ) : (
                                        <span className="text-sm font-bold">{stepNumber}</span>
                                    )}
                                </div>

                                {/* Step Label */}
                                <div className="mt-3 text-center max-w-[120px]">
                                    <p
                                        className={`
                      text-xs font-semibold transition-colors duration-300
                      ${isCurrent ? 'text-primary-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                    `}
                                    >
                                        {step.label}
                                    </p>
                                    {step.subtitle && (
                                        <p className="text-xs text-gray-400 mt-0.5">{step.subtitle}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

StepIndicator.propTypes = {
    steps: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            subtitle: PropTypes.string
        })
    ).isRequired,
    currentStep: PropTypes.number.isRequired
};

export default StepIndicator;
