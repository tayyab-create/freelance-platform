import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';

/**
 * Custom hook to warn users about unsaved changes before navigation
 *
 * @param {boolean} isDirty - Whether the form has unsaved changes
 * @param {Object} options - Configuration options
 * @returns {Object} Navigation blocker methods
 */
export const useUnsavedChanges = (isDirty, options = {}) => {
  const {
    message = 'You have unsaved changes. Are you sure you want to leave?',
    enabled = true,
  } = options;

  const navigate = useNavigate();
  const isBlocking = useRef(false);

  // Block navigation in React Router
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      enabled &&
      isDirty &&
      currentLocation.pathname !== nextLocation.pathname
  );

  // Handle browser navigation (refresh, close tab, etc.)
  useEffect(() => {
    if (!enabled || !isDirty) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, isDirty, message]);

  // Confirm and proceed with navigation
  const confirmNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  }, [blocker]);

  // Cancel navigation
  const cancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  // Navigate with confirmation
  const navigateWithConfirmation = useCallback(
    (to) => {
      if (isDirty && enabled) {
        const confirmed = window.confirm(message);
        if (confirmed) {
          navigate(to);
        }
      } else {
        navigate(to);
      }
    },
    [isDirty, enabled, message, navigate]
  );

  return {
    isBlocking: blocker.state === 'blocked',
    confirmNavigation,
    cancelNavigation,
    navigateWithConfirmation,
    blocker,
  };
};

/**
 * Simpler hook for basic unsaved changes warning
 * Use this when you don't need React Router blocking
 */
export const useUnsavedChangesWarning = (isDirty, message) => {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = message || 'You have unsaved changes.';
      return message || 'You have unsaved changes.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);
};

export default useUnsavedChanges;
