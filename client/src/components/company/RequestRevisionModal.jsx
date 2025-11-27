import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../common/Button';
import { FiRefreshCw, FiCalendar, FiPaperclip, FiX, FiUpload } from 'react-icons/fi';
import { uploadAPI } from '../../services/api';
import { toast } from '../../utils/toast';

const RequestRevisionModal = ({ isOpen, onClose, submission, onSubmit, loading }) => {
    const [feedback, setFeedback] = useState('');
    const [newDeadline, setNewDeadline] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploadedFiles = [];
            for (const file of files) {
                const response = await uploadAPI.uploadSingle(file, 'documents');
                uploadedFiles.push({
                    fileName: response.data.data.originalName,
                    fileUrl: response.data.data.fileUrl,
                    fileType: response.data.data.mimeType
                });
            }
            setAttachments([...attachments, ...uploadedFiles]);
            toast.success('Files uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!feedback.trim() || !newDeadline) {
            toast.error('Please provide feedback and a new deadline');
            return;
        }
        onSubmit({
            feedback,
            newDeadline,
            attachments
        });
    };

    const handleClose = () => {
        setFeedback('');
        setNewDeadline('');
        setAttachments([]);
        onClose();
    };

    const footer = (
        <div className="flex gap-3 w-full justify-end">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
                Cancel
            </Button>
            <Button
                variant="primary"
                icon={FiRefreshCw}
                onClick={handleSubmit}
                loading={loading}
                disabled={loading || uploading}
            >
                Request Revision
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Request Revision"
            size="lg"
            footer={footer}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Job Title */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="font-bold text-gray-900">{submission?.job?.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Submitted by {submission?.workerInfo?.fullName || 'Freelancer'}
                    </p>
                </div>

                {/* Feedback Textarea */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Revision Feedback <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Explain what needs to be changed or improved..."
                        rows="6"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Be specific about what changes are needed to help the freelancer understand your requirements
                    </p>
                </div>

                {/* New Deadline */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        New Deadline <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="datetime-local"
                            value={newDeadline}
                            onChange={(e) => setNewDeadline(e.target.value)}
                            required
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Set a realistic deadline for the freelancer to complete the revisions
                    </p>
                </div>

                {/* File Attachments */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Reference Documents (Optional)
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                        Upload annotated screenshots, reference files, or requirements documents
                    </p>

                    {/* Upload Button */}
                    <div className="mb-4">
                        <label className="relative cursor-pointer">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx,.txt"
                            />
                            <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all">
                                <FiUpload className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
                                    {uploading ? 'Uploading...' : 'Click to upload files'}
                                </span>
                            </div>
                        </label>
                    </div>

                    {/* Attached Files List */}
                    {attachments.length > 0 && (
                        <div className="space-y-2">
                            {attachments.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <FiPaperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-700 truncate">{file.fileName}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile(index)}
                                        className="p-1 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </form>
        </Modal>
    );
};

export default RequestRevisionModal;
