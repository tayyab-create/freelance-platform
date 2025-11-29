import React, { useEffect, useState } from 'react';
import { companyAPI, uploadAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {
    FiEdit2, FiSave, FiX, FiTrash2, FiBriefcase, FiCheckCircle, FiStar,
    FiMapPin, FiGlobe, FiLinkedin, FiUsers, FiMail, FiPhone,
    FiCalendar, FiShield, FiVideo, FiFacebook, FiInstagram, FiTwitter, FiLink, FiAward,
    FiMessageSquare, FiPlayCircle, FiExternalLink, FiFileText
} from 'react-icons/fi';
import { SiGithub, SiCrunchbase, SiMedium, SiBehance, SiDribbble, SiProducthunt } from 'react-icons/si';
import { FaBuilding } from 'react-icons/fa'
import { toast } from '../../utils/toast';
import FileUpload from '../../components/common/FileUpload';
import { PageHeader, DeleteConfirmationModal, Select, Avatar } from '../../components/shared';
import { getCompanyBreadcrumbs } from '../../utils/breadcrumbUtils';
import useUndo from '../../hooks/useUndo';
import InfoCard from '../../components/company/InfoCard';
import ContactCard from '../../components/company/ContactCard';
import LocationCard from '../../components/company/LocationCard';
import DocumentList from '../../components/company/DocumentList';
import BenefitsSection from '../../components/company/BenefitsSection';

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
        benefits: []
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
                benefits: profileData.benefits || []
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
                                    <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 p-1 shrink-0 cursor-pointer hover:border-slate-300 transition-all">
                                        <Avatar
                                            src={profile?.logo}
                                            name={profile?.companyName}
                                            type="company"
                                            size="custom"
                                            className="w-full h-full rounded-xl object-cover"
                                            shape="square"
                                        />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                            <div className="text-center text-white">
                                                <FiEdit2 className="h-5 w-5 mx-auto mb-1" />
                                                <span className="text-xs font-medium">Change</span>
                                            </div>
                                        </div>
                                    </div>
                                </FileUpload>
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 p-1 shrink-0">
                                    <Avatar
                                        src={profile?.logo}
                                        name={profile?.companyName}
                                        type="company"
                                        size="custom"
                                        className="w-full h-full rounded-xl object-cover"
                                        shape="square"
                                    />
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
                        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                            {!editing ? (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                    <span>Edit Profile</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <FiSave className="w-4 h-4" />
                                        <span>{saving ? 'Saving...' : 'Save'}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            fetchProfile();
                                        }}
                                        className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiX className="w-4 h-4" />
                                        <span>Cancel</span>
                                    </button>
                                </>
                            )}
                        </div>
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
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">About Company</h2>
                            {editing ? (
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="6"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all mb-6 text-sm"
                                    placeholder="We are a forward-thinking technology company..."
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

                        {/* Benefits Section */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">Benefits & Perks</h2>
                            <BenefitsSection
                                benefits={editing ? formData.benefits : profile?.benefits}
                                editing={editing}
                                onChange={(benefits) => setFormData({ ...formData, benefits })}
                            />
                        </div>

                        {/* Video Section */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">Company Video</h2>
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
                                        <video
                                            src={profile.companyVideo}
                                            controls
                                            className="w-full aspect-video bg-slate-100 rounded-xl"
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
                    </div>

                    {/* RIGHT COLUMN (Sidebar Info) */}
                    <div className="space-y-6">

                        {/* Contact Person Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-4">Point of Contact</h3>
                            <ContactCard
                                contactPerson={editing ? formData.contactPerson : profile?.contactPerson}
                                editing={editing}
                                onChange={handleContactChange}
                                Input={Input}
                            />
                        </div>

                        {/* Location Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-4">Office Location</h3>
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
                                    <div className="pt-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Social Media</label>
                                        <Input
                                            label="Twitter"
                                            name="twitter"
                                            value={formData.socialMedia.twitter}
                                            onChange={handleSocialChange}
                                            placeholder="https://twitter.com/..."
                                        />
                                    </div>
                                    <Input
                                        label="Facebook"
                                        name="facebook"
                                        value={formData.socialMedia.facebook}
                                        onChange={handleSocialChange}
                                        placeholder="https://facebook.com/..."
                                    />
                                    <Input
                                        label="Instagram"
                                        name="instagram"
                                        value={formData.socialMedia.instagram}
                                        onChange={handleSocialChange}
                                        placeholder="https://instagram.com/..."
                                    />
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

                                            return (
                                                <a
                                                    key={idx}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between text-sm text-slate-600 hover:text-blue-600 p-2 hover:bg-slate-50 rounded-lg border border-slate-100 transition-all group"
                                                >
                                                    {getDomainName(link)}
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

                        {/* Tax Documents */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-4">Tax Documents</h3>
                            <DocumentList documents={profile?.taxDocuments} />
                        </div>

                    </div>
                </div>

            </div>

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
