import React, { useEffect, useState } from 'react';
import { workerAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FiEdit2, FiPlus, FiTrash2, FiSave, FiX, FiStar, FiGithub, FiLinkedin, FiAward, FiBriefcase, FiDollarSign, FiCheckCircle, FiPhone, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import FileUpload from '../../components/common/FileUpload';
import { uploadAPI } from '../../services/api';
import { Link } from 'react-router-dom';

const WorkerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Form states
    const [basicInfo, setBasicInfo] = useState({
        fullName: '',
        phone: '',
        bio: '',
        githubProfile: '',
        linkedinProfile: '',
        hourlyRate: '',
        availability: 'available',
    });

    const [skills, setSkills] = useState('');
    const [showExpModal, setShowExpModal] = useState(false);
    const [showCertModal, setShowCertModal] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [experienceForm, setExperienceForm] = useState({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
    });

    const [certificationForm, setCertificationForm] = useState({
        title: '',
        issuedBy: '',
        issuedDate: '',
        certificateUrl: '',
    });

    const [editingExpId, setEditingExpId] = useState(null);
    const [editingCertId, setEditingCertId] = useState(null);
    const [uploadKey, setUploadKey] = useState(0);

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleImageUpload = async (file) => {
        if (!file) return;

        setUploadingImage(true);
        try {
            const response = await uploadAPI.uploadSingle(file, 'profiles');
            const imageUrl = `http://localhost:5000${response.data.data.fileUrl}`;

            // Update profile with new image URL
            await workerAPI.updateProfile({ profilePicture: imageUrl });
            toast.success('Profile picture updated!');
            fetchProfile();
        } catch (error) {
            toast.error('Failed to upload image');
        } finally {
            setUploadingImage(false);
            setUploadKey(prev => prev + 1);
        }
    };

    const handleDeleteProfilePicture = async () => {
        if (!window.confirm('Delete profile picture?')) return;
        try {
            await workerAPI.updateProfile({ profilePicture: '' });
            toast.success('Profile picture removed');
            fetchProfile();
        } catch (error) {
            toast.error('Failed to remove profile picture');
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await workerAPI.getProfile();
            const profileData = response.data.data;
            setProfile(profileData);

            // Populate form
            setBasicInfo({
                fullName: profileData.fullName || '',
                phone: profileData.phone || '',
                bio: profileData.bio || '',
                githubProfile: profileData.githubProfile || '',
                linkedinProfile: profileData.linkedinProfile || '',
                hourlyRate: profileData.hourlyRate || '',
                availability: profileData.availability || 'available',
            });
            setSkills(profileData.skills?.join(', ') || '');
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleBasicInfoChange = (e) => {
        setBasicInfo({
            ...basicInfo,
            [e.target.name]: e.target.value,
        });
    };

    const handleSaveBasicInfo = async () => {
        setSaving(true);
        try {
            const updateData = {
                ...basicInfo,
                skills: skills.split(',').map(s => s.trim()).filter(s => s),
            };

            await workerAPI.updateProfile(updateData);
            toast.success('Profile updated successfully!');
            setEditing(false);
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveExperience = async (e) => {
        e.preventDefault();
        try {
            if (editingExpId) {
                await workerAPI.updateExperience(editingExpId, experienceForm);
                toast.success('Experience updated successfully!');
            } else {
                await workerAPI.addExperience(experienceForm);
                toast.success('Experience added successfully!');
            }
            setShowExpModal(false);
            setEditingExpId(null);
            setExperienceForm({
                title: '',
                company: '',
                startDate: '',
                endDate: '',
                current: false,
                description: '',
            });
            fetchProfile();
        } catch (error) {
            toast.error('Failed to save experience');
        }
    };

    const handleEditExperience = (exp) => {
        setExperienceForm({
            title: exp.title,
            company: exp.company,
            startDate: exp.startDate ? exp.startDate.split('T')[0] : '',
            endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
            current: exp.current,
            description: exp.description || '',
        });
        setEditingExpId(exp._id);
        setShowExpModal(true);
    };

    const handleDeleteExperience = async (id) => {
        if (!window.confirm('Are you sure you want to delete this experience?')) return;
        try {
            await workerAPI.deleteExperience(id);
            toast.success('Experience deleted successfully');
            fetchProfile();
        } catch (error) {
            toast.error('Failed to delete experience');
        }
    };

    const handleSaveCertification = async (e) => {
        e.preventDefault();
        try {
            if (editingCertId) {
                await workerAPI.updateCertification(editingCertId, certificationForm);
                toast.success('Certification updated successfully!');
            } else {
                await workerAPI.addCertification(certificationForm);
                toast.success('Certification added successfully!');
            }
            setShowCertModal(false);
            setEditingCertId(null);
            setCertificationForm({
                title: '',
                issuedBy: '',
                issuedDate: '',
                certificateUrl: '',
            });
            fetchProfile();
        } catch (error) {
            toast.error('Failed to save certification');
        }
    };

    const handleEditCertification = (cert) => {
        setCertificationForm({
            title: cert.title,
            issuedBy: cert.issuedBy,
            issuedDate: cert.issuedDate ? cert.issuedDate.split('T')[0] : '',
            certificateUrl: cert.certificateUrl || '',
        });
        setEditingCertId(cert._id);
        setShowCertModal(true);
    };

    const handleDeleteCertification = async (id) => {
        if (!window.confirm('Are you sure you want to delete this certification?')) return;
        try {
            await workerAPI.deleteCertification(id);
            toast.success('Certification deleted successfully');
            fetchProfile();
        } catch (error) {
            toast.error('Failed to delete certification');
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
                {/* Modern Header Section - Minimalist */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Header Actions */}
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
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
                                        onClick={handleSaveBasicInfo}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
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
                            {/* Profile Picture */}
                            <div className="flex-shrink-0">
                                <div className="relative">
                                    {editing ? (
                                        <div className="relative">
                                            <FileUpload
                                                key={uploadKey}
                                                onFileSelect={handleImageUpload}
                                                accept="image/*"
                                                loading={uploadingImage}
                                            >
                                                <div className="relative h-32 w-32 rounded-xl overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-all bg-gray-50 flex items-center justify-center group">
                                                    {profile?.profilePicture ? (
                                                        <img
                                                            src={profile.profilePicture}
                                                            alt="Profile"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="text-gray-300">
                                                            <FiUser className="h-16 w-16" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="text-white flex flex-col items-center gap-1">
                                                            <FiEdit2 className="h-5 w-5" />
                                                            <span className="text-xs font-medium">Change</span>
                                                        </div>
                                                    </div>
                                                    {uploadingImage && (
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                            <Spinner size="sm" color="white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </FileUpload>
                                            {profile?.profilePicture && (
                                                <button
                                                    onClick={handleDeleteProfilePicture}
                                                    type="button"
                                                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-40"
                                                    title="Remove Photo"
                                                >
                                                    <FiTrash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative h-32 w-32 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                                            {profile?.profilePicture ? (
                                                <img
                                                    src={profile.profilePicture}
                                                    alt="Profile"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-gray-300">
                                                    <FiUser className="h-16 w-16" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Availability Indicator */}
                                    {profile?.availability && (
                                        <div className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white shadow-sm z-30 ${
                                            profile.availability === 'available' ? 'bg-emerald-500' :
                                            profile.availability === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                                        }`}></div>
                                    )}
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="flex-1 w-full space-y-4">
                                {editing ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={basicInfo.fullName}
                                                onChange={handleBasicInfoChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={basicInfo.phone}
                                                onChange={handleBasicInfoChange}
                                                placeholder="03074190230"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                            <textarea
                                                name="bio"
                                                value={basicInfo.bio}
                                                onChange={handleBasicInfoChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                                rows="3"
                                                placeholder="My BIO is the perfect and I need it alwayss!!"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold text-gray-900">{profile?.fullName}</h2>
                                            {profile?.availability === 'available' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                                    Available for work
                                                </span>
                                            )}
                                        </div>
                                        {profile?.phone && (
                                            <p className="text-gray-600 mb-3 flex items-center gap-2">
                                                <FiPhone className="h-4 w-4" />
                                                {profile.phone}
                                            </p>
                                        )}
                                        {profile?.bio && (
                                            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
                    {['overview', 'portfolio', 'reviews'].map((tab) => (
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
                <div className="min-h[400px]">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                            <FiDollarSign className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rate</span>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900">${profile?.hourlyRate || 0}<span className="text-sm text-gray-400 font-medium">/hr</span></p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <FiBriefcase className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jobs</span>
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

                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                            <FiCheckCircle className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
                                    </div>
                                    {editing ? (
                                        <select
                                            name="availability"
                                            value={basicInfo.availability}
                                            onChange={handleBasicInfoChange}
                                            className="w-full text-sm border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="available">Available</option>
                                            <option value="busy">Busy</option>
                                            <option value="not-available">Unavailable</option>
                                        </select>
                                    ) : (
                                        <p className="text-lg font-bold text-gray-900 capitalize">{profile?.availability || 'Not set'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Skills */}
                                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Skills & Expertise</h3>
                                    {editing ? (
                                        <Input
                                            label="Skills (comma-separated)"
                                            value={skills}
                                            onChange={(e) => setSkills(e.target.value)}
                                            placeholder="React, Node.js, MongoDB, etc."
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {profile?.skills?.length > 0 ? (
                                                profile.skills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-50 text-gray-700 border border-gray-200"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 text-sm">No skills added yet</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Social Links */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Social Profiles</h3>
                                    {editing ? (
                                        <div className="space-y-3">
                                            <Input
                                                label="GitHub"
                                                name="githubProfile"
                                                value={basicInfo.githubProfile}
                                                onChange={handleBasicInfoChange}
                                                placeholder="username"
                                            />
                                            <Input
                                                label="LinkedIn"
                                                name="linkedinProfile"
                                                value={basicInfo.linkedinProfile}
                                                onChange={handleBasicInfoChange}
                                                placeholder="username"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {profile?.githubProfile ? (
                                                <a
                                                    href={profile.githubProfile}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                                                >
                                                    <FiGithub className="h-5 w-5" />
                                                    <span className="font-medium">GitHub</span>
                                                </a>
                                            ) : <p className="text-sm text-gray-400">No GitHub linked</p>}

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

                    {activeTab === 'portfolio' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Experience */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Work Experience</h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        icon={FiPlus}
                                        onClick={() => {
                                            setEditingExpId(null);
                                            setExperienceForm({
                                                title: '',
                                                company: '',
                                                startDate: '',
                                                endDate: '',
                                                current: false,
                                                description: '',
                                            });
                                            setShowExpModal(true);
                                        }}
                                    >
                                        Add
                                    </Button>
                                </div>
                                {profile?.experience && profile.experience.length > 0 ? (
                                    <div className="space-y-8">
                                        {profile.experience.map((exp, index) => (
                                            <div key={index} className="relative pl-8 border-l-2 border-gray-100 last:border-0 group">
                                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-gray-200 border-2 border-white group-hover:bg-primary-500 transition-colors"></div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900">{exp.title}</h4>
                                                        <p className="text-primary-600 font-medium">{exp.company}</p>
                                                        <p className="text-sm text-gray-500 mt-1 mb-2">
                                                            {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                                                            {exp.current ? <span className="text-green-600 font-semibold">Present</span> : new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                        </p>
                                                        {exp.description && <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>}
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleEditExperience(exp)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><FiEdit2 className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDeleteExperience(exp._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><FiTrash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">No experience added yet.</div>
                                )}
                            </div>

                            {/* Certifications */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Certifications</h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        icon={FiPlus}
                                        onClick={() => {
                                            setEditingCertId(null);
                                            setCertificationForm({
                                                title: '',
                                                issuedBy: '',
                                                issuedDate: '',
                                                certificateUrl: '',
                                            });
                                            setShowCertModal(true);
                                        }}
                                    >
                                        Add
                                    </Button>
                                </div>
                                {profile?.certifications && profile.certifications.length > 0 ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {profile.certifications.map((cert, index) => (
                                            <div key={index} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group relative">
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEditCertification(cert)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"><FiEdit2 className="h-3.5 w-3.5" /></button>
                                                    <button onClick={() => handleDeleteCertification(cert._id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"><FiTrash2 className="h-3.5 w-3.5" /></button>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm text-yellow-500">
                                                        <FiAward className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-sm">{cert.title}</h4>
                                                        <p className="text-xs text-gray-500">{cert.issuedBy}</p>
                                                        <p className="text-xs text-gray-400 mt-1">Issued: {new Date(cert.issuedDate).toLocaleDateString()}</p>
                                                        {cert.certificateUrl && (
                                                            <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 font-semibold mt-2 inline-block hover:underline">View Certificate</a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">No certifications added yet.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fadeIn">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Client Reviews</h3>
                                <Link to="/worker/reviews" className="text-primary-600 text-sm font-bold hover:underline">View All</Link>
                            </div>

                            {profile?.totalReviews > 0 ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className="text-center px-4 border-r border-gray-200">
                                            <span className="text-3xl font-black text-gray-900">{profile.averageRating?.toFixed(1)}</span>
                                            <div className="flex text-yellow-400 text-sm mt-1">
                                                {[1, 2, 3, 4, 5].map(s => <FiStar key={s} className={s <= Math.round(profile.averageRating) ? "fill-current" : "text-gray-300"} />)}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{profile.totalReviews} reviews</p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 italic">"Great work! Highly recommended."</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {profile.recentReviews?.slice(0, 3).map((review, i) => (
                                            <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                                <div className="flex justify-between mb-2">
                                                    <h4 className="font-bold text-gray-900 text-sm">{review.companyName || 'Client'}</h4>
                                                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex text-yellow-400 text-xs mb-2">
                                                    {[1, 2, 3, 4, 5].map(s => <FiStar key={s} className={s <= review.rating ? "fill-current" : "text-gray-300"} />)}
                                                </div>
                                                <p className="text-sm text-gray-600">{review.reviewText}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">No reviews yet.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modals */}
                {showExpModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                            <h3 className="text-xl font-bold mb-4">{editingExpId ? 'Edit Experience' : 'Add Experience'}</h3>
                            <form onSubmit={handleSaveExperience} className="space-y-4">
                                <Input label="Job Title" value={experienceForm.title} onChange={e => setExperienceForm({ ...experienceForm, title: e.target.value })} required />
                                <Input label="Company" value={experienceForm.company} onChange={e => setExperienceForm({ ...experienceForm, company: e.target.value })} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input type="date" label="Start Date" value={experienceForm.startDate} onChange={e => setExperienceForm({ ...experienceForm, startDate: e.target.value })} required />
                                    <div className="space-y-1">
                                        <Input type="date" label="End Date" value={experienceForm.endDate} onChange={e => setExperienceForm({ ...experienceForm, endDate: e.target.value })} disabled={experienceForm.current} />
                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                            <input type="checkbox" checked={experienceForm.current} onChange={e => setExperienceForm({ ...experienceForm, current: e.target.checked })} className="rounded text-primary-600" />
                                            I currently work here
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="label text-sm font-bold text-gray-700 mb-1 block">Description</label>
                                    <textarea value={experienceForm.description} onChange={e => setExperienceForm({ ...experienceForm, description: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 outline-none" rows="3" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="secondary" onClick={() => setShowExpModal(false)} className="flex-1">Cancel</Button>
                                    <Button type="submit" variant="primary" className="flex-1">Save</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showCertModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                            <h3 className="text-xl font-bold mb-4">{editingCertId ? 'Edit Certification' : 'Add Certification'}</h3>
                            <form onSubmit={handleSaveCertification} className="space-y-4">
                                <Input label="Certification Title" value={certificationForm.title} onChange={e => setCertificationForm({ ...certificationForm, title: e.target.value })} required />
                                <Input label="Issued By" value={certificationForm.issuedBy} onChange={e => setCertificationForm({ ...certificationForm, issuedBy: e.target.value })} required />
                                <Input type="date" label="Issued Date" value={certificationForm.issuedDate} onChange={e => setCertificationForm({ ...certificationForm, issuedDate: e.target.value })} required />
                                <Input label="Credential URL" value={certificationForm.certificateUrl} onChange={e => setCertificationForm({ ...certificationForm, certificateUrl: e.target.value })} placeholder="https://" />
                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="secondary" onClick={() => setShowCertModal(false)} className="flex-1">Cancel</Button>
                                    <Button type="submit" variant="primary" className="flex-1">Save</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default WorkerProfile;