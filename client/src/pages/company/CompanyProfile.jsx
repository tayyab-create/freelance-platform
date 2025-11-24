import React, { useEffect, useState } from 'react';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FiEdit2, FiSave, FiX, FiTrash2 } from 'react-icons/fi';
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
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Company Profile</h1>
                    {!editing ? (
                        <Button variant="primary" icon={FiEdit2} onClick={() => setEditing(true)}>
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="primary" icon={FiSave} onClick={handleSave} loading={saving}>
                                Save Changes
                            </Button>
                            <Button variant="secondary" icon={FiX} onClick={() => setEditing(false)}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>

                {/* Basic Information */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                    {/* Company Logo */}
                    {editing && (
                        <div className="mb-6">
                            <FileUpload
                                key={uploadKey}
                                label="Company Logo"
                                accept="image/*"
                                preview={true}
                                currentImage={profile?.logo}
                                onFileSelect={handleLogoUpload}
                                maxSize={5}
                            />
                            {uploadingLogo && (
                                <p className="text-sm text-primary-600 mt-2">Uploading...</p>
                            )}
                            {profile?.logo && (
                                <button
                                    onClick={handleDeleteLogo}
                                    className="text-red-600 text-sm hover:underline flex items-center gap-1 mt-2"
                                >
                                    <FiTrash2 className="h-4 w-4" /> Remove Logo
                                </button>
                            )}
                        </div>
                    )}

                    {!editing && profile?.logo && (
                        <div className="mb-6">
                            <label className="label">Company Logo</label>
                            <img
                                src={profile.logo}
                                alt="Logo"
                                className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300"
                            />
                        </div>
                    )}
                    <div className="space-y-4">
                        <Input
                            label="Company Name"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            disabled={!editing}
                            required
                        />

                        <Input
                            label="Tagline"
                            name="tagline"
                            value={formData.tagline}
                            onChange={handleChange}
                            disabled={!editing}
                            placeholder="One-line description of your company"
                        />

                        <div>
                            <label className="label">Company Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                disabled={!editing}
                                rows="5"
                                className="input-field"
                                placeholder="Tell us about your company..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                disabled={!editing}
                                placeholder="https://yourcompany.com"
                            />

                            <Input
                                label="LinkedIn Profile"
                                name="linkedinProfile"
                                value={formData.linkedinProfile}
                                onChange={handleChange}
                                disabled={!editing}
                                placeholder="https://linkedin.com/company/..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Industry"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                disabled={!editing}
                                placeholder="e.g., Technology, Finance"
                            />

                            <div>
                                <label className="label">Company Size</label>
                                <select
                                    name="companySize"
                                    value={formData.companySize}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    className="input-field"
                                >
                                    <option value="1-10">1-10 employees</option>
                                    <option value="11-50">11-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="500+">500+ employees</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Address</h2>
                    <div className="space-y-4">
                        <Input
                            label="Street Address"
                            name="street"
                            value={formData.address.street}
                            onChange={handleAddressChange}
                            disabled={!editing}
                        />

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="City"
                                name="city"
                                value={formData.address.city}
                                onChange={handleAddressChange}
                                disabled={!editing}
                            />

                            <Input
                                label="State/Province"
                                name="state"
                                value={formData.address.state}
                                onChange={handleAddressChange}
                                disabled={!editing}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Country"
                                name="country"
                                value={formData.address.country}
                                onChange={handleAddressChange}
                                disabled={!editing}
                            />

                            <Input
                                label="Zip Code"
                                name="zipCode"
                                value={formData.address.zipCode}
                                onChange={handleAddressChange}
                                disabled={!editing}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Person */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Contact Person</h2>
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Name"
                                name="name"
                                value={formData.contactPerson.name}
                                onChange={handleContactChange}
                                disabled={!editing}
                            />

                            <Input
                                label="Position"
                                name="position"
                                value={formData.contactPerson.position}
                                onChange={handleContactChange}
                                disabled={!editing}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.contactPerson.email}
                                onChange={handleContactChange}
                                disabled={!editing}
                            />

                            <Input
                                label="Phone"
                                name="phone"
                                type="tel"
                                value={formData.contactPerson.phone}
                                onChange={handleContactChange}
                                disabled={!editing}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="card text-center">
                        <p className="text-gray-600">Jobs Posted</p>
                        <p className="text-3xl font-bold text-primary-600">{profile?.totalJobsPosted || 0}</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-gray-600">Jobs Completed</p>
                        <p className="text-3xl font-bold text-primary-600">{profile?.totalJobsCompleted || 0}</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-gray-600">Average Rating</p>
                        <p className="text-3xl font-bold text-primary-600">
                            {profile?.averageRating?.toFixed(1) || '0.0'} ⭐
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CompanyProfile;