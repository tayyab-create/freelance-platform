import React from 'react';
import { FiX, FiDollarSign, FiPaperclip, FiFile, FiSend } from 'react-icons/fi';
import FileUpload from '../../../components/common/FileUpload';

const ApplicationModal = ({
    show,
    onClose,
    job,
    proposal,
    setProposal,
    proposedRate,
    setProposedRate,
    uploadedFiles,
    uploadingFiles,
    uploadProgress,
    handleFileUpload,
    handleRemoveFile,
    handleApply,
    applying
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Submit Application</h3>
                            <p className="text-sm text-gray-600 mt-1">Apply for {job.title}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                        >
                            <FiX className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleApply} className="p-6 space-y-6">
                        {/* Proposal */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Cover Letter / Proposal *
                            </label>
                            <textarea
                                value={proposal}
                                onChange={(e) => setProposal(e.target.value)}
                                placeholder="Introduce yourself and explain why you're the perfect fit for this role. Highlight your relevant experience and skills..."
                                rows="10"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none text-gray-700 placeholder:text-gray-400"
                            />
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">Minimum 50 characters required</p>
                                <p className={`text-xs font-semibold ${proposal.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {proposal.length} / 50
                                </p>
                            </div>
                        </div>

                        {/* Proposed Rate */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Your Proposed Rate
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiDollarSign className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    value={proposedRate}
                                    onChange={(e) => setProposedRate(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-semibold text-gray-900"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-500">
                                    Client's budget: <span className="font-semibold text-gray-900">${job.salary}</span> {job.salaryType}
                                </p>
                            </div>
                        </div>

                        {/* Attachments */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Attachments (Optional)
                            </label>

                            <div className="space-y-3">
                                {!uploadingFiles && (
                                    <FileUpload
                                        onFileSelect={handleFileUpload}
                                        multiple={true}
                                        accept="*/*"
                                        maxSize={10}
                                        showProgress={false}
                                    >
                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 hover:border-primary-300 transition-all cursor-pointer group">
                                            <div className="h-10 w-10 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                                <FiPaperclip className="h-5 w-5" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-700">Click to attach files</p>
                                            <p className="text-xs text-gray-400 mt-1">Portfolio, resume, or relevant documents</p>
                                        </div>
                                    </FileUpload>
                                )}

                                {uploadingFiles && (
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-center gap-2 text-primary-600">
                                                <div className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm font-medium">Uploading...</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-center text-gray-500">{uploadProgress}%</p>
                                        </div>
                                    </div>
                                )}

                                {uploadedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                    <div className="p-1.5 bg-white rounded border border-gray-100 text-blue-600">
                                                        <FiFile className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-gray-700 truncate">{file.fileName}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <FiX className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={applying || proposal.length < 50}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
                            >
                                {applying ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FiSend className="w-5 h-5" />
                                        Submit Application
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ApplicationModal;
