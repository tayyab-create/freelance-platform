import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '../utils/toast';

/**
 * useUndo Hook
 * Provides undo functionality with a configurable time window
 *
 * Features:
 * - Configurable undo window (default 5 seconds)
 * - Toast notification with undo button
 * - Automatic execution after window expires
 * - Cancel pending actions
 * - Track undo state
 *
 * @param {number} undoWindow - Time in milliseconds for undo window (default: 5000)
 * @returns {Object} - Undo utilities
 *
 * @example
 * const { executeWithUndo, canUndo, cancelUndo } = useUndo(5000);
 *
 * const handleDelete = async () => {
 *   executeWithUndo({
 *     action: async () => {
 *       await api.deleteItem(id);
 *     },
 *     message: 'Item deleted',
 *     onUndo: async () => {
 *       await api.restoreItem(id);
 *     },
 *     onComplete: () => {
 *       console.log('Delete completed');
 *     }
 *   });
 * };
 */
const useUndo = (undoWindow = 5000) => {
    const [pendingActions, setPendingActions] = useState(new Map());
    const timeoutsRef = useRef(new Map());
    const toastIdsRef = useRef(new Map());

    /**
     * Execute an action with undo capability
     */
    const executeWithUndo = useCallback(({
        action,
        message = 'Action completed',
        onUndo,
        onComplete,
        undoMessage = 'Action undone',
        actionId = Date.now().toString()
    }) => {
        // Clear any existing timeout for this action
        if (timeoutsRef.current.has(actionId)) {
            clearTimeout(timeoutsRef.current.get(actionId));
            if (toastIdsRef.current.has(actionId)) {
                toast.dismiss(toastIdsRef.current.get(actionId));
            }
        }

        // Store pending action
        setPendingActions(prev => new Map(prev).set(actionId, {
            action,
            onUndo,
            onComplete
        }));

        // Show undo toast
        const toastId = toast.undo(
            message,
            async () => {
                // Undo was clicked
                const pendingAction = pendingActions.get(actionId);
                if (pendingAction?.onUndo) {
                    try {
                        await pendingAction.onUndo();
                        toast.success(undoMessage);
                    } catch (error) {
                        console.error('Undo failed:', error);
                        toast.error('Failed to undo action');
                    }
                }

                // Clean up
                clearTimeout(timeoutsRef.current.get(actionId));
                timeoutsRef.current.delete(actionId);
                toastIdsRef.current.delete(actionId);
                setPendingActions(prev => {
                    const next = new Map(prev);
                    next.delete(actionId);
                    return next;
                });
            },
            {
                autoClose: undoWindow,
                closeButton: false
            }
        );

        toastIdsRef.current.set(actionId, toastId);

        // Set timeout to execute action
        const timeoutId = setTimeout(async () => {
            const pendingAction = pendingActions.get(actionId);
            if (pendingAction?.action) {
                try {
                    await pendingAction.action();
                    if (pendingAction.onComplete) {
                        pendingAction.onComplete();
                    }
                } catch (error) {
                    console.error('Action execution failed:', error);
                    toast.error('Action failed to complete');
                }
            }

            // Clean up
            timeoutsRef.current.delete(actionId);
            toastIdsRef.current.delete(actionId);
            setPendingActions(prev => {
                const next = new Map(prev);
                next.delete(actionId);
                return next;
            });
        }, undoWindow);

        timeoutsRef.current.set(actionId, timeoutId);

        return actionId;
    }, [undoWindow, pendingActions]);

    /**
     * Cancel a pending action
     */
    const cancelUndo = useCallback((actionId) => {
        if (timeoutsRef.current.has(actionId)) {
            clearTimeout(timeoutsRef.current.get(actionId));
            timeoutsRef.current.delete(actionId);
        }

        if (toastIdsRef.current.has(actionId)) {
            toast.dismiss(toastIdsRef.current.get(actionId));
            toastIdsRef.current.delete(actionId);
        }

        setPendingActions(prev => {
            const next = new Map(prev);
            next.delete(actionId);
            return next;
        });
    }, []);

    /**
     * Check if an action can be undone
     */
    const canUndo = useCallback((actionId) => {
        return pendingActions.has(actionId);
    }, [pendingActions]);

    /**
     * Cancel all pending actions
     */
    const cancelAll = useCallback(() => {
        timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        toastIdsRef.current.forEach(toastId => toast.dismiss(toastId));

        timeoutsRef.current.clear();
        toastIdsRef.current.clear();
        setPendingActions(new Map());
    }, []);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
            timeoutsRef.current.clear();
            toastIdsRef.current.clear();
        };
    }, []);

    return {
        executeWithUndo,
        cancelUndo,
        canUndo,
        cancelAll,
        pendingActionsCount: pendingActions.size
    };
};

/**
 * useUndoStack Hook
 * Provides a full undo/redo stack for complex state management
 *
 * @param {any} initialState - Initial state value
 * @param {number} maxHistory - Maximum history size (default: 50)
 * @returns {Object} - State and undo/redo utilities
 *
 * @example
 * const { state, setState, undo, redo, canUndo, canRedo, clearHistory } = useUndoStack(initialFormData);
 */
export const useUndoStack = (initialState, maxHistory = 50) => {
    const [state, setInternalState] = useState(initialState);
    const [history, setHistory] = useState([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const setState = useCallback((newState) => {
        setInternalState(newState);

        // Add to history
        setHistory(prev => {
            const newHistory = prev.slice(0, currentIndex + 1);
            newHistory.push(newState);

            // Limit history size
            if (newHistory.length > maxHistory) {
                newHistory.shift();
                return newHistory;
            }

            return newHistory;
        });

        setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1));
    }, [currentIndex, maxHistory]);

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            setInternalState(history[newIndex]);
        }
    }, [currentIndex, history]);

    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            setInternalState(history[newIndex]);
        }
    }, [currentIndex, history]);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const clearHistory = useCallback(() => {
        setHistory([state]);
        setCurrentIndex(0);
    }, [state]);

    return {
        state,
        setState,
        undo,
        redo,
        canUndo,
        canRedo,
        clearHistory,
        historySize: history.length
    };
};

export default useUndo;
