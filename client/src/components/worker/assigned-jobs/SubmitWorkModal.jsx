import React from 'react';
import { FiUpload, FiX, FiFile } from 'react-icons/fi';
import { Modal } from '../../shared';
import FileUpload from '../../common/FileUpload';

const SubmitWorkModal = ({
    isOpen,
    onClose,
    handleSubmit,
    submitData,
    setSubmitData,
    handleFileUpload,
    handleRemoveFile,
    submitting,
    uploadingFiles,
    uploadProgress = 0
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Submit Your Work"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Description */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Description / Notes <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={submitData.description}
                        onChange={(e) => setSubmitData({ ...submitData, description: e.target.value })}
                        placeholder="Describe the work you've done..."
                        rows="6"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
                        required
                        minLength={20}
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">
                        {submitData.description.length}/20 characters minimum
                    </p>
                </div>

                {/* Links */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Project Links (Optional)
                    </label>
                    <textarea
                        value={submitData.links}
                        onChange={(e) => setSubmitData({ ...submitData, links: e.target.value })}
                        placeholder="Enter links to your work (e.g. Google Drive, GitHub, Live Site) - One per line"
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none font-mono text-sm"
                    />
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Attachments (Optional)
                    </label>

                    <div className="space-y-3">
                        {/* Upload Area */}
                        {!uploadingFiles && (
                            <FileUpload
                                onFileSelect={handleFileUpload}
                                multiple={true}
                                isUploading={uploadingFiles}
                                uploadProgress={uploadProgress}
                                showProgress={false}
                                accept="*/*"
                                maxSize={10} // 10MB
                            >
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-primary-300 transition-all cursor-pointer group">
                                    <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <FiUpload className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-700">Click to upload files</p>
                                    <p className="text-xs text-gray-400 mt-1">Max 10MB per file</p>
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
                        {submitData.uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                                {submitData.uploadedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 bg-white rounded-lg border border-gray-100 text-blue-600">
                                                <FiFile className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 truncate">{file.fileName}</span>
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

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || uploadingFiles || submitData.description.length < 20}
                        className="flex-1 px-6 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <FiUpload className="h-5 w-5" />
                                Submit Work
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SubmitWorkModal;
