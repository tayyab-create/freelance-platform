import React from 'react';
import PropTypes from 'prop-types';
import FileUpload from '../../common/FileUpload';
import { FileText, Video, Shield } from 'lucide-react';

const VerificationStep = ({ formData, onFileUpload, errors = {} }) => {
    return (
        <div className="space-y-6">
            {/* Resume Upload */}
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <div className="icon-container">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Upload Your Resume</h3>
                        <p className="text-sm text-gray-600">PDF format preferred (max 10MB)</p>
                    </div>
                </div>

                <FileUpload
                    label="Resume / CV"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    value={formData.resume}
                    onChange={(file) => onFileUpload('resume', file)}
                    helperText="Upload your latest resume or CV in PDF or DOC format"
                    maxSize={10}
                />
                {errors.resume && (
                    <p className="mt-2 text-sm text-red-600">{errors.resume}</p>
                )}
            </div>

            {/* Video Introduction (Optional) */}
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <div className="icon-container">
                        <Video className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Video Introduction (Optional)</h3>
                        <p className="text-sm text-gray-600">Stand out with a 1-2 minute video</p>
                    </div>
                </div>

                <div className="card animate-fade-in">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                        <div className="flex-shrink-0 mt-1">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1 text-sm">
                            <p className="font-semibold text-blue-900 mb-1">Tips for your video:</p>
                            <ul className="text-blue-800 space-y-1 list-disc list-inside">
                                <li>Introduce yourself and your background</li>
                                <li>Highlight 2-3 key skills or achievements</li>
                                <li>Keep it professional but personable</li>
                                <li>Ensure good lighting and audio quality</li>
                            </ul>
                        </div>
                    </div>

                    <FileUpload
                        name="videoIntroduction"
                        accept="video/*"
                        value={formData.videoIntroduction}
                        onChange={(file) => onFileUpload('videoIntroduction', file)}
                        helperText="MP4, MOV, or AVI format (max 50MB, 1-2 minutes)"
                        maxSize={50}
                    />
                </div>
            </div>

            {/* Verification Badge */}
            <div className="card-premium">
                <div className="flex items-start gap-4">
                    <div className="icon-container">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">Account Verification</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Your profile will be reviewed by our team to ensure quality and authenticity.
                            This helps maintain trust across our platform.
                        </p>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center gap-2 text-green-700">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold">What happens next?</span>
                            </div>
                            <ul className="mt-3 text-sm text-green-800 space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 mt-0.5">1.</span>
                                    <span>Submit your profile for review</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 mt-0.5">2.</span>
                                    <span>Our team reviews your information (usually within 24-48 hours)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 mt-0.5">3.</span>
                                    <span>You'll receive an email notification once approved</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 mt-0.5">4.</span>
                                    <span>Start applying to jobs immediately after approval!</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

VerificationStep.propTypes = {
    formData: PropTypes.object.isRequired,
    onFileUpload: PropTypes.func.isRequired,
    errors: PropTypes.object
};

export default VerificationStep;
