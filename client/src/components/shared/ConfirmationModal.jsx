import React, { useState } from 'react';
import Modal from './Modal';
import { FiAlertTriangle, FiInfo, FiAlertCircle, FiTrash2, FiX, FiCheckCircle } from 'react-icons/fi';

/**
 * Enhanced Confirmation Modal for destructive actions
 * Features:
 * - Clear consequences explanation
 * - Different variants (danger, warning, info)
 * - Optional confirmation checkbox
 * - Loading states
 * - Undo support integration
 */
const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger', // 'danger', 'warning', 'info'
    loading = false,
    showIcon = true,
    requireConfirmation = false, // Require checkbox confirmation for critical actions
    confirmationText = 'I understand the consequences',
    consequences = [], // Array of consequence strings to display
    showUndo = false, // Show undo option in confirmation
    undoWindow = 5, // Seconds for undo window
    className = ''
}) => {
    const [isConfirmed, setIsConfirmed] = useState(!requireConfirmation);

    // Variant configurations
    const variants = {
        danger: {
            icon: FiAlertTriangle,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            buttonClass: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30',
            borderColor: 'border-red-200'
        },
        warning: {
            icon: FiAlertCircle,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-500/30',
            borderColor: 'border-yellow-200'
        },
        info: {
            icon: FiInfo,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30',
            borderColor: 'border-blue-200'
        },
        success: {
            icon: FiCheckCircle,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            buttonClass: 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30',
            borderColor: 'border-green-200'
        },
        primary: {
            icon: FiInfo,
            iconBg: 'bg-primary-100',
            iconColor: 'text-primary-600',
            buttonClass: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30',
            borderColor: 'border-primary-200'
        }
    };

    const config = variants[variant] || variants.danger;
    const Icon = config.icon;

    const handleConfirm = async () => {
        if (!isConfirmed) return;
        await onConfirm();
        setIsConfirmed(!requireConfirmation); // Reset for next time
    };

    const handleClose = () => {
        setIsConfirmed(!requireConfirmation); // Reset on close
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="sm"
            showCloseButton={false}
            className={className}
        >
            <div className="text-center py-4">
                {/* Icon */}
                {showIcon && (
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${config.iconBg} mb-4`}>
                        <Icon className={`w-8 h-8 ${config.iconColor}`} />
                    </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {title}
                </h3>

                {/* Message */}
                <p className="text-gray-600 mb-4 leading-relaxed">
                    {message}
                </p>

                {/* Consequences List */}
                {consequences.length > 0 && (
                    <div className={`bg-gray-50 border-2 ${config.borderColor} rounded-xl p-4 mb-4 text-left`}>
                        <p className="text-sm font-semibold text-gray-700 mb-2">This action will:</p>
                        <ul className="space-y-1.5">
                            {consequences.map((consequence, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className={`${config.iconColor} mt-0.5`}>"</span>
                                    <span>{consequence}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Undo Information */}
                {showUndo && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mb-4">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Don't worry!</span> You'll have {undoWindow} seconds to undo this action.
                        </p>
                    </div>
                )}

                {/* Confirmation Checkbox */}
                {requireConfirmation && (
                    <label className="flex items-start gap-3 p-3 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors mb-4">
                        <input
                            type="checkbox"
                            checked={isConfirmed}
                            onChange={(e) => setIsConfirmed(e.target.checked)}
                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-offset-0 mt-0.5 flex-shrink-0"
                        />
                        <span className="text-sm text-gray-700 font-medium text-left">
                            {confirmationText}
                        </span>
                    </label>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center mt-6">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || !isConfirmed}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonClass}`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </span>
                        ) : confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// Preset confirmation modals for common scenarios
export const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    itemType = 'item',
    loading = false,
    showUndo = true
}) => (
    <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title={`Delete ${itemType}?`}
        message={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={loading}
        consequences={[
            `The ${itemType} will be permanently removed`,
            'All associated data will be deleted',
            'This action cannot be reversed'
        ]}
        showUndo={showUndo}
    />
);

export const RejectConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    applicantName,
    loading = false
}) => (
    <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Reject Application?"
        message={`Are you sure you want to reject ${applicantName}'s application?`}
        confirmLabel="Reject"
        variant="warning"
        loading={loading}
        consequences={[
            'The applicant will be notified',
            'They cannot reapply for this job',
            'This action can be undone within 5 seconds'
        ]}
        showUndo={true}
    />
);

export const CancelJobConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    jobTitle,
    loading = false
}) => (
    <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Cancel Job Posting?"
        message={`Are you sure you want to cancel "${jobTitle}"?`}
        confirmLabel="Cancel Job"
        variant="danger"
        loading={loading}
        requireConfirmation={true}
        confirmationText="I understand this will affect active applications"
        consequences={[
            'All applicants will be notified',
            'Active assignments will be terminated',
            'The job will be removed from listings',
            'This action cannot be undone'
        ]}
    />
);

export default ConfirmationModal;
