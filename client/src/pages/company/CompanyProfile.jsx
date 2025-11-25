import React, { useEffect, useState } from 'react';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FiEdit2, FiSave, FiX, FiTrash2, FiBriefcase, FiCheckCircle, FiStar, FiMapPin, FiGlobe, FiLinkedin, FiUsers, FiMail, FiPhone } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa'
import { toast } from 'react-toastify';
import FileUpload from '../../components/common/FileUpload';
import { uploadAPI } from '../../services/api';
import { SkeletonLoader } from '../../components/shared';

const CompanyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadKey, setUploadKey] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');

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

    const handleDeleteLogo = async () => {
        if (!window.confirm('Delete company logo?')) return;
        try {
            await companyAPI.updateProfile({ logo: '' });
            toast.success('Logo removed');
            fetchProfile();
        } catch (error) {
            toast.error('Failed to remove logo');
        }
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
            <div className="max-w-6xl mx-auto space-y-6 pb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Company Profile</h1>
                        <p className="text-gray-600">Manage your company information</p>
                    </div>
                    {!editing ? (
                        <Button variant="primary" icon={FiEdit2} onClick={() => setEditing(true)} className="px-6 py-2.5 rounded-xl">
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button variant="primary" icon={FiSave} onClick={handleSave} loading={saving} className="px-6 py-2.5 rounded-xl">
                                Save Changes
                            </Button>
                            <Button variant="secondary" icon={FiX} onClick={() => setEditing(false)} className="px-6 py-2.5 rounded-xl">
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>

                {/* Main Company Card - Always Visible */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Company Logo */}
                        <div className="flex-shrink-0">
                            <div className="relative group">
                                <div className="relative">
                                    {profile?.logo ? (
                                        <img
                                            src={profile.logo}
                                            alt="Logo"
                                            className="h-32 w-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                                        />
                                    ) : (
                                        <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                                            <FaBuilding className="h-12 w-12 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                {editing && (
                                    <div className="mt-3 space-y-2 w-32">
                                        <FileUpload
                                            key={uploadKey}
                                            onFileSelect={handleLogoUpload}
                                            accept="image/*"
                                            loading={uploadingLogo}
                                        />
                                        {profile?.logo && (
                                            <button
                                                onClick={handleDeleteLogo}
                                                className="w-full text-red-600 text-xs hover:bg-red-50 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all"
                                            >
                                                <FiTrash2 className="h-3 w-3" /> Remove
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Company Basic Info */}
                        <div className="flex-1 w-full space-y-4">
                            {editing ? (
                                <div className="space-y-4">
                                    <Input
                                        label="Company Name"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="Tagline"
                                        name="tagline"
                                        value={formData.tagline}
                                        onChange={handleChange}
                                        placeholder="One-line description of your company"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 mb-2">{profile?.companyName}</h2>
                                    {profile?.tagline && <p className="text-gray-500 text-lg">{profile.tagline}</p>}
                                </div>
                            )}
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
            </div>
        </DashboardLayout>
    );
};

export default CompanyProfile;