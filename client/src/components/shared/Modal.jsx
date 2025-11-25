import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md', // 'sm', 'md', 'lg', 'xl', 'full'
    showCloseButton = true,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    footer,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-[95vw]'
    };

    // Handle escape key
    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={handleBackdropClick}
            />

            {/* Modal Container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={`
            relative bg-white rounded-2xl shadow-2xl w-full
            ${sizeClasses[size]}
            ${className}
            transform transition-all
            animate-slide-up
          `}
                >
                    {/* Header */}
                    {(title || showCloseButton) && (
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            {title && (
                                <h3 id="modal-title" className="text-xl font-bold text-gray-900">
                                    {title}
                                </h3>
                            )}
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label="Close modal"
                                >
                                    <FiX className="w-5 h-5 text-gray-500" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-6 py-4 max-h-[70vh] overflow-y-auto scrollbar-custom">
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Confirmation Modal variant
export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger', // 'danger', 'warning', 'info'
    loading = false
}) => {
    const variantStyles = {
        danger: 'btn-danger',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold',
        info: 'btn-primary'
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            title={title}
            footer={
                <>
                    <button onClick={onClose} className="btn-secondary" disabled={loading}>
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={variantStyles[variant]}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmLabel}
                    </button>
                </>
            }
        >
            <p className="text-gray-600">{message}</p>
        </Modal>
    );
};

export default Modal;