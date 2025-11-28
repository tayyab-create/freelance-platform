import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiX, FiCheck, FiUser, FiBriefcase, FiGlobe, FiMail, FiDownload, FiExternalLink, FiChevronDown } from 'react-icons/fi';
import Button from '../common/Button';
import Textarea from '../common/Textarea';

const UserApprovalModal = ({ isOpen, onClose, user, profile, onApprove, onReject }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [showMoreLinks, setShowMoreLinks] = useState(false);

    if (!user || !profile) return null;

    const isWorker = user.role === 'worker';

    const handleRejectSubmit = () => {
        if (rejectionReason.trim()) {
            onReject(user._id, rejectionReason);
            setRejectionReason('');
            setShowRejectForm(false);
            onClose();
        }
    };

    const handleApprove = () => {
        onApprove(user._id);
        onClose();
    };

    const Section = ({ title, icon: Icon, children, collapsible = false, defaultOpen = true }) => {
        const [isOpen, setIsOpen] = useState(defaultOpen);

        return (
            <div className="mb-6 flex flex-col h-full">
                <button
                    onClick={() => collapsible && setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 ${collapsible ? 'cursor-pointer hover:text-primary-600' : ''}`}
                >
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                        {title}
                    </div>
                    {collapsible && (
                        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                </button>

                {(!collapsible || isOpen) && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 animate-fade-in flex-1">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    const Field = ({ label, value, href }) => (
        <div className="mb-3 last:mb-0">
            <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
            {href ? (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
                >
                    {value || href} <FiExternalLink className="w-3 h-3" />
                </a>
            ) : (
                <p className="text-sm text-gray-900 font-medium">{value || 'Not provided'}</p>
            )}
        </div>
    );

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                                    <div className="flex items-center gap-4">
                                        {profile.profilePicture ? (
                                            <img
                                                src={profile.profilePicture}
                                                alt="Profile"
                                                className="h-12 w-12 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold ${isWorker ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {isWorker ? <FiUser /> : <FiBriefcase />}
                                            </div>
                                        )}
                                        <div>
                                            <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                                                {isWorker ? profile.fullName : profile.companyName}
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-500 capitalize">{user.role} Application</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
                                    >
                                        <FiX className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <Section title="Contact Info" icon={FiMail}>
                                            {profile.profilePicture && (
                                                <div className="mb-4 flex justify-center md:justify-start">
                                                    <img
                                                        src={profile.profilePicture}
                                                        alt="Profile"
                                                        className="h-20 w-20 rounded-xl object-cover border border-gray-100 shadow-sm"
                                                    />
                                                </div>
                                            )}
                                            <Field label="Email" value={user.email} />
                                            <Field label="Phone" value={isWorker ? profile.phone : profile.contactPerson?.phone} />
                                            {isWorker && <Field label="Location" value={profile.location} />}
                                            {!isWorker && (
                                                <Field
                                                    label="Address"
                                                    value={`${profile.address?.city}, ${profile.address?.country}`}
                                                />
                                            )}
                                        </Section>

                                        <Section title="Professional Links" icon={FiGlobe}>
                                            <Field label="LinkedIn" value={profile.linkedinProfile} href={profile.linkedinProfile} />
                                            {isWorker && <Field label="GitHub" value={profile.githubProfile} href={profile.githubProfile} />}
                                            {isWorker && <Field label="Twitter / X" value={profile.twitterProfile} href={profile.twitterProfile} />}

                                            {isWorker && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <button
                                                        onClick={() => setShowMoreLinks(!showMoreLinks)}
                                                        className="flex items-center gap-2 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                                    >
                                                        {showMoreLinks ? 'Show Less' : 'Show More Links'}
                                                        <FiChevronDown className={`w-3 h-3 transition-transform ${showMoreLinks ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {showMoreLinks && (
                                                        <div className="mt-3 space-y-3 animate-fade-in">
                                                            <Field label="Dribbble" value={profile.dribbbleProfile} href={profile.dribbbleProfile} />
                                                            <Field label="Behance" value={profile.behanceProfile} href={profile.behanceProfile} />
                                                            <Field label="Instagram" value={profile.instagramProfile} href={profile.instagramProfile} />
                                                            <Field label="StackOverflow" value={profile.stackoverflowProfile} href={profile.stackoverflowProfile} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Section>
                                    </div>

                                    {/* Main Content */}
                                    <Section title={isWorker ? "Bio & Skills" : "Company Details"} icon={FiBriefcase}>
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-500 font-medium mb-1">Description/Bio</p>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.bio || profile.description}</p>
                                        </div>

                                        {isWorker && profile.skills && (
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-500 font-medium mb-2">Skills</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.skills.map((skill, i) => (
                                                        <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {isWorker && profile.experience && profile.experience.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-xs text-gray-500 font-medium mb-2">Experience</p>
                                                <div className="space-y-3">
                                                    {profile.experience.map((exp, i) => (
                                                        <div key={i} className="bg-white p-3 rounded-lg border border-gray-100">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                                                                    <p className="text-xs text-gray-600">{exp.company}</p>
                                                                </div>
                                                                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                                    {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            {exp.description && (
                                                                <p className="text-xs text-gray-500 mt-2">{exp.description}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {!isWorker && (
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <Field label="Industry" value={profile.industry} />
                                                <Field label="Company Size" value={profile.companySize} />
                                                <Field label="Founded" value={profile.foundedYear} />
                                                <Field label="Registration No." value={profile.registrationNumber} />
                                            </div>
                                        )}
                                    </Section>

                                    {/* Preferences & Portfolio (Worker Only) */}
                                    {isWorker && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <Section title="Work Preferences" icon={FiCheck}>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium mb-1">Preferred Job Types</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {profile.preferredJobTypes?.map((type, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs capitalize">
                                                                    {type}
                                                                </span>
                                                            )) || <span className="text-sm text-gray-400">Not specified</span>}
                                                        </div>
                                                    </div>
                                                    <Field label="Willing to Relocate" value={profile.willingToRelocate ? 'Yes' : 'No'} />
                                                    {profile.hourlyRate && (
                                                        <Field
                                                            label="Hourly Rate"
                                                            value={`$${profile.hourlyRate}/hr`}
                                                        />
                                                    )}
                                                </div>
                                            </Section>

                                            <Section title="Portfolio" icon={FiGlobe}>
                                                {profile.portfolioLinks && profile.portfolioLinks.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {profile.portfolioLinks.map((link, i) => (
                                                            <a
                                                                key={i}
                                                                href={link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-sm text-primary-600 hover:underline bg-white p-2 rounded border border-gray-100"
                                                            >
                                                                <FiExternalLink className="w-3 h-3" />
                                                                <span className="truncate">{link}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">No portfolio links provided</p>
                                                )}
                                            </Section>
                                        </div>
                                    )}

                                    {/* Documents */}
                                    <Section title="Documents" icon={FiDownload}>
                                        {isWorker ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-red-50 text-red-600 rounded">
                                                            <FiDownload className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Resume</p>
                                                            <p className="text-xs text-gray-500">{profile.resume ? 'Uploaded' : 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                    {profile.resume && (
                                                        <a href={profile.resume} target="_blank" rel="noreferrer" className="text-sm text-primary-600 font-medium hover:underline">
                                                            View
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {profile.taxDocuments?.map((doc, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                                                <FiDownload className="w-4 h-4" />
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-900">Tax Document {i + 1}</p>
                                                        </div>
                                                        <a href={doc} target="_blank" rel="noreferrer" className="text-sm text-primary-600 font-medium hover:underline">
                                                            View
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Section>
                                </div>

                                {/* Footer Actions */}
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 sticky bottom-0 z-10">
                                    {!showRejectForm ? (
                                        <div className="flex justify-end gap-3">
                                            <Button variant="secondary" onClick={onClose}>
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => setShowRejectForm(true)}
                                                className="flex items-center gap-2"
                                            >
                                                <FiX className="w-4 h-4" />
                                                Reject Application
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={handleApprove}
                                                className="flex items-center gap-2"
                                            >
                                                <FiCheck className="w-4 h-4" />
                                                Approve Application
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="animate-fade-in">
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Reason for Rejection <span className="text-red-500">*</span>
                                                </label>
                                                <Textarea
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    placeholder="Please explain why the application is being rejected so the user can make corrections..."
                                                    rows={3}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <Button variant="secondary" onClick={() => setShowRejectForm(false)}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={handleRejectSubmit}
                                                    disabled={!rejectionReason.trim()}
                                                >
                                                    Confirm Rejection
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

UserApprovalModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    user: PropTypes.object,
    profile: PropTypes.object,
    onApprove: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired
};

export default UserApprovalModal;
