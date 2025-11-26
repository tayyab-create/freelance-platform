import { useEffect, useRef, useCallback, useState } from 'react';
import { debounce } from '../utils/validation';

/**
 * Custom hook for auto-saving form data to localStorage
 *
 * @param {string} key - Unique key for localStorage
 * @param {Object} data - Form data to save
 * @param {Object} options - Configuration options
 * @returns {Object} Auto-save state and methods
 */
export const useAutoSave = (key, data, options = {}) => {
  const {
    enabled = true,
    debounceDelay = 1000,
    onSave = null,
    onRestore = null,
    exclude = [],
    includeTimestamp = true,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isInitialMount = useRef(true);
  const previousData = useRef(data);

  // Filter out excluded fields
  const filterData = useCallback(
    (dataToFilter) => {
      if (exclude.length === 0) return dataToFilter;

      const filtered = { ...dataToFilter };
      exclude.forEach((field) => {
        delete filtered[field];
      });
      return filtered;
    },
    [exclude]
  );

  // Save to localStorage
  const saveToStorage = useCallback(
    async (dataToSave) => {
      if (!enabled || !key) return;

      setIsSaving(true);

      try {
        const filteredData = filterData(dataToSave);
        const saveData = {
          data: filteredData,
          ...(includeTimestamp && { timestamp: new Date().toISOString() }),
        };

        localStorage.setItem(key, JSON.stringify(saveData));
        setLastSaved(new Date());
        setHasUnsavedChanges(false);

        if (onSave) {
          await onSave(filteredData);
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [enabled, key, filterData, includeTimestamp, onSave]
  );

  // Debounced save function
  const debouncedSave = useRef(
    debounce((dataToSave) => {
      saveToStorage(dataToSave);
    }, debounceDelay)
  ).current;

  // Restore from localStorage
  const restoreFromStorage = useCallback(() => {
    if (!enabled || !key) return null;

    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      const restoredData = parsed.data || parsed;

      if (onRestore) {
        onRestore(restoredData);
      }

      return {
        data: restoredData,
        timestamp: parsed.timestamp || null,
      };
    } catch (error) {
      console.error('Auto-restore error:', error);
      return null;
    }
  }, [enabled, key, onRestore]);

  // Clear saved data
  const clearSaved = useCallback(() => {
    if (!key) return;

    try {
      localStorage.removeItem(key);
      setLastSaved(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Clear saved data error:', error);
    }
  }, [key]);

  // Check if data exists in storage
  const hasSavedData = useCallback(() => {
    if (!key) return false;

    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }, [key]);

  // Force save immediately
  const forceSave = useCallback(() => {
    saveToStorage(data);
  }, [data, saveToStorage]);

  // Auto-save effect
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Check if data has changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousData.current);

    if (hasChanged && enabled) {
      setHasUnsavedChanges(true);
      debouncedSave(data);
      previousData.current = data;
    }
  }, [data, enabled, debouncedSave]);

  // Save before unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      if (hasUnsavedChanges) {
        forceSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, hasUnsavedChanges, forceSave]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    hasSavedData: hasSavedData(),
    restoreFromStorage,
    clearSaved,
    forceSave,
  };
};

export default useAutoSave;
