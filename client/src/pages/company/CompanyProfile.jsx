import React, { useEffect, useState } from 'react';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FiEdit2, FiSave, FiX, FiTrash2, FiBriefcase, FiCheckCircle, FiStar, FiMapPin, FiGlobe, FiLinkedin, FiUsers } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa'
import { toast } from 'react-toastify';
import FileUpload from '../../components/common/FileUpload';
import { uploadAPI } from '../../services/api';

const CompanyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadKey, setUploadKey] = useState(0);

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
            <div className="max-w-6xl mx-auto space-y-8 pb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900">Company Profile</h1>
                        <p className="text-gray-600 mt-2">Manage your company information</p>
                    </div>
                    {!editing ? (
                        <Button variant="primary" icon={FiEdit2} onClick={() => setEditing(true)} className="text-lg px-6 py-3">
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button variant="primary" icon={FiSave} onClick={handleSave} loading={saving} className="px-6 py-3">
                                Save Changes
                            </Button>
                            <Button variant="secondary" icon={FiX} onClick={() => setEditing(false)} className="px-6 py-3">
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>

                {/* Company Header Card - Premium */}
                <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Company Logo */}
                        <div className="flex-shrink-0">
                            <div className="relative">
                                {profile?.logo ? (
                                    <img
                                        src={profile.logo}
                                        alt="Logo"
                                        className="h-40 w-40 rounded-3xl object-cover border-4 border-white shadow-2xl"
                                    />
                                ) : (
                                    <div className="h-40 w-40 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center border-4 border-white shadow-2xl">
                                        <FaBuilding className="h-20 w-20 text-white" />
                                    </div>
                                )}
                            </div>
                            {editing && (
                                <div className="mt-4 space-y-2">
                                    <FileUpload
                                        key={uploadKey}
                                        onFileSelect={handleLogoUpload}
                                        accept="image/*"
                                        loading={uploadingLogo}
                                    />
                                    {profile?.logo && (
                                        <button
                                            onClick={handleDeleteLogo}
                                            className="w-full text-red-600 text-sm hover:bg-red-50 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                                        >
                                            <FiTrash2 className="h-4 w-4" /> Remove Logo
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Company Info */}
                        <div className="flex-1 space-y-6">
                            {editing ? (
                                <>
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
                                    <div>
                                        <label className="label text-base">Company Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="5"
                                            className="input-field text-base"
                                            placeholder="Tell us about your company..."
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 mb-2">{profile?.companyName}</h2>
                                        {profile?.tagline && <p className="text-gray-600 text-lg italic">{profile.tagline}</p>}
                                    </div>
                                    {profile?.description && (
                                        <p className="text-gray-700 leading-relaxed text-lg">{profile.description}</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 p-6 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <FiBriefcase className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Jobs Posted</p>
                                <p className="text-3xl font-black text-gray-900">{profile?.totalJobsPosted || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 p-6 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                <FiCheckCircle className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Completed</p>
                                <p className="text-3xl font-black text-gray-900">{profile?.totalJobsCompleted || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 p-6 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                                <FiStar className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Rating</p>
                                <p className="text-3xl font-black text-gray-900">{profile?.averageRating?.toFixed(1) || '0.0'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Details */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-1 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                        <h2 className="text-2xl font-black text-gray-900">Company Details</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {editing ? (
                                <>
                                    <Input
                                        label="Website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://yourcompany.com"
                                    />
                                    <Input
                                        label="LinkedIn Profile"
                                        name="linkedinProfile"
                                        value={formData.linkedinProfile}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/company/..."
                                    />
                                </>
                            ) : (
                                <>
                                    {profile?.website && (
                                        <a
                                            href={profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                        >
                                            <FiGlobe className="h-5 w-5" /> Visit Website
                                        </a>
                                    )}
                                    {profile?.linkedinProfile && (
                                        <a
                                            href={profile.linkedinProfile}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                        >
                                            <FiLinkedin className="h-5 w-5" /> LinkedIn
                                        </a>
                                    )}
                                </>
                            )}
                        </div>

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
                                        <label className="label">Company Size</label>
                                        <select
                                            name="companySize"
                                            value={formData.companySize}
                                            onChange={handleChange}
                                            className="input-field"
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
                                    {profile?.industry && (
                                        <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl border-2 border-purple-200">
                                            <FiBriefcase className="h-6 w-6 text-purple-700" />
                                            <div>
                                                <p className="text-sm text-gray-600 font-semibold">Industry</p>
                                                <p className="text-lg font-bold text-gray-900">{profile.industry}</p>
                                            </div>
                                        </div>
                                    )}
                                    {profile?.companySize && (
                                        <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border-2 border-blue-200">
                                            <FiUsers className="h-6 w-6 text-blue-700" />
                                            <div>
                                                <p className="text-sm text-gray-600 font-semibold">Company Size</p>
                                                <p className="text-lg font-bold text-gray-900">{profile.companySize} employees</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-1 bg-gradient-to-b from-orange-500 to-red-700 rounded-full"></div>
                        <h2 className="text-2xl font-black text-gray-900">Company Address</h2>
                    </div>

                    {editing ? (
                        <div className="space-y-4">
                            <Input
                                label="Street Address"
                                name="street"
                                value={formData.address.street}
                                onChange={handleAddressChange}
                            />
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="City"
                                    name="city"
                                    value={formData.address.city}
                                    onChange={handleAddressChange}
                                />
                                <Input
                                    label="State/Province"
                                    name="state"
                                    value={formData.address.state}
                                    onChange={handleAddressChange}
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Country"
                                    name="country"
                                    value={formData.address.country}
                                    onChange={handleAddressChange}
                                />
                                <Input
                                    label="Zip Code"
                                    name="zipCode"
                                    value={formData.address.zipCode}
                                    onChange={handleAddressChange}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-4 px-6 py-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl border-2 border-orange-200">
                            <FiMapPin className="h-6 w-6 text-orange-700 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-600 font-semibold mb-2">Location</p>
                                <p className="text-gray-900 leading-relaxed">
                                    {profile?.address?.street && <>{profile.address.street}<br /></>}
                                    {profile?.address?.city && <>{profile.address.city}, </>}
                                    {profile?.address?.state && <>{profile.address.state} </>}
                                    {profile?.address?.zipCode && <>{profile.address.zipCode}<br /></>}
                                    {profile?.address?.country && <span className="font-bold">{profile.address.country}</span>}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contact Person */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-1 bg-gradient-to-b from-green-500 to-emerald-700 rounded-full"></div>
                        <h2 className="text-2xl font-black text-gray-900">Contact Person</h2>
                    </div>

                    {editing ? (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Name"
                                    name="name"
                                    value={formData.contactPerson.name}
                                    onChange={handleContactChange}
                                />
                                <Input
                                    label="Position"
                                    name="position"
                                    value={formData.contactPerson.position}
                                    onChange={handleContactChange}
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.contactPerson.email}
                                    onChange={handleContactChange}
                                />
                                <Input
                                    label="Phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.contactPerson.phone}
                                    onChange={handleContactChange}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {profile?.contactPerson?.name && (
                                <div className="px-6 py-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-200">
                                    <p className="text-sm text-gray-600 font-semibold mb-1">Name & Position</p>
                                    <p className="text-lg font-bold text-gray-900">{profile.contactPerson.name}</p>
                                    {profile.contactPerson.position && (
                                        <p className="text-gray-700">{profile.contactPerson.position}</p>
                                    )}
                                </div>
                            )}
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border-2 border-blue-200">
                                <p className="text-sm text-gray-600 font-semibold mb-2">Contact Details</p>
                                {profile?.contactPerson?.email && (
                                    <p className="text-gray-900 mb-1">📧 {profile.contactPerson.email}</p>
                                )}
                                {profile?.contactPerson?.phone && (
                                    <p className="text-gray-900">📞 {profile.contactPerson.phone}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CompanyProfile;