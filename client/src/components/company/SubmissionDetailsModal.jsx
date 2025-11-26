import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../common/Button';
import {
    FiUser,
    FiClock,
    FiFileText,
    FiExternalLink,
    FiFile,
    FiCheckCircle,
    FiRefreshCw,
    FiDownload,
    FiX
} from 'react-icons/fi';
import StatusBadge from '../shared/StatusBadge';

const SubmissionDetailsModal = ({
    isOpen,
    onClose,
    submission,
    onApprove,
    onRequestRevision,
    processing
}) => {
    const [previewImage, setPreviewImage] = useState(null);

    if (!submission) return null;

    const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

    const getFullFileUrl = (fileUrl) => {
        if (!fileUrl) return '';
        if (fileUrl.startsWith('http')) {
            return fileUrl.replace('http://localhost:5000', API_BASE_URL);
        }
        return `${API_BASE_URL}${fileUrl}`;
    };

    const isImageFile = (file) => {
        if (file.fileType) {
            return file.fileType.startsWith('image/');
        }
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        return imageExtensions.some(ext => file.fileName?.toLowerCase().endsWith(ext));
    };

    const footer = (
        <div className="flex gap-3 w-full justify-end">
            <Button variant="secondary" onClick={onClose}>
                Close
            </Button>
            {submission.status === 'submitted' && (
                <>
                    <Button
                        variant="secondary"
                        icon={FiRefreshCw}
                        onClick={() => onRequestRevision(submission)}
                        disabled={processing}
                    >
                        Request Changes
                    </Button>
                    <Button
                        variant="primary"
                        icon={FiCheckCircle}
                        onClick={() => onApprove(submission.job._id)}
                        loading={processing}
                        disabled={processing}
                    >
                        Approve & Complete
                    </Button>
                </>
            )}
        </div>
    );

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Submission Details"
                size="lg"
                footer={footer}
            >
                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex items-start justify-between bg-gray-50 p-4 rounded-xl">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {submission.job?.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <FiUser className="w-4 h-4" />
                                    {submission.worker?.email}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <FiClock className="w-4 h-4" />
                                    {new Date(submission.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <StatusBadge status={submission.status} />
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <FiFileText className="w-4 h-4" />
                            Description
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {submission.description || 'No description provided.'}
                        </div>
                    </div>

                    {/* Links */}
                    {submission.links && submission.links.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <FiExternalLink className="w-4 h-4" />
                                External Links
                            </h4>
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                {submission.links.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-100"
                                    >
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <FiExternalLink className="w-4 h-4" />
                                        </div>
                                        <span className="text-blue-600 hover:underline truncate flex-1">
                                            {link}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    {submission.files && submission.files.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <FiFile className="w-4 h-4" />
                                Attachments ({submission.files.length})
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {submission.files.map((file, index) => {
                                    const fileUrl = getFullFileUrl(file.fileUrl);
                                    const isImage = isImageFile(file);

                                    return (
                                        <div
                                            key={index}
                                            className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                                        >
                                            {isImage ? (
                                                <div
                                                    className="aspect-video bg-gray-100 cursor-pointer overflow-hidden"
                                                    onClick={() => setPreviewImage(fileUrl)}
                                                >
                                                    <img
                                                        src={fileUrl}
                                                        alt={file.fileName}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-video bg-gray-50 flex flex-col items-center justify-center p-4">
                                                    <FiFile className="w-8 h-8 text-gray-400 mb-2" />
                                                    <span className="text-xs text-gray-500 uppercase font-bold">
                                                        {file.fileName.split('.').pop()}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="p-3">
                                                <p className="text-sm font-medium text-gray-900 truncate mb-2" title={file.fileName}>
                                                    {file.fileName}
                                                </p>
                                                <a
                                                    href={fileUrl}
                                                    download
                                                    className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <FiDownload className="w-3 h-3" />
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Image Preview Overlay */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};

export default SubmissionDetailsModal;
