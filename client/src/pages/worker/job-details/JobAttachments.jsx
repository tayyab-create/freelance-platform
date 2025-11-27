import React from 'react';
import { FiPaperclip, FiFile } from 'react-icons/fi';

const JobAttachments = ({ attachments }) => {
    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FiPaperclip className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Attachments</h2>
            </div>
            <div className="space-y-3">
                {attachments.map((file, index) => (
                    <a
                        key={index}
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all group"
                    >
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                            <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                <FiFile className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                    {file.fileName}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                                </p>
                            </div>
                        </div>
                        <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default JobAttachments;
