import React, { useEffect, useState } from 'react';
import { companyAPI, uploadAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import Input from '../../components/common/Input';
import {
    FiEdit2, FiSave, FiX, FiTrash2, FiBriefcase, FiCheckCircle, FiStar,
    FiMapPin, FiGlobe, FiLinkedin, FiUsers, FiMail, FiPhone,
    FiCalendar, FiShield, FiVideo, FiFacebook, FiInstagram, FiTwitter, FiLink, FiAward,
    FiMessageSquare, FiPlayCircle, FiExternalLink, FiFileText, FiShare2
} from 'react-icons/fi';
import { SiGithub, SiCrunchbase, SiMedium, SiBehance, SiDribbble, SiProducthunt } from 'react-icons/si';
import { FaBuilding } from 'react-icons/fa'
import { toast } from '../../utils/toast';
import FileUpload from '../../components/common/FileUpload';
import { PageHeader, DeleteConfirmationModal, Select, Avatar, CustomVideoPlayer } from '../../components/shared';
import { getCompanyBreadcrumbs } from '../../utils/breadcrumbUtils';
import useUndo from '../../hooks/useUndo';
import InfoCard from '../../components/company/InfoCard';
import ContactCard from '../../components/company/ContactCard';
import LocationCard from '../../components/company/LocationCard';
import DocumentList from '../../components/company/DocumentList';

// Helper function to get platform icon from URL
const getPlatformIcon = (url) => {
    if (!url) return FiLink;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('crunchbase')) return SiCrunchbase;
    if (lowerUrl.includes('github')) return SiGithub;
    if (lowerUrl.includes('medium')) return SiMedium;
    if (lowerUrl.includes('behance')) return SiBehance;
    if (lowerUrl.includes('dribbble')) return SiDribbble;
    if (lowerUrl.includes('producthunt')) return SiProducthunt;
    if (lowerUrl.includes('youtube')) return FiPlayCircle;
    return FiLink;
};

const CompanyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadKey, setUploadKey] = useState(0);

    // Video Upload State
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);

    // Tax Doc Upload State
    const [uploadingTaxDoc, setUploadingTaxDoc] = useState(false);
    const [taxDocUploadProgress, setTaxDocUploadProgress] = useState(0);

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
        companyVideo: '',
        benefits: [],
        taxDocuments: []
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
                companyVideo: profileData.companyVideo || '',
                benefits: profileData.benefits || [],
                taxDocuments: profileData.taxDocuments || []
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

    const handleTaxDocUpload = async (file) => {
        if (!file) return;

        setUploadingTaxDoc(true);
        setTaxDocUploadProgress(0);
        try {
            const response = await uploadAPI.uploadSingle(
                file,
                'documents',
                (progress) => setTaxDocUploadProgress(progress)
            );
            const docUrl = `http://localhost:5000${response.data.data.fileUrl}`;

            setFormData(prev => ({
                ...prev,
                taxDocuments: [...prev.taxDocuments, docUrl]
            }));
            toast.success('Document uploaded! Click Save to apply changes.');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to upload document';
            toast.error(errorMessage);
        } finally {
            setUploadingTaxDoc(false);
            setTaxDocUploadProgress(0);
        }
    };

    const handleRemoveTaxDoc = (index) => {
        setFormData(prev => ({
            ...prev,
            taxDocuments: prev.taxDocuments.filter((_, i) => i !== index)
        }));
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
            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                {/* Breadcrumbs */}
                <PageHeader
                    breadcrumbs={getCompanyBreadcrumbs('profile')}
                />

                {/* HEADER CARD */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Logo */}
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
                                    <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 p-2 shrink-0 cursor-pointer hover:border-slate-300 transition-all flex items-center justify-center overflow-hidden">
                                        {profile?.logo ? (
                                            <img
                                                src={profile.logo}
                                                alt={profile.companyName}
                                                className="max-w-full max-h-full rounded-xl object-contain"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                                {profile?.companyName?.charAt(0) || 'C'}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                            <div className="text-center text-white">
                                                <FiEdit2 className="h-5 w-5 mx-auto mb-1" />
                                                <span className="text-xs font-medium">Change</span>
                                            </div>
                                        </div>
                                    </div>
                                </FileUpload>
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                                    {profile?.logo ? (
                                        <img
                                            src={profile.logo}
                                            alt={profile.companyName}
                                            className="max-w-full max-h-full rounded-xl object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                            {profile?.companyName?.charAt(0) || 'C'}
                                        </div>
                                    )}
                                </div>
                            )}
                            {editing && profile?.logo && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteLogoClick(); }}
                                    className="absolute -top-1 -right-1 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-30"
                                    title="Remove Logo"
                                >
                                    <FiTrash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 mb-2 w-full">
                            {editing ? (
                                <div className="space-y-4 mb-4">
                                    <Input
                                        label="Company Name"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Tech Innovations Ltd."
                                    />
                                    <Input
                                        label="Tagline"
                                        name="tagline"
                                        value={formData.tagline}
                                        onChange={handleChange}
                                        placeholder="Building the future of digital infrastructure"
                                    />
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                        <h1 className="text-2xl font-bold text-slate-900">{profile?.companyName}</h1>
                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100 w-fit">
                                            Verified Company
                                        </span>
                                    </div>
                                    {profile?.tagline && (
                                        <p className="text-slate-600 mb-4 text-sm max-w-2xl leading-relaxed">{profile.tagline}</p>
                                    )}
                                </div>
                            )}

                            {/* Meta Links */}
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                                    <FiMapPin className="w-4 h-4" />
                                    <span>
                                        {profile?.address?.city && profile?.address?.country
                                            ? `${profile.address.city}, ${profile.address.country}`
                                            : 'Location not set'}
                                    </span>
                                </div>
                                {profile?.website && (
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                                        <FiGlobe className="w-4 h-4" />
                                        <span>Website</span>
                                    </a>
                                )}
                                <div className="flex gap-3 pl-2 border-l border-slate-200 ml-1">
                                    {profile?.linkedinProfile && (
                                        <a href={profile.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                                            <FiLinkedin className="w-4 h-4" />
                                        </a>
                                    )}
                                    {profile?.socialMedia?.twitter && (
                                        <a href={profile.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">
                                            <FiTwitter className="w-4 h-4" />
                                        </a>
                                    )}
                                    {profile?.socialMedia?.facebook && (
                                        <a href={profile.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-800 transition-colors">
                                            <FiFacebook className="w-4 h-4" />
                                        </a>
                                    )}
                                    {profile?.socialMedia?.instagram && (
                                        <a href={profile.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors">
                                            <FiInstagram className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <FiEdit2 className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Stat 1 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <FiBriefcase className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-slate-900">{profile?.totalJobsPosted || 0}</span>
                            <p className="text-xs text-slate-500 font-medium mt-1">Total Jobs</p>
                        </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                <FiCheckCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-slate-900">{profile?.totalJobsCompleted || 0}</span>
                            <p className="text-xs text-slate-500 font-medium mt-1">Completed</p>
                        </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-amber-50 text-amber-500">
                                <FiStar className="w-5 h-5" />
                            </div>
                            <span className="text-xs text-slate-400 font-medium">Average</span>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-slate-900">{profile?.averageRating?.toFixed(1) || '0.0'}</span>
                            <span className="text-sm text-slate-400 font-normal"> / 5.0</span>
                            <p className="text-xs text-slate-500 font-medium mt-1">Rating</p>
                        </div>
                    </div>

                    {/* Stat 4 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <FiMessageSquare className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-slate-900">{profile?.totalReviews || 0}</span>
                            <p className="text-xs text-slate-500 font-medium mt-1">Reviews</p>
                        </div>
                    </div>
                </div>

                {/* CONTENT COLUMNS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN (Main Info) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* About Section */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FiBriefcase className="text-blue-600" />
                                About Company
                            </h2>
                            {editing ? (
                                <Textarea
                                    label="Company Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="Tell the world about your company, mission, values, and what makes you unique..."
                                    helperText="This will be displayed publicly on your company profile"
                                />
                            ) : (
                                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                    {profile?.description || 'No description added yet.'}
                                </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {editing ? (
                                    <>
                                        <div>
                                            <Input
                                                label="Industry"
                                                name="industry"
                                                value={formData.industry}
                                                onChange={handleChange}
                                                placeholder="Information Technology"
                                            />
                                        </div>
                                        <div>
                                            <Select
                                                label="Company Size"
                                                name="companySize"
                                                value={formData.companySize}
                                                onChange={handleChange}
                                                options={[
                                                    { value: '1-10', label: '1-10 Employees' },
                                                    { value: '11-50', label: '11-50 Employees' },
                                                    { value: '51-200', label: '51-200 Employees' },
                                                    { value: '201-500', label: '201-500 Employees' },
                                                    { value: '500+', label: '500+ Employees' }
                                                ]}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                label="Founded Year"
                                                name="foundedYear"
                                                value={formData.foundedYear}
                                                onChange={handleChange}
                                                placeholder="2015"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                label="Registration Number"
                                                name="registrationNumber"
                                                value={formData.registrationNumber}
                                                onChange={handleChange}
                                                placeholder="REG-2015-8899"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <InfoCard icon={FaBuilding} label="Industry" value={profile?.industry || 'Not set'} />
                                        <InfoCard icon={FiUsers} label="Company Size" value={profile?.companySize || 'Not set'} />
                                        <InfoCard icon={FiCalendar} label="Founded" value={profile?.foundedYear || 'Not set'} />
                                        <InfoCard icon={FiFileText} label="Reg. Number" value={profile?.registrationNumber || 'Not set'} />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Video Section */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FiVideo className="text-orange-600" />
                                Company Video
                            </h2>
                            {editing ? (
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
                            ) : (
                                <>
                                    {profile?.companyVideo ? (
                                        <CustomVideoPlayer
                                            src={profile.companyVideo}
                                            className="w-full aspect-video rounded-xl shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center border border-dashed border-slate-300 group cursor-pointer hover:bg-slate-50 transition-colors">
                                            <div className="text-center">
                                                <FiPlayCircle className="w-12 h-12 text-slate-300 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                                                <p className="text-sm text-slate-500 font-medium">No video uploaded</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Social Media Section - Edit Mode Only */}
                        {editing && (
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <FiShare2 className="text-blue-600" />
                                    Social Media
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                </div>
                            </div>
                        )}

                        {/* Tax Documents Section */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FiFileText className="text-amber-600" />
                                Tax Documents
                            </h2>
                            {editing ? (
                                <div className="space-y-4">
                                    {formData.taxDocuments.length > 0 && (
                                        <div className="space-y-2">
                                            {formData.taxDocuments.map((doc, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <FiFileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                                        <span className="text-sm text-slate-600 truncate">
                                                            {doc.split('/').pop()}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveTaxDoc(idx)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove document"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <FileUpload
                                        name="taxDocuments"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onFileSelect={handleTaxDocUpload}
                                        helperText="PDF, DOC, Images (max 10MB)"
                                        maxSize={10}
                                        isUploading={uploadingTaxDoc}
                                        uploadProgress={taxDocUploadProgress}
                                        placeholder="Click to upload tax documents"
                                    />
                                </div>
                            ) : (
                                <DocumentList documents={profile?.taxDocuments} />
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Sidebar Info) */}
                    <div className="space-y-6">

                        {/* Contact Person Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FiUsers className="text-purple-600" />
                                Point of Contact
                            </h3>
                            <ContactCard
                                contactPerson={editing ? formData.contactPerson : profile?.contactPerson}
                                editing={editing}
                                onChange={handleContactChange}
                                Input={Input}
                            />
                        </div>

                        {/* Location Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FiMapPin className="text-green-600" />
                                Office Location
                            </h3>
                            <LocationCard
                                address={editing ? formData.address : profile?.address}
                                editing={editing}
                                onChange={handleAddressChange}
                                Input={Input}
                            />
                        </div>

                        {/* Professional Links */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-4">Professional Links</h3>
                            {editing ? (
                                <div className="space-y-3">
                                    <Input
                                        label="Website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://yourcompany.com"
                                    />
                                    <Input
                                        label="LinkedIn"
                                        name="linkedinProfile"
                                        value={formData.linkedinProfile}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/company/..."
                                    />
                                    <div className="pt-2">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Other Links</label>
                                            <button
                                                onClick={handleAddProfessionalLink}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                                            >
                                                + Add Link
                                            </button>
                                        </div>
                                        {formData.professionalLinks.map((link, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <input
                                                    type="url"
                                                    value={link}
                                                    onChange={(e) => handleProfessionalLinkChange(index, e.target.value)}
                                                    placeholder="https://crunchbase.com/..."
                                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={() => handleRemoveProfessionalLink(index)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {profile?.professionalLinks?.length > 0 ? (
                                        profile.professionalLinks.map((link, idx) => {
                                            const getDomainName = (url) => {
                                                try {
                                                    const urlObj = new URL(url);
                                                    return urlObj.hostname.replace('www.', '');
                                                } catch {
                                                    return 'Link';
                                                }
                                            };

                                            const PlatformIcon = getPlatformIcon(link);

                                            return (
                                                <a
                                                    key={idx}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between text-sm text-slate-600 hover:text-blue-600 p-2 hover:bg-slate-50 rounded-lg border border-slate-100 transition-all group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <PlatformIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                                        <span>{getDomainName(link)}</span>
                                                    </div>
                                                    <FiExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                                                </a>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-slate-400">No professional links added</p>
                                    )}
                                </div>
                            )}
                        </div>



                    </div>
                </div>

            </div>

            {/* Sticky Save/Cancel Bar - Only visible when editing */}
            {editing && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    fetchProfile();
                                }}
                                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <FiX className="w-4 h-4" />
                                <span>Cancel</span>
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <FiSave className="w-4 h-4" />
                                <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteLogoModal}
                onClose={() => setShowDeleteLogoModal(false)}
                onConfirm={confirmDeleteLogo}
                itemName="Company Logo"
                itemType="image"
            />
        </DashboardLayout>
    );
};

export default CompanyProfile;
