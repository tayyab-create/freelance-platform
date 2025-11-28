import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiX, FiCheck, FiAlertTriangle, FiUser, FiBriefcase, FiMapPin, FiGlobe, FiPhone, FiMail, FiCalendar, FiDownload, FiExternalLink } from 'react-icons/fi';
import Button from '../common/Button';
import Textarea from '../common/Textarea';

const UserApprovalModal = ({ isOpen, onClose, user, profile, onApprove, onReject }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

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

    const Section = ({ title, icon: Icon, children }) => (
        <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                {title}
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                {children}
            </div>
        </div>
    );

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
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold ${isWorker ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {isWorker ? <FiUser /> : <FiBriefcase />}
                                        </div>
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
                                            <Field label="Website" value={profile.website} href={profile.website} />
                                            <Field label="LinkedIn" value={profile.linkedinProfile} href={profile.linkedinProfile} />
                                            {isWorker && <Field label="GitHub" value={profile.githubProfile} href={profile.githubProfile} />}
                                        </Section>
                                    </div>

                                    {/* Main Content */}
                                    <Section title={isWorker ? "Bio & Skills" : "Company Details"} icon={FiBriefcase}>
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-500 font-medium mb-1">Description/Bio</p>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.bio || profile.description}</p>
                                        </div>

                                        {isWorker && profile.skills && (
                                            <div>
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

                                        {!isWorker && (
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <Field label="Industry" value={profile.industry} />
                                                <Field label="Company Size" value={profile.companySize} />
                                                <Field label="Founded" value={profile.foundedYear} />
                                                <Field label="Registration No." value={profile.registrationNumber} />
                                            </div>
                                        )}
                                    </Section>

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
