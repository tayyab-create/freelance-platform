import React from 'react';
import { FiPaperclip, FiFile, FiX } from 'react-icons/fi';
import FileUpload from '../../../components/common/FileUpload';

const JobAttachments = ({ uploadingFiles, uploadProgress, uploadedFiles, handleFileUpload, handleRemoveFile }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FiPaperclip className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Attachments (Optional)</h2>
            </div>

            <div className="space-y-3">
                {/* Upload Area */}
                {!uploadingFiles && (
                    <FileUpload
                        onFileSelect={handleFileUpload}
                        multiple={true}
                        accept="*/*"
                        maxSize={10}
                        showProgress={false}
                    >
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-primary-300 transition-all cursor-pointer group">
                            <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <FiPaperclip className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">Click to attach files</p>
                            <p className="text-xs text-gray-400 mt-1">Documents, specifications, or references (max 10MB per file)</p>
                        </div>
                    </FileUpload>
                )}

                {/* Upload Progress */}
                {uploadingFiles && (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2 text-primary-600">
                                <div className="h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium">Uploading files...</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-center text-gray-500">{uploadProgress}%</p>
                        </div>
                    </div>
                )}

                {/* File List */}
                {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                    <div className="p-2 bg-white rounded-lg border border-gray-100 text-blue-600">
                                        <FiFile className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">{file.fileName}</p>
                                        <p className="text-xs text-gray-500">
                                            {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobAttachments;
