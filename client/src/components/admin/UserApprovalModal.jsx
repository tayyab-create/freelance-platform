import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiX, FiCheck, FiUser, FiBriefcase, FiGlobe, FiMail, FiDownload, FiExternalLink, FiChevronDown, FiVideo, FiPhone, FiMapPin, FiCalendar, FiFileText, FiUsers, FiTrendingUp, FiHash } from 'react-icons/fi';
import { FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaGithub, FaBehance, FaDribbble, FaCodepen, FaMedium, FaYoutube, FaStackOverflow } from 'react-icons/fa';
import { SiCrunchbase, SiGlassdoor } from 'react-icons/si';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import ExpandableText from '../shared/ExpandableText';

const UserApprovalModal = ({ isOpen, onClose, user, profile, onApprove, onReject }) => {
    const [rejectionReason, setRejectionReason] = useState('');

    // Helper function to get icon and color for portfolio links
    const getPortfolioIcon = (url) => {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('github.com')) return { icon: FaGithub, color: 'text-gray-800' };
        if (lowerUrl.includes('behance.net')) return { icon: FaBehance, color: 'text-blue-500' };
        if (lowerUrl.includes('dribbble.com')) return { icon: FaDribbble, color: 'text-pink-500' };
        if (lowerUrl.includes('codepen.io')) return { icon: FaCodepen, color: 'text-gray-700' };
        if (lowerUrl.includes('linkedin.com')) return { icon: FaLinkedin, color: 'text-blue-600' };
        return { icon: FiExternalLink, color: 'text-primary-600' };
    };

    // Helper function to get icon for professional links
    const getProfessionalIcon = (url) => {
        const lower = url.toLowerCase();
        if (lower.includes('crunchbase.com')) return { icon: SiCrunchbase, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Crunchbase' };
        if (lower.includes('glassdoor.com')) return { icon: SiGlassdoor, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Glassdoor' };
        if (lower.includes('github.com')) return { icon: FaGithub, color: 'text-gray-700', bgColor: 'bg-gray-100', label: 'GitHub' };
        if (lower.includes('medium.com')) return { icon: FaMedium, color: 'text-gray-800', bgColor: 'bg-gray-100', label: 'Medium' };
        if (lower.includes('youtube.com')) return { icon: FaYoutube, color: 'text-red-600', bgColor: 'bg-red-50', label: 'YouTube' };
        if (lower.includes('behance.net')) return { icon: FaBehance, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Behance' };
        if (lower.includes('dribbble.com')) return { icon: FaDribbble, color: 'text-pink-600', bgColor: 'bg-pink-50', label: 'Dribbble' };
        return { icon: FiExternalLink, color: 'text-gray-600', bgColor: 'bg-gray-50', label: 'Website' };
    };
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [showMoreLinks, setShowMoreLinks] = useState(false);
    const [showAllDocs, setShowAllDocs] = useState(false);

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

    const Field = ({ label, value, href, icon: Icon }) => (
        <div className="mb-3 last:mb-0">
            <p className="text-xs text-gray-500 font-medium mb-0.5 flex items-center gap-1">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </p>
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
                                        {isWorker ? (
                                            profile.profilePicture ? (
                                                <img
                                                    src={profile.profilePicture}
                                                    alt="Profile"
                                                    className="h-12 w-12 rounded-xl object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold bg-purple-100 text-purple-600">
                                                    <FiUser />
                                                </div>
                                            )
                                        ) : (
                                            profile.logo ? (
                                                <img
                                                    src={profile.logo}
                                                    alt="Company Logo"
                                                    className="h-12 w-12 rounded-xl object-cover bg-white border border-gray-200"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold bg-blue-100 text-blue-600">
                                                    <FiBriefcase />
                                                </div>
                                            )
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
                                            {!isWorker && profile.logo && (
                                                <div className="mb-4 flex justify-center md:justify-start">
                                                    <img
                                                        src={profile.logo}
                                                        alt="Company Logo"
                                                        className="h-20 w-20 rounded-xl object-cover bg-white border border-gray-200 shadow-sm"
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
                                            <div className="space-y-2">
                                                {/* Website */}
                                                {profile.website && (
                                                    <a
                                                        href={profile.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                    >
                                                        <div className="p-1.5 rounded-md bg-gray-100">
                                                            <FiGlobe className="w-3.5 h-3.5 text-gray-600" />
                                                        </div>
                                                        <span className="truncate font-medium">Website / Portfolio</span>
                                                    </a>
                                                )}

                                                {/* LinkedIn */}
                                                {profile.linkedinProfile && (
                                                    <a
                                                        href={profile.linkedinProfile}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                    >
                                                        <div className="p-1.5 rounded-md bg-blue-50">
                                                            <FaLinkedin className="w-3.5 h-3.5 text-blue-600" />
                                                        </div>
                                                        <span className="truncate font-medium">LinkedIn</span>
                                                    </a>
                                                )}

                                                {/* Additional Professional Links (Company) */}
                                                {/* Additional Professional Links (Company) */}
                                                {profile.professionalLinks && profile.professionalLinks.length > 0 && (
                                                    <>
                                                        {profile.professionalLinks.slice(0, showMoreLinks ? undefined : 3).map((link, i) => {
                                                            const { icon: Icon, color, bgColor, label } = getProfessionalIcon(link);
                                                            return (
                                                                <a
                                                                    key={i}
                                                                    href={link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                                >
                                                                    <div className={`p-1.5 rounded-md ${bgColor}`}>
                                                                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                                                                    </div>
                                                                    <span className="truncate font-medium">{label}</span>
                                                                </a>
                                                            );
                                                        })}

                                                        {profile.professionalLinks.length > 3 && (
                                                            <button
                                                                onClick={() => setShowMoreLinks(!showMoreLinks)}
                                                                className="w-full py-2 text-sm text-primary-600 font-medium hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                {showMoreLinks ? 'Show Less' : 'Show More Links'}
                                                                <FiChevronDown className={`w-4 h-4 transition-transform ${showMoreLinks ? 'rotate-180' : ''}`} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                {/* GitHub */}
                                                {profile.githubProfile && (
                                                    <a
                                                        href={profile.githubProfile}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                    >
                                                        <div className="p-1.5 rounded-md bg-gray-100">
                                                            <FaGithub className="w-3.5 h-3.5 text-gray-700" />
                                                        </div>
                                                        <span className="truncate font-medium">GitHub</span>
                                                    </a>
                                                )}

                                                {/* Twitter / X */}
                                                {profile.twitterProfile && (
                                                    <a
                                                        href={profile.twitterProfile}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                    >
                                                        <div className="p-1.5 rounded-md bg-sky-50">
                                                            <FaTwitter className="w-3.5 h-3.5 text-sky-500" />
                                                        </div>
                                                        <span className="truncate font-medium">Twitter / X</span>
                                                    </a>
                                                )}

                                                {/* Show More/Less for additional links */}
                                                {(profile.dribbbleProfile || profile.behanceProfile || profile.instagramProfile || profile.stackoverflowProfile) && (
                                                    <>
                                                        {showMoreLinks && (
                                                            <>
                                                                {/* Dribbble */}
                                                                {profile.dribbbleProfile && (
                                                                    <a
                                                                        href={profile.dribbbleProfile}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                                    >
                                                                        <div className="p-1.5 rounded-md bg-pink-50">
                                                                            <FaDribbble className="w-3.5 h-3.5 text-pink-500" />
                                                                        </div>
                                                                        <span className="truncate font-medium">Dribbble</span>
                                                                    </a>
                                                                )}

                                                                {/* Behance */}
                                                                {profile.behanceProfile && (
                                                                    <a
                                                                        href={profile.behanceProfile}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                                    >
                                                                        <div className="p-1.5 rounded-md bg-blue-50">
                                                                            <FaBehance className="w-3.5 h-3.5 text-blue-500" />
                                                                        </div>
                                                                        <span className="truncate font-medium">Behance</span>
                                                                    </a>
                                                                )}

                                                                {/* Instagram */}
                                                                {profile.instagramProfile && (
                                                                    <a
                                                                        href={profile.instagramProfile}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                                    >
                                                                        <div className="p-1.5 rounded-md bg-pink-50">
                                                                            <FaInstagram className="w-3.5 h-3.5 text-pink-600" />
                                                                        </div>
                                                                        <span className="truncate font-medium">Instagram</span>
                                                                    </a>
                                                                )}

                                                                {/* StackOverflow */}
                                                                {profile.stackoverflowProfile && (
                                                                    <a
                                                                        href={profile.stackoverflowProfile}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                                    >
                                                                        <div className="p-1.5 rounded-md bg-orange-50">
                                                                            <FaStackOverflow className="w-3.5 h-3.5 text-orange-500" />
                                                                        </div>
                                                                        <span className="truncate font-medium">StackOverflow</span>
                                                                    </a>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* Toggle Button */}
                                                        <button
                                                            onClick={() => setShowMoreLinks(!showMoreLinks)}
                                                            className="w-full py-2 text-sm text-primary-600 font-medium hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            {showMoreLinks ? 'Show Less' : 'Show More Links'}
                                                            <FiChevronDown className={`w-4 h-4 transition-transform ${showMoreLinks ? 'rotate-180' : ''}`} />
                                                        </button>
                                                    </>
                                                )}

                                                {/* No links message */}
                                                {!profile.website && !profile.linkedinProfile && !profile.githubProfile && !profile.twitterProfile && !profile.dribbbleProfile && !profile.behanceProfile && !profile.instagramProfile && !profile.stackoverflowProfile && (
                                                    <p className="text-sm text-gray-500 italic">No professional links provided</p>
                                                )}
                                            </div>
                                        </Section>
                                    </div>

                                    {/* Main Content */}
                                    <Section title={isWorker ? "Bio & Skills" : "Company Details"} icon={FiBriefcase}>
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-500 font-medium mb-1">Description/Bio</p>
                                            <ExpandableText
                                                text={profile.bio || profile.description}
                                                limit={500}
                                                textClassName="text-sm text-gray-700"
                                            />
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
                                                                <ExpandableText
                                                                    text={exp.description}
                                                                    limit={250}
                                                                    className="mt-2"
                                                                    textClassName="text-xs text-gray-500"
                                                                />
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

                                    {/* Contact Person (Company Only) */}
                                    {!isWorker && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <Section title="Primary Contact Person" icon={FiUser}>
                                                <div className="space-y-3">
                                                    <Field label="Name" value={profile.contactPerson?.name} />
                                                    <Field label="Position" value={profile.contactPerson?.position} />
                                                    <Field label="Email" value={profile.contactPerson?.email} />
                                                    <Field label="Phone" value={profile.contactPerson?.phone} />
                                                </div>
                                            </Section>

                                            {/* Social Media (Company Only) */}
                                            <Section title="Social Media" icon={FiGlobe}>
                                                {(profile.linkedinProfile || profile.socialMedia?.linkedin || profile.socialMedia?.twitter || profile.socialMedia?.facebook || profile.socialMedia?.instagram) ? (
                                                    <div className="space-y-2">
                                                        {profile.linkedinProfile && (
                                                            <a
                                                                href={profile.linkedinProfile}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                            >
                                                                <div className="p-1.5 rounded-md bg-blue-50">
                                                                    <FaLinkedin className="w-3.5 h-3.5 text-blue-600" />
                                                                </div>
                                                                <span className="truncate font-medium">LinkedIn</span>
                                                            </a>
                                                        )}
                                                        {profile.socialMedia?.linkedin && (
                                                            <a
                                                                href={profile.socialMedia.linkedin}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                            >
                                                                <div className="p-1.5 rounded-md bg-blue-50">
                                                                    <FaLinkedin className="w-3.5 h-3.5 text-blue-600" />
                                                                </div>
                                                                <span className="truncate font-medium">LinkedIn</span>
                                                            </a>
                                                        )}
                                                        {profile.socialMedia?.twitter && (
                                                            <a
                                                                href={profile.socialMedia.twitter}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                            >
                                                                <div className="p-1.5 rounded-md bg-sky-50">
                                                                    <FaTwitter className="w-3.5 h-3.5 text-sky-500" />
                                                                </div>
                                                                <span className="truncate font-medium">Twitter</span>
                                                            </a>
                                                        )}
                                                        {profile.socialMedia?.facebook && (
                                                            <a
                                                                href={profile.socialMedia.facebook}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                            >
                                                                <div className="p-1.5 rounded-md bg-blue-50">
                                                                    <FaFacebook className="w-3.5 h-3.5 text-blue-600" />
                                                                </div>
                                                                <span className="truncate font-medium">Facebook</span>
                                                            </a>
                                                        )}
                                                        {profile.socialMedia?.instagram && (
                                                            <a
                                                                href={profile.socialMedia.instagram}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                            >
                                                                <div className="p-1.5 rounded-md bg-pink-50">
                                                                    <FaInstagram className="w-3.5 h-3.5 text-pink-600" />
                                                                </div>
                                                                <span className="truncate font-medium">Instagram</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">No social media links provided</p>
                                                )}
                                            </Section>


                                        </div>
                                    )}

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
                                                        {profile.portfolioLinks.map((link, i) => {
                                                            const { icon: Icon, color } = getPortfolioIcon(link);
                                                            // Map color to background color
                                                            const bgColorMap = {
                                                                'text-gray-800': 'bg-gray-100',
                                                                'text-blue-500': 'bg-blue-50',
                                                                'text-pink-500': 'bg-pink-50',
                                                                'text-gray-700': 'bg-gray-100',
                                                                'text-blue-600': 'bg-blue-50',
                                                                'text-primary-600': 'bg-gray-50'
                                                            };
                                                            const bgColor = bgColorMap[color] || 'bg-gray-50';
                                                            return (
                                                                <a
                                                                    key={i}
                                                                    href={link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                                >
                                                                    <div className={`p-1.5 rounded-md ${bgColor}`}>
                                                                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                                                                    </div>
                                                                    <span className="truncate font-medium">{link}</span>
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">No portfolio links provided</p>
                                                )}
                                            </Section>
                                        </div>
                                    )}

                                    {/* Tax Documents */}
                                    <Section title={isWorker ? "Documents" : "Tax Documents"} icon={FiDownload}>
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
                                                {profile.taxDocuments?.slice(0, showAllDocs ? undefined : 3).map((doc, i) => {
                                                    // Extract filename from URL
                                                    const getFileName = (url) => {
                                                        try {
                                                            const urlParts = url.split('/');
                                                            const fileName = urlParts[urlParts.length - 1];
                                                            // Decode URL encoding
                                                            const decoded = decodeURIComponent(fileName);
                                                            // Remove timestamp prefix if exists (e.g., "1234567890-document.pdf" -> "document.pdf")
                                                            const withoutTimestamp = decoded.replace(/^\d+-/, '');
                                                            return withoutTimestamp;
                                                        } catch (e) {
                                                            return `Tax Document ${i + 1}`;
                                                        }
                                                    };

                                                    const fileName = getFileName(doc);
                                                    const trimmedName = fileName.length > 30 ? fileName.substring(0, 27) + '...' : fileName;

                                                    return (
                                                        <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                                                    <FiDownload className="w-4 h-4" />
                                                                </div>
                                                                <p className="text-sm font-medium text-gray-900 truncate" title={fileName}>
                                                                    {trimmedName}
                                                                </p>
                                                            </div>
                                                            <a href={doc} target="_blank" rel="noreferrer" className="text-sm text-primary-600 font-medium hover:underline flex-shrink-0 ml-2">
                                                                View
                                                            </a>
                                                        </div>
                                                    );
                                                })}

                                                {/* Show More/Less Button */}
                                                {profile.taxDocuments?.length > 3 && (
                                                    <button
                                                        onClick={() => setShowAllDocs(!showAllDocs)}
                                                        className="w-full py-2 text-sm text-primary-600 font-medium hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        {showAllDocs ? (
                                                            <>
                                                                Show Less
                                                                <FiChevronDown className="w-4 h-4 rotate-180 transition-transform" />
                                                            </>
                                                        ) : (
                                                            <>
                                                                Show {profile.taxDocuments.length - 3} More
                                                                <FiChevronDown className="w-4 h-4 transition-transform" />
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </Section>

                                    {/* Company Video (Company Only) */}
                                    {!isWorker && profile.companyVideo && (
                                        <Section title="Company Video" icon={FiGlobe}>
                                            <div className="space-y-2">
                                                <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center">
                                                            <FiVideo className="h-5 w-5 text-primary-600" />
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-900">Company Video</p>
                                                    </div>
                                                    <a href={profile.companyVideo} target="_blank" rel="noreferrer" className="text-sm text-primary-600 font-medium hover:underline">
                                                        View
                                                    </a>
                                                </div>
                                            </div>
                                        </Section>
                                    )}
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
                    </div >
                </div >
            </Dialog >
        </Transition >
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
