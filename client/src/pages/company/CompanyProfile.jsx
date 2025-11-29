import React, { useEffect, useState } from 'react';
import { companyAPI, uploadAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {
    FiEdit2, FiSave, FiX, FiTrash2, FiBriefcase, FiCheckCircle, FiStar,
    FiMapPin, FiGlobe, FiLinkedin, FiUsers, FiMail, FiPhone,
    FiCalendar, FiShield, FiVideo, FiFacebook, FiInstagram, FiTwitter, FiLink, FiAward
} from 'react-icons/fi';
import { SiGithub, SiCrunchbase, SiMedium, SiBehance, SiDribbble, SiProducthunt } from 'react-icons/si';
import { FaBuilding } from 'react-icons/fa'
import { toast } from '../../utils/toast';
import FileUpload from '../../components/common/FileUpload';
import { PageHeader, DeleteConfirmationModal, Select, Avatar } from '../../components/shared';
import { getCompanyBreadcrumbs } from '../../utils/breadcrumbUtils';
import useUndo from '../../hooks/useUndo';

const CompanyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadKey, setUploadKey] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');

    // Video Upload State
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);

    // Delete Modal State
    const [showDeleteLogoModal, setShowDeleteLogoModal] = useState(false);
    const { executeWithUndo } = useUndo();

    const [formData, setFormData] = useState({
        companyName: '',
        tagline: '',
        description: '',
        website: '',
        linkedinProfile: '',
        socialMedia: {
            twitter: '',
            facebook: '',
            instagram: ''
        },
        professionalLinks: [],
        foundedYear: '',
        registrationNumber: '',
        industry: '',
        companySize: '1-10',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
        },
        contactPerson: {
            name: '',
            position: '',
            email: '',
            phone: '',
        },
        companyVideo: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await companyAPI.getProfile();
            const profileData = response.data.data;
            setProfile(profileData);

            setFormData({
                companyName: profileData.companyName || '',
                tagline: profileData.tagline || '',
                description: profileData.description || '',
                website: profileData.website || '',
                linkedinProfile: profileData.linkedinProfile || '',
                socialMedia: profileData.socialMedia || {
                    twitter: '',
                    facebook: '',
                    instagram: ''
                },
                professionalLinks: profileData.professionalLinks || [],
                foundedYear: profileData.foundedYear || '',
                registrationNumber: profileData.registrationNumber || '',
                industry: profileData.industry || '',
                companySize: profileData.companySize || '1-10',
                address: profileData.address || {
                    street: '',
                    city: '',
                    state: '',
                    country: '',
                    zipCode: '',
                },
                contactPerson: profileData.contactPerson || {
                    name: '',
                    position: '',
                    email: '',
                    phone: '',
                },
                companyVideo: profileData.companyVideo || ''
            });
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (file) => {
        if (!file) return;

        setUploadingLogo(true);
        setUploadProgress(0);
        try {
            const response = await uploadAPI.uploadSingle(
                file,
                'logos',
                (progress) => setUploadProgress(progress)
            );
            const logoUrl = `http://localhost:5000${response.data.data.fileUrl}`;

            await companyAPI.updateProfile({ logo: logoUrl });
            toast.success('Logo updated!');
            fetchProfile();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to upload logo';
            toast.error(errorMessage);
        } finally {
            setUploadingLogo(false);
            setUploadProgress(0);
            setUploadKey(prev => prev + 1);
        }
    };

    const handleVideoUpload = async (file) => {
        if (!file) return;

        setUploadingVideo(true);
        setVideoUploadProgress(0);
        try {
            const response = await uploadAPI.uploadSingle(
                file,
                'videos',
                (progress) => setVideoUploadProgress(progress)
            );
            const videoUrl = `http://localhost:5000${response.data.data.fileUrl}`;

            // Update form data directly
            setFormData(prev => ({ ...prev, companyVideo: videoUrl }));
            toast.success('Video uploaded! Click Save to apply changes.');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to upload video';
            toast.error(errorMessage);
        } finally {
            setUploadingVideo(false);
            setVideoUploadProgress(0);
        }
    };

    const handleDeleteLogoClick = () => {
        setShowDeleteLogoModal(true);
    };

    const confirmDeleteLogo = () => {
        setShowDeleteLogoModal(false);
        const previousLogo = profile.logo;

        // Optimistic update
        setProfile(prev => ({ ...prev, logo: '' }));

        executeWithUndo({
            action: async () => {
                await companyAPI.updateProfile({ logo: '' });
                fetchProfile();
            },
            message: 'Company logo removed',
            onUndo: () => {
                setProfile(prev => ({ ...prev, logo: previousLogo }));
            },
            undoMessage: 'Company logo restored'
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSocialChange = (e) => {
        setFormData({
            ...formData,
            socialMedia: {
                ...formData.socialMedia,
                [e.target.name]: e.target.value
            }
        });
    };

    const handleAddressChange = (e) => {
        setFormData({
            ...formData,
            address: {
                ...formData.address,
                [e.target.name]: e.target.value,
            },
        });
    };

    const handleContactChange = (e) => {
        setFormData({
            ...formData,
            contactPerson: {
                ...formData.contactPerson,
                [e.target.name]: e.target.value,
            },
        });
    };

    const handleAddProfessionalLink = () => {
        setFormData({
            ...formData,
            professionalLinks: [...formData.professionalLinks, '']
        });
    };

    const handleProfessionalLinkChange = (index, value) => {
        const newLinks = [...formData.professionalLinks];
        newLinks[index] = value;
        setFormData({
            ...formData,
            professionalLinks: newLinks
        });
    };

    const handleRemoveProfessionalLink = (index) => {
        const newLinks = formData.professionalLinks.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            professionalLinks: newLinks
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await companyAPI.updateProfile(formData);
            toast.success('Profile updated successfully!');
            setEditing(false);
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-8">
                {/* Breadcrumbs */}
                <PageHeader
                    breadcrumbs={getCompanyBreadcrumbs('profile')}
                />

                {/* Modern Header Section - Minimalist */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Header Actions */}
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900">Company Profile</h1>
                        <div>
                            {!editing ? (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
                                >
                                    <FiEdit2 className="h-4 w-4" />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        <FiSave className="h-4 w-4" />
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            fetchProfile(); // Reset form data
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        <FiX className="h-4 w-4" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Company Logo */}
                            <div className="flex-shrink-0">
                                <div className="relative group">
                                    {editing ? (
                                        <FileUpload
                                            key={uploadKey}
                                            onFileSelect={handleLogoUpload}
                                            accept="image/*"
                                            isUploading={uploadingLogo}
                                            uploadProgress={uploadProgress}
                                            showProgress={true}
                                        >
                                            <div className="relative h-32 w-32 rounded-xl overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-all bg-white flex items-center justify-center group">
                                                <Avatar
                                                    src={profile?.logo}
                                                    name={profile?.companyName}
                                                    type="company"
                                                    size="custom"
                                                    className="h-full w-full object-cover"
                                                    shape="square"
                                                />

                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="text-white flex flex-col items-center gap-1">
                                                        <FiEdit2 className="h-5 w-5" />
                                                        <span className="text-xs font-medium">Change</span>
                                                    </div>
                                                </div>
                                                {uploadingLogo && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <Spinner size="sm" color="white" />
                                                    </div>
                                                )}
                                            </div>
                                        </FileUpload>
                                    ) : (
                                        <div className="relative h-32 w-32 rounded-xl overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center">
                                            <Avatar
                                                src={profile?.logo}
                                                name={profile?.companyName}
                                                type="company"
                                                size="custom"
                                                className="h-full w-full object-cover"
                                                shape="square"
                                            />
                                        </div>
                                    )}

                                    {/* Remove Button (Only in Edit Mode) */}
                                    {editing && profile?.logo && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteLogoClick(); }}
                                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-30"
                                            title="Remove Logo"
                                        >
                                            <FiTrash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Company Basic Info */}
                            <div className="flex-1 w-full space-y-4">
                                {editing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                                            <input
                                                type="text"
                                                name="tagline"
                                                value={formData.tagline}
                                                onChange={handleChange}
                                                placeholder="One-line description of your company"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile?.companyName}</h2>
                                        {profile?.tagline && <p className="text-gray-600">{profile.tagline}</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
                    {['overview', 'details'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-bold text-sm capitalize transition-all border-b-2 ${activeTab === tab
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <FiBriefcase className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jobs Posted</span>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900">{profile?.totalJobsPosted || 0}</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                            <FiCheckCircle className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</span>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900">{profile?.totalJobsCompleted || 0}</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                            <FiStar className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rating</span>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900">{profile?.averageRating?.toFixed(1) || '0.0'}</p>
                                </div>
                            </div>

                            {/* Description & Links */}
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-6">
                                    {/* About Company */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">About Company</h3>
                                        {editing ? (
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows="6"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                                placeholder="Tell us about your company..."
                                            />
                                        ) : (
                                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                {profile?.description || 'No description added yet.'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Company Video */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiVideo className="text-primary-600" /> Company Video
                                        </h3>
                                        {editing ? (
                                            <div className="space-y-4">
                                                <FileUpload
                                                    name="companyVideo"
                                                    accept="video/*"
                                                    value={formData.companyVideo}
                                                    onFileSelect={handleVideoUpload}
                                                    helperText="MP4, MOV (max 50MB). Keep it under 2 minutes."
                                                    maxSize={50}
                                                    isUploading={uploadingVideo}
                                                    uploadProgress={videoUploadProgress}
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                {profile?.companyVideo ? (
                                                    <video
                                                        src={profile.companyVideo}
                                                        controls
                                                        className="w-full rounded-xl max-h-[400px] bg-black"
                                                    />
                                                ) : (
                                                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                        <FiVideo className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                                        <p className="text-gray-500">No company video uploaded</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Online Presence */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Online Presence</h3>
                                    {editing ? (
                                        <div className="space-y-4">
                                            <Input
                                                label="Website"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                placeholder="https://yourcompany.com"
                                                icon={FiGlobe}
                                            />
                                            <Input
                                                label="LinkedIn"
                                                name="linkedinProfile"
                                                value={formData.linkedinProfile}
                                                onChange={handleChange}
                                                placeholder="https://linkedin.com/company/..."
                                                icon={FiLinkedin}
                                            />
                                            <div className="divider text-xs text-gray-400 uppercase tracking-wider font-bold my-2">Social Media</div>
                                            <Input
                                                label="Twitter"
                                                name="twitter"
                                                value={formData.socialMedia.twitter}
                                                onChange={handleSocialChange}
                                                placeholder="https://twitter.com/..."
                                                icon={FiTwitter}
                                            />
                                            <Input
                                                label="Facebook"
                                                name="facebook"
                                                value={formData.socialMedia.facebook}
                                                onChange={handleSocialChange}
                                                placeholder="https://facebook.com/..."
                                                icon={FiFacebook}
                                            />
                                            <Input
                                                label="Instagram"
                                                name="instagram"
                                                value={formData.socialMedia.instagram}
                                                onChange={handleSocialChange}
                                                placeholder="https://instagram.com/..."
                                                icon={FiInstagram}
                                            />

                                            <div className="divider text-xs text-gray-400 uppercase tracking-wider font-bold my-2">Professional Links</div>
                                            <div className="pt-6 mt-6 border-t border-gray-100">
                                                <div className="flex items-center justify-between mb-5">
                                                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Professional Links</h4>
                                                    <button
                                                        onClick={handleAddProfessionalLink}
                                                        className="flex items-center gap-2 text-xs font-semibold text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-all"
                                                    >
                                                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary-100 text-primary-600 text-xs">+</span>
                                                        Add Link
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    {formData.professionalLinks.map((link, index) => {
                                                        // Detect platform from URL
                                                        const getPlatformInfo = (url) => {
                                                            if (!url) return { icon: FiLink, color: 'gray', name: 'Link' };
                                                            const lowerUrl = url.toLowerCase();
                                                            if (lowerUrl.includes('github.com')) return { icon: SiGithub, color: 'purple', name: 'GitHub' };
                                                            if (lowerUrl.includes('crunchbase.com')) return { icon: SiCrunchbase, color: 'blue', name: 'Crunchbase' };
                                                            if (lowerUrl.includes('glassdoor.com')) return { icon: FiAward, color: 'green', name: 'Glassdoor' };
                                                            if (lowerUrl.includes('medium.com')) return { icon: SiMedium, color: 'gray', name: 'Medium' };
                                                            if (lowerUrl.includes('producthunt.com')) return { icon: SiProducthunt, color: 'orange', name: 'Product Hunt' };
                                                            if (lowerUrl.includes('behance.net')) return { icon: SiBehance, color: 'blue', name: 'Behance' };
                                                            if (lowerUrl.includes('dribbble.com')) return { icon: SiDribbble, color: 'pink', name: 'Dribbble' };
                                                            return { icon: FiGlobe, color: 'gray', name: 'Website' };
                                                        };

                                                        const platform = getPlatformInfo(link);
                                                        const Icon = platform.icon;

                                                        return (
                                                            <div key={index} className="group relative bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                                                                <div className="flex items-center gap-3 p-1">
                                                                    <div className={`flex-shrink-0 ml-1 p-2.5 bg-${platform.color}-50 text-${platform.color}-600 rounded-lg`}>
                                                                        <Icon className="h-4 w-4" />
                                                                    </div>
                                                                    <input
                                                                        type="url"
                                                                        value={link}
                                                                        onChange={(e) => handleProfessionalLinkChange(index, e.target.value)}
                                                                        placeholder="https://crunchbase.com/organization/your-company"
                                                                        className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-gray-700 placeholder:text-gray-400 py-2"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleRemoveProfessionalLink(index)}
                                                                        className="flex-shrink-0 mr-1 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                        title="Remove link"
                                                                    >
                                                                        <FiTrash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                    {formData.professionalLinks.length === 0 && (
                                                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                                                            <FiLink className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                                            <p className="text-sm text-gray-500">No professional links added yet</p>
                                                            <p className="text-xs text-gray-400 mt-1">Add links to Crunchbase, GitHub, Medium, etc.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {profile?.website && (
                                                <a
                                                    href={profile.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                                                >
                                                    <FiGlobe className="h-5 w-5" />
                                                    <span className="font-medium">Visit Website</span>
                                                </a>
                                            )}

                                            {profile?.linkedinProfile && (
                                                <a
                                                    href={profile.linkedinProfile}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                                                >
                                                    <FiLinkedin className="h-5 w-5" />
                                                    <span className="font-medium">LinkedIn</span>
                                                </a>
                                            )}

                                            {profile?.socialMedia?.twitter && (
                                                <a
                                                    href={profile.socialMedia.twitter}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-500 transition-colors"
                                                >
                                                    <FiTwitter className="h-5 w-5" />
                                                    <span className="font-medium">Twitter</span>
                                                </a>
                                            )}

                                            {profile?.socialMedia?.facebook && (
                                                <a
                                                    href={profile.socialMedia.facebook}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                                                >
                                                    <FiFacebook className="h-5 w-5" />
                                                    <span className="font-medium">Facebook</span>
                                                </a>
                                            )}

                                            {profile?.socialMedia?.instagram && (
                                                <a
                                                    href={profile.socialMedia.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 transition-colors"
                                                >
                                                    <FiInstagram className="h-5 w-5" />
                                                    <span className="font-medium">Instagram</span>
                                                </a>
                                            )}

                                            {profile?.professionalLinks?.length > 0 && (
                                                <div className="pt-6 border-t border-gray-100 mt-6">
                                                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Professional Links</h4>
                                                    <div className="space-y-2.5">
                                                        {profile.professionalLinks.map((link, idx) => {
                                                            const getDomainInfo = (url) => {
                                                                try {
                                                                    const urlObj = new URL(url);
                                                                    const hostname = urlObj.hostname.replace('www.', '');
                                                                    const domain = hostname.split('.')[0];

                                                                    const platforms = {
                                                                        'github': { color: 'purple', icon: SiGithub, label: 'GitHub' },
                                                                        'crunchbase': { color: 'blue', icon: SiCrunchbase, label: 'Crunchbase' },
                                                                        'glassdoor': { color: 'green', icon: FiAward, label: 'Glassdoor' },
                                                                        'medium': { color: 'gray', icon: SiMedium, label: 'Medium' },
                                                                        'producthunt': { color: 'orange', icon: SiProducthunt, label: 'Product Hunt' },
                                                                        'behance': { color: 'blue', icon: SiBehance, label: 'Behance' },
                                                                        'dribbble': { color: 'pink', icon: SiDribbble, label: 'Dribbble' },
                                                                    };

                                                                    const platform = platforms[domain] || { color: 'gray', icon: FiGlobe, label: domain.charAt(0).toUpperCase() + domain.slice(1) };
                                                                    return { ...platform, url: urlObj.href, hostname };
                                                                } catch {
                                                                    return { color: 'gray', icon: FiLink, label: 'Link', url: link, hostname: link };
                                                                }
                                                            };

                                                            const info = getDomainInfo(link);
                                                            const IconComponent = info.icon;

                                                            return (
                                                                <a
                                                                    key={idx}
                                                                    href={info.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`group flex items-center gap-3 p-3.5 rounded-xl bg-${info.color}-50 hover:bg-${info.color}-100 border border-${info.color}-100 hover:border-${info.color}-200 transition-all`}
                                                                >
                                                                    <div className={`flex-shrink-0 text-${info.color}-600`}>
                                                                        <IconComponent className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className={`font-semibold text-sm text-${info.color}-900 mb-0.5`}>{info.label}</p>
                                                                        <p className={`text-xs text-${info.color}-600 truncate`}>{info.hostname}</p>
                                                                    </div>
                                                                    <div className={`flex-shrink-0 text-${info.color}-400 group-hover:text-${info.color}-600 group-hover:translate-x-0.5 transition-all`}>
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                        </svg>
                                                                    </div>
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {!profile?.website && !profile?.linkedinProfile && !profile?.socialMedia?.twitter && !profile?.socialMedia?.facebook && !profile?.socialMedia?.instagram && (!profile?.professionalLinks || profile.professionalLinks.length === 0) && (
                                                <p className="text-sm text-gray-400">No online presence linked</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* General Details */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Company Information</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {editing ? (
                                        <>
                                            <Input
                                                label="Industry"
                                                name="industry"
                                                value={formData.industry}
                                                onChange={handleChange}
                                                placeholder="e.g., Technology, Finance"
                                                icon={FiBriefcase}
                                            />
                                            <div>
                                                <label className="label text-sm font-bold text-gray-700 mb-1 block">Company Size</label>
                                                <Select
                                                    name="companySize"
                                                    value={formData.companySize}
                                                    onChange={handleChange}
                                                    options={[
                                                        { value: "1-10", label: "1-10 employees" },
                                                        { value: "11-50", label: "11-50 employees" },
                                                        { value: "51-200", label: "51-200 employees" },
                                                        { value: "201-500", label: "201-500 employees" },
                                                        { value: "500+", label: "500+ employees" }
                                                    ]}
                                                />
                                            </div>
                                            <Input
                                                label="Founded Year"
                                                name="foundedYear"
                                                type="number"
                                                value={formData.foundedYear}
                                                onChange={handleChange}
                                                placeholder="2020"
                                                icon={FiCalendar}
                                            />
                                            <Input
                                                label="Registration Number"
                                                name="registrationNumber"
                                                value={formData.registrationNumber}
                                                onChange={handleChange}
                                                placeholder="Business Reg. No."
                                                icon={FiShield}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                                    <FiBriefcase className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Industry</p>
                                                    <p className="text-gray-900 font-medium">{profile?.industry || 'Not specified'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                    <FiUsers className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Size</p>
                                                    <p className="text-gray-900 font-medium">{profile?.companySize || 'Not specified'} employees</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                                    <FiCalendar className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Founded</p>
                                                    <p className="text-gray-900 font-medium">{profile?.foundedYear || 'Not specified'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                                    <FiShield className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Reg. No</p>
                                                    <p className="text-gray-900 font-medium">{profile?.registrationNumber || 'Not specified'}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Address & Contact */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Location</h3>
                                    {editing ? (
                                        <div className="space-y-4">
                                            <Input label="Street" name="street" value={formData.address.street} onChange={handleAddressChange} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="City" name="city" value={formData.address.city} onChange={handleAddressChange} />
                                                <Input label="State" name="state" value={formData.address.state} onChange={handleAddressChange} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Country" name="country" value={formData.address.country} onChange={handleAddressChange} />
                                                <Input label="Zip Code" name="zipCode" value={formData.address.zipCode} onChange={handleAddressChange} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg mt-1">
                                                <FiMapPin className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 leading-relaxed">
                                                    {profile?.address?.street && <>{profile.address.street}<br /></>}
                                                    {profile?.address?.city && <>{profile.address.city}, </>}
                                                    {profile?.address?.state && <>{profile.address.state} </>}
                                                    {profile?.address?.zipCode && <>{profile.address.zipCode}<br /></>}
                                                    {profile?.address?.country && <span className="font-bold">{profile.address.country}</span>}
                                                </p>
                                                {!profile?.address?.street && !profile?.address?.city && <p className="text-gray-400 italic">No address provided</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Contact Person</h3>
                                    {editing ? (
                                        <div className="space-y-4">
                                            <Input label="Name" name="name" value={formData.contactPerson.name} onChange={handleContactChange} />
                                            <Input label="Position" name="position" value={formData.contactPerson.position} onChange={handleContactChange} />
                                            <Input label="Email" name="email" value={formData.contactPerson.email} onChange={handleContactChange} />
                                            <Input label="Phone" name="phone" value={formData.contactPerson.phone} onChange={handleContactChange} />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                    {profile?.contactPerson?.name ? profile.contactPerson.name.charAt(0) : '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{profile?.contactPerson?.name || 'Not specified'}</p>
                                                    <p className="text-sm text-gray-500">{profile?.contactPerson?.position}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                                {profile?.contactPerson?.email && (
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        <FiMail className="h-4 w-4" /> {profile.contactPerson.email}
                                                    </div>
                                                )}
                                                {profile?.contactPerson?.phone && (
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        <FiPhone className="h-4 w-4" /> {profile.contactPerson.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={showDeleteLogoModal}
                    onClose={() => setShowDeleteLogoModal(false)}
                    onConfirm={confirmDeleteLogo}
                    itemName="Company Logo"
                    itemType="image"
                />
            </div>
        </DashboardLayout>
    );
};

export default CompanyProfile;