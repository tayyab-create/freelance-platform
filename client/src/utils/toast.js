import { toast as reactToast } from 'react-toastify';

/**
 * Enhanced toast notification system with better UX
 * Features:
 * - Persistent error notifications (don't auto-close)
 * - Action buttons for undo/retry
 * - Custom icons and styling
 */

const defaultOptions = {
    position: 'top-right',
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

export const toast = {
    /**
     * Success toast - Auto closes after 3 seconds
     */
    success: (message, options = {}) => {
        return reactToast.success(message, {
            ...defaultOptions,
            autoClose: 3000,
            className: 'toast-success',
            ...options
        });
    },

    /**
     * Error toast - Persistent (must be manually dismissed)
     * Use for critical errors that need user attention
     */
    error: (message, options = {}) => {
        return reactToast.error(message, {
            ...defaultOptions,
            autoClose: false, // Persistent - user must dismiss
            closeButton: true,
            className: 'toast-error',
            ...options
        });
    },

    /**
     * Error toast with auto-close - For non-critical errors
     */
    errorAutoClose: (message, options = {}) => {
        return reactToast.error(message, {
            ...defaultOptions,
            autoClose: 5000,
            className: 'toast-error',
            ...options
        });
    },

    /**
     * Warning toast - Auto closes after 4 seconds
     */
    warning: (message, options = {}) => {
        return reactToast.warning(message, {
            ...defaultOptions,
            autoClose: 4000,
            className: 'toast-warning',
            ...options
        });
    },

    /**
     * Info toast - Auto closes after 3 seconds
     */
    info: (message, options = {}) => {
        return reactToast.info(message, {
            ...defaultOptions,
            autoClose: 3000,
            className: 'toast-info',
            ...options
        });
    },

    /**
     * Promise toast - Shows loading, success, or error based on promise
     */
    promise: (promise, messages = {}) => {
        return reactToast.promise(promise, {
            pending: messages.pending || 'Processing...',
            success: messages.success || 'Success!',
            error: messages.error || 'Something went wrong'
        }, {
            ...defaultOptions,
            autoClose: 3000
        });
    },

    /**
     * Action toast - Shows a toast with an action button
     * @param {string} message - The message to display
     * @param {Function} onAction - Callback when action button is clicked
     * @param {string} actionLabel - Label for action button (default: 'Undo')
     * @param {object} options - Additional toast options
     */
    withAction: (message, onAction, actionLabel = 'Undo', options = {}) => {
        const ActionButton = ({ closeToast }) => (
            <div className="flex items-center gap-3">
                <span>{message}</span>
                <button
                    onClick={() => {
                        onAction();
                        closeToast();
                    }}
                    className="px-3 py-1 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                    {actionLabel}
                </button>
            </div>
        );

        return reactToast(ActionButton, {
            ...defaultOptions,
            autoClose: 5000,
            ...options
        });
    },

    /**
     * Undo toast - Shows a toast with undo functionality (5 second window)
     * @param {string} message - The message to display
     * @param {Function} onUndo - Callback when undo is clicked
     * @param {object} options - Additional toast options
     */
    undo: (message, onUndo, options = {}) => {
        return toast.withAction(message, onUndo, 'Undo', {
            autoClose: 5000,
            closeButton: false,
            ...options
        });
    },

    /**
     * Dismiss a specific toast
     */
    dismiss: (toastId) => {
        reactToast.dismiss(toastId);
    },

    /**
     * Dismiss all toasts
     */
    dismissAll: () => {
        reactToast.dismiss();
    }
};

// Named exports for convenience and backward compatibility
export const showSuccessToast = (message, options) => toast.success(message, options);
export const showErrorToast = (message, options) => toast.error(message, options);
export const showInfoToast = (message, options) => toast.info(message, options);
export const showWarningToast = (message, options) => toast.warning(message, options);

// Export for backward compatibility
export default toast;
