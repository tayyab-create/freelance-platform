import React from 'react';
import PropTypes from 'prop-types';
import FileUpload from '../../../common/FileUpload';
import Input from '../../../common/Input';
import { FileText, Image, Video, ShieldCheck } from 'lucide-react';

const CompanyDocumentsStep = ({ formData, onChange, onFileUpload, errors = {}, isUploading = false, uploadProgress = 0, disabled = false }) => {
    const handleRegistrationNumberChange = (e) => {
        onChange({ ...formData, registrationNumber: e.target.value });
    };

    return (
        <div className="space-y-8">
            {/* Company Logo */}
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <div className="icon-container">
                        <Image className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Company Logo</h3>
                        <p className="text-sm text-gray-600">This will be displayed on your profile and job posts</p>
                    </div>
                </div>

                <FileUpload
                    label="Upload Logo"
                    name="logo"
                    accept="image/*"
                    value={formData.logo}
                    onFileSelect={(file) => onFileUpload('logo', file)}
                    helperText="PNG, JPG, or SVG (max 2MB). Square ratio recommended."
                    maxSize={2}
                    preview
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    disabled={disabled}
                />
                {errors.logo && (
                    <p className="mt-2 text-sm text-red-600">{errors.logo}</p>
                )}
            </div>

            <div className="divider"></div>

            {/* Legal Documents */}
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <div className="icon-container">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Legal Verification</h3>
                        <p className="text-sm text-gray-600">Required to verify your business identity</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Input
                        label="Business Registration Number"
                        name="registrationNumber"
                        value={formData.registrationNumber || ''}
                        onChange={handleRegistrationNumberChange}
                        placeholder="e.g. 123456789"
                        icon={ShieldCheck}
                        helperText="Your official business registration or tax ID"
                        disabled={disabled}
                    />

                    <FileUpload
                        label="Tax / Registration Documents"
                        name="taxDocuments"
                        accept=".pdf,.jpg,.png"
                        multiple
                        value={formData.taxDocuments} // Assuming this handles array of files or URLs
                        onFileSelect={(files) => onFileUpload('taxDocuments', files)}
                        helperText="Upload official documents proving business registration (max 10MB each)"
                        maxSize={10}
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className="divider"></div>

            {/* Company Video */}
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <div className="icon-container">
                        <Video className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Company Video (Optional)</h3>
                        <p className="text-sm text-gray-600">Showcase your office and culture to attract talent</p>
                    </div>
                </div>

                <div className="alert alert-info mb-4">
                    <p className="text-sm">
                        <strong>Tip:</strong> Companies with video introductions get 40% more applications from top talent.
                    </p>
                </div>

                <FileUpload
                    name="companyVideo"
                    accept="video/*"
                    value={formData.companyVideo}
                    onFileSelect={(file) => onFileUpload('companyVideo', file)}
                    helperText="MP4, MOV (max 50MB). Keep it under 2 minutes."
                    maxSize={50}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

CompanyDocumentsStep.propTypes = {
    formData: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onFileUpload: PropTypes.func.isRequired,
    errors: PropTypes.object
};

export default CompanyDocumentsStep;
