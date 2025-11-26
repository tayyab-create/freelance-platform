import React, { useEffect, useState } from 'react';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';

/**
 * Success Animation Component
 * Features:
 * - Animated checkmark with scale and fade effects
 * - Optional confetti animation
 * - Customizable colors and sizes
 * - Auto-dismiss option
 */
const SuccessAnimation = ({
    show = false,
    message = 'Success!',
    description,
    onComplete,
    autoClose = true,
    autoCloseDelay = 2000,
    showConfetti = true,
    size = 'md', // 'sm', 'md', 'lg'
    variant = 'primary', // 'primary', 'success', 'info'
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(show);
    const [confettiPieces, setConfettiPieces] = useState([]);

    // Size configurations
    const sizes = {
        sm: {
            container: 'w-16 h-16',
            icon: 'w-8 h-8',
            text: 'text-lg',
            description: 'text-sm'
        },
        md: {
            container: 'w-24 h-24',
            icon: 'w-12 h-12',
            text: 'text-2xl',
            description: 'text-base'
        },
        lg: {
            container: 'w-32 h-32',
            icon: 'w-16 h-16',
            text: 'text-3xl',
            description: 'text-lg'
        }
    };

    // Variant configurations
    const variants = {
        primary: {
            bg: 'bg-primary-500',
            ring: 'ring-primary-200',
            text: 'text-primary-600'
        },
        success: {
            bg: 'bg-green-500',
            ring: 'ring-green-200',
            text: 'text-green-600'
        },
        info: {
            bg: 'bg-blue-500',
            ring: 'ring-blue-200',
            text: 'text-blue-600'
        }
    };

    const sizeConfig = sizes[size];
    const variantConfig = variants[variant];

    useEffect(() => {
        setIsVisible(show);

        if (show) {
            // Generate confetti pieces
            if (showConfetti) {
                const pieces = Array.from({ length: 30 }, (_, i) => ({
                    id: i,
                    left: Math.random() * 100,
                    delay: Math.random() * 0.3,
                    duration: 1 + Math.random() * 0.5,
                    color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
                }));
                setConfettiPieces(pieces);
            }

            // Auto close
            if (autoClose && onComplete) {
                const timer = setTimeout(() => {
                    setIsVisible(false);
                    onComplete();
                }, autoCloseDelay);

                return () => clearTimeout(timer);
            }
        }
    }, [show, showConfetti, autoClose, autoCloseDelay, onComplete]);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in ${className}`}>
            {/* Confetti */}
            {showConfetti && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {confettiPieces.map((piece) => (
                        <div
                            key={piece.id}
                            className="absolute top-0 w-2 h-2 rounded-full animate-confetti"
                            style={{
                                left: `${piece.left}%`,
                                backgroundColor: piece.color,
                                animationDelay: `${piece.delay}s`,
                                animationDuration: `${piece.duration}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Success Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md mx-4 animate-scale-in">
                {/* Animated Checkmark */}
                <div className="flex justify-center mb-6">
                    <div className={`relative ${sizeConfig.container}`}>
                        {/* Outer ring animation */}
                        <div className={`absolute inset-0 ${variantConfig.bg} rounded-full animate-ping opacity-20`} />

                        {/* Main circle */}
                        <div className={`relative ${sizeConfig.container} ${variantConfig.bg} rounded-full flex items-center justify-center ring-8 ${variantConfig.ring} animate-scale-in`}>
                            <FiCheck className={`${sizeConfig.icon} text-white animate-check-draw`} strokeWidth={3} />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <h3 className={`font-bold text-gray-900 mb-2 ${sizeConfig.text}`}>
                    {message}
                </h3>

                {/* Description */}
                {description && (
                    <p className={`text-gray-600 ${sizeConfig.description}`}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

/**
 * Inline Success Checkmark - For smaller inline success indicators
 */
export const InlineSuccessCheck = ({ show = false, size = 'sm' }) => {
    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    if (!show) return null;

    return (
        <div className={`inline-flex items-center justify-center ${sizes[size]} bg-green-500 rounded-full animate-scale-in`}>
            <FiCheck className="w-3/4 h-3/4 text-white" strokeWidth={3} />
        </div>
    );
};

/**
 * Success Toast - For toast-style success messages
 */
export const SuccessToast = ({ message, description, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border-2 border-green-200 animate-slide-in-right">
            <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="w-6 h-6 text-white" />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{message}</p>
                {description && (
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
            </div>
        </div>
    );
};

export default SuccessAnimation;
