import React from 'react';
import PropTypes from 'prop-types';
import { Building, MapPin, User, FileText, Check, AlertCircle, Globe } from 'lucide-react';

const CompanyReviewStep = ({ formData, profileCompleteness = 0 }) => {
    const sections = [
        {
            title: 'Company Information',
            icon: Building,
            items: [
                { label: 'Company Name', value: formData.companyName },
                { label: 'Website', value: formData.website },
                { label: 'Industry', value: formData.industry },
                { label: 'Size', value: formData.companySize },
                { label: 'Description', value: formData.description, multiline: true }
            ]
        },
        {
            title: 'Contact & Location',
            icon: MapPin,
            items: [
                { label: 'Address', value: `${formData.address?.street || ''}, ${formData.address?.city || ''}, ${formData.address?.country || ''}` },
                { label: 'Contact Person', value: formData.contactPerson?.name },
                { label: 'Email', value: formData.contactPerson?.email },
                { label: 'Phone', value: formData.contactPerson?.phone || 'Not provided' }
            ]
        },
        {
            title: 'Social Media',
            icon: Globe,
            items: [
                { label: 'LinkedIn', value: formData.linkedinProfile || 'Not provided' },
                { label: 'Twitter', value: formData.socialMedia?.twitter || 'Not provided' },
                { label: 'Facebook', value: formData.socialMedia?.facebook || 'Not provided' }
            ]
        },
        {
            title: 'Documents & Branding',
            icon: FileText,
            items: [
                { label: 'Logo', value: formData.logo ? '✓ Uploaded' : '✗ Not uploaded', status: !!formData.logo },
                { label: 'Registration No.', value: formData.registrationNumber || 'Not provided' },
                { label: 'Tax Documents', value: formData.taxDocuments?.length > 0 ? `✓ ${formData.taxDocuments.length} files uploaded` : 'Not provided', status: formData.taxDocuments?.length > 0 },
                { label: 'Company Video', value: formData.companyVideo ? '✓ Uploaded' : 'Not provided', status: !!formData.companyVideo }
            ]
        }
    ];

    const missingItems = [];
    if (!formData.companyName) missingItems.push('Company Name');
    if (!formData.description || formData.description.length < 100) missingItems.push('Description (min 100 chars)');
    if (!formData.industry) missingItems.push('Industry');
    if (!formData.website) missingItems.push('Website');
    if (!formData.address?.city || !formData.address?.country) missingItems.push('City and Country');
    if (!formData.contactPerson?.name || !formData.contactPerson?.email) missingItems.push('Contact Person Name & Email');

    const isReadyToSubmit = missingItems.length === 0 && profileCompleteness >= 70;

    return (
        <div className="space-y-6">
            {/* Completeness Alert */}
            {!isReadyToSubmit && (
                <div className="alert alert-warning">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-semibold mb-2">Profile Incomplete</p>
                            <p className="text-sm mb-2">Please complete the following before submitting:</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {missingItems.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {isReadyToSubmit && (
                <div className="alert alert-success">
                    <div className="flex items-center gap-3">
                        <Check className="w-6 h-6 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Profile Complete!</p>
                            <p className="text-sm">Your company profile is ready to submit for review.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Sections */}
            {sections.map((section, sectionIdx) => (
                <div key={sectionIdx} className="card-premium">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="icon-container">
                            <section.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                    </div>

                    <div className="space-y-3">
                        {section.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                                </div>
                                <div className="flex-1 text-right">
                                    {item.multiline ? (
                                        <p className="text-sm text-gray-900 text-left ml-4">{item.value}</p>
                                    ) : (
                                        <p className={`text-sm ${item.status !== undefined ? (item.status ? 'text-green-600 font-semibold' : 'text-gray-500') : 'text-gray-900'}`}>
                                            {item.value}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Final Instructions */}
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">Ready to Launch?</h4>
                        <p className="text-sm text-gray-700 mb-3">
                            Once approved, you'll be able to post jobs, search for talent, and build your team.
                            Our team reviews company profiles within 24 hours.
                        </p>
                        <p className="text-sm font-semibold text-blue-700">
                            Click "Submit for Review" below to finalize your company profile!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

CompanyReviewStep.propTypes = {
    formData: PropTypes.object.isRequired,
    profileCompleteness: PropTypes.number
};

export default CompanyReviewStep;
