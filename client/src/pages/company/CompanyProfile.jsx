import React, { useEffect, useState } from 'react';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FiEdit2, FiSave, FiX, FiTrash2, FiBriefcase, FiCheckCircle, FiStar, FiMapPin, FiGlobe, FiLinkedin, FiUsers, FiMail, FiPhone } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa'
import { toast } from '../../utils/toast';
import FileUpload from '../../components/common/FileUpload';
import { uploadAPI } from '../../services/api';
import { SkeletonLoader, PageHeader, DeleteConfirmationModal } from '../../components/shared';
import { getCompanyBreadcrumbs } from '../../utils/breadcrumbUtils';
import useUndo from '../../hooks/useUndo';

const CompanyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadKey, setUploadKey] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');

    // Delete Modal State
    const [showDeleteLogoModal, setShowDeleteLogoModal] = useState(false);
    const { executeWithUndo } = useUndo();

    const [formData, setFormData] = useState({
        companyName: '',
        tagline: '',
        description: '',
        website: '',
        linkedinProfile: '',
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
        try {
            const response = await uploadAPI.uploadSingle(file, 'logos');
            const logoUrl = `http://localhost:5000${response.data.data.fileUrl}`;

            await companyAPI.updateProfile({ logo: logoUrl });
            toast.success('Logo updated!');
            fetchProfile();
        } catch (error) {
            toast.error('Failed to upload logo');
        } finally {
            setUploadingLogo(false);
            setUploadKey(prev => prev + 1);
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
                                        onClick={() => setEditing(false)}
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
                                            loading={uploadingLogo}
                                        >
                                            <div className="relative h-32 w-32 rounded-xl overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-all bg-white flex items-center justify-center group">
                                                {profile?.logo ? (
                                                    <img
                                                        src={profile.logo}
                                                        alt="Logo"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <FaBuilding className="h-12 w-12 text-gray-300" />
                                                )}

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
                                            {profile?.logo ? (
                                                <img
                                                    src={profile.logo}
                                                    alt="Logo"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <FaBuilding className="h-12 w-12 text-gray-300" />
                                            )}
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
                                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Online Presence</h3>
                                    {editing ? (
                                        <div className="space-y-4">
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
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {profile?.website ? (
                                                <a
                                                    href={profile.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                                                >
                                                    <FiGlobe className="h-5 w-5" />
                                                    <span className="font-medium">Visit Website</span>
                                                </a>
                                            ) : <p className="text-sm text-gray-400">No website linked</p>}

                                            {profile?.linkedinProfile ? (
                                                <a
                                                    href={profile.linkedinProfile}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                                                >
                                                    <FiLinkedin className="h-5 w-5" />
                                                    <span className="font-medium">LinkedIn</span>
                                                </a>
                                            ) : <p className="text-sm text-gray-400">No LinkedIn linked</p>}
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
                                            />
                                            <div>
                                                <label className="label text-sm font-bold text-gray-700 mb-1 block">Company Size</label>
                                                <select
                                                    name="companySize"
                                                    value={formData.companySize}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                                                >
                                                    <option value="1-10">1-10 employees</option>
                                                    <option value="11-50">11-50 employees</option>
                                                    <option value="51-200">51-200 employees</option>
                                                    <option value="201-500">201-500 employees</option>
                                                    <option value="500+">500+ employees</option>
                                                </select>
                                            </div>
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