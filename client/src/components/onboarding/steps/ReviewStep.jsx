import React from 'react';
import PropTypes from 'prop-types';
import { User, Mail, Phone, MapPin, Briefcase, DollarSign, FileText, Check, AlertCircle, Globe, Linkedin, Github, Twitter, Dribbble, Layout, Instagram, Code, Link as LinkIcon } from 'lucide-react';

const ReviewStep = ({ formData, profileCompleteness = 0 }) => {
    const sections = [
        {
            title: 'Personal Information',
            icon: User,
            items: [
                { label: 'Full Name', value: formData.fullName },
                { label: 'Phone', value: formData.phone },
                { label: 'Location', value: formData.location || 'Not provided' },
                { label: 'Bio', value: formData.bio, multiline: true }
            ]
        },
        {
            title: 'Professional Links',
            icon: Globe,
            items: [
                { label: 'Website', value: formData.website || 'Not provided', isLink: !!formData.website, icon: Globe },
                { label: 'LinkedIn', value: formData.linkedinProfile || 'Not provided', isLink: !!formData.linkedinProfile, icon: Linkedin },
                { label: 'GitHub', value: formData.githubProfile || 'Not provided', isLink: !!formData.githubProfile, icon: Github },
                { label: 'Twitter / X', value: formData.twitterProfile || 'Not provided', isLink: !!formData.twitterProfile, icon: Twitter },
                { label: 'Dribbble', value: formData.dribbbleProfile || 'Not provided', isLink: !!formData.dribbbleProfile, icon: Dribbble },
                { label: 'Behance', value: formData.behanceProfile || 'Not provided', isLink: !!formData.behanceProfile, icon: Layout },
                { label: 'Instagram', value: formData.instagramProfile || 'Not provided', isLink: !!formData.instagramProfile, icon: Instagram },
                { label: 'StackOverflow', value: formData.stackoverflowProfile || 'Not provided', isLink: !!formData.stackoverflowProfile, icon: Code }
            ]
        },
        ...(formData.portfolioLinks && formData.portfolioLinks.length > 0 ? [{
            title: 'Portfolio Projects',
            icon: LinkIcon,
            items: formData.portfolioLinks.map((link, index) => ({
                label: `Project ${index + 1}`,
                value: link,
                isLink: true,
                icon: LinkIcon
            }))
        }] : []),
        {
            title: 'Skills & Expertise',
            icon: Briefcase,
            items: [
                { label: 'Skills', value: formData.skills?.join(', ') || 'None added' },
                { label: 'Hourly Rate', value: formData.hourlyRate ? `$${formData.hourlyRate}/hr` : 'Not set' },
                { label: 'Job Types', value: formData.preferredJobTypes?.map(type => type.replace('-', ' ')).join(', ') || 'None selected' },
                { label: 'Relocation', value: formData.willingToRelocate ? 'Open to relocating' : 'Remote only' }
            ]
        },
        {
            title: 'Experience',
            icon: Briefcase,
            items: formData.experience && formData.experience.length > 0
                ? formData.experience.map((exp, idx) => ({
                    label: `Position ${idx + 1}`,
                    value: `${exp.title} at ${exp.company}`,
                    subtitle: `${new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                }))
                : [{ label: 'Work Experience', value: 'No experience added' }]
        },
        {
            title: 'Documents',
            icon: FileText,
            items: [
                { label: 'Resume', value: formData.resume ? '✓ Uploaded' : '✗ Not uploaded', status: !!formData.resume },
                { label: 'Video Introduction', value: formData.videoIntroduction ? '✓ Uploaded' : 'Not provided (optional)', status: formData.videoIntroduction }
            ]
        }
    ];

    const missingItems = [];
    if (!formData.fullName) missingItems.push('Full Name');
    if (!formData.phone) missingItems.push('Phone Number');
    if (!formData.bio || formData.bio.length < 50) missingItems.push('Professional Bio (min 50 chars)');
    if (!formData.skills || formData.skills.length < 3) missingItems.push('At least 3 skills');
    if (!formData.hourlyRate) missingItems.push('Hourly Rate');
    if (!formData.preferredJobTypes || formData.preferredJobTypes.length === 0) missingItems.push('Preferred Job Types');
    if (!formData.resume && (!formData.experience || formData.experience.length === 0)) {
        missingItems.push('Resume or Work Experience');
    }

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
                            <p className="text-sm">Your profile is ready to submit for review.</p>
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
                                    <div className="flex items-center gap-2">
                                        {item.icon && <item.icon className="w-4 h-4 text-gray-500" />}
                                        <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                                    </div>
                                    {item.subtitle && (
                                        <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                                    )}
                                </div>
                                <div className="flex-1 text-right">
                                    {item.multiline ? (
                                        <p className="text-sm text-gray-900 text-left ml-4">{item.value}</p>
                                    ) : item.isLink ? (
                                        <a
                                            href={item.value}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary-600 hover:text-primary-700 hover:underline truncate block"
                                        >
                                            {item.value}
                                        </a>
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
            <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-200">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">Ready to Submit?</h4>
                        <p className="text-sm text-gray-700 mb-3">
                            Review your information carefully. Once submitted, your profile will be reviewed by our team.
                            You can still edit and resubmit if changes are needed.
                        </p>
                        <p className="text-sm font-semibold text-primary-700">
                            Click "Submit for Review" below to complete your onboarding!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

ReviewStep.propTypes = {
    formData: PropTypes.object.isRequired,
    profileCompleteness: PropTypes.number
};

export default ReviewStep;
