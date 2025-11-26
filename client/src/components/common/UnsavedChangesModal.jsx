import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Modal from '../shared/Modal';
import Button from './Button';

/**
 * Modal to confirm navigation away from a form with unsaved changes
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onConfirm - Callback when user confirms leaving
 * @param {function} onCancel - Callback when user cancels
 * @param {string} title - Modal title
 * @param {string} message - Warning message
 */
const UnsavedChangesModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Unsaved Changes',
  message = 'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div className="py-4">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="text-gray-700 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Stay on Page
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            Leave Without Saving
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UnsavedChangesModal;
