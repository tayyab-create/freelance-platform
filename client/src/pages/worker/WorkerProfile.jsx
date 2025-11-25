import React, { useEffect, useState } from 'react';
import { workerAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FiEdit2, FiPlus, FiTrash2, FiSave, FiX, FiStar, FiGithub, FiLinkedin, FiAward, FiBriefcase, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import FileUpload from '../../components/common/FileUpload';
import { uploadAPI } from '../../services/api';
import { Link } from 'react-router-dom';

const WorkerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

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
            <div className="max-w-6xl mx-auto space-y-8 pb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900">My Profile</h1>
                        <p className="text-gray-600 mt-2">Manage your professional information</p>
                    </div>
                    {!editing ? (
                        <Button variant="primary" icon={FiEdit2} onClick={() => setEditing(true)} className="text-lg px-6 py-3">
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button variant="primary" icon={FiSave} onClick={handleSaveBasicInfo} loading={saving} className="px-6 py-3">
                                Save Changes
                            </Button>
                            <Button variant="secondary" icon={FiX} onClick={() => setEditing(false)} className="px-6 py-3">
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>

                {/* Profile Header Card - Premium */}
                <div className="bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500"></div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            <div className="relative group">
                                <div className="relative">
                                    <img
                                        src={profile?.profilePicture || 'https://via.placeholder.com/150'}
                                        alt="Profile"
                                        className="h-40 w-40 rounded-3xl object-cover border-4 border-white shadow-2xl"
                                    />
                                    {profile?.availability && (
                                        <div className={`absolute bottom-3 right-3 h-6 w-6 rounded-full border-4 border-white shadow-lg ${profile.availability === 'available' ? 'bg-green-500' :
                                                profile.availability === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}></div>
                                    )}
                                </div>
                                {editing && (
                                    <div className="mt-4 space-y-2">
                                        <FileUpload
                                            key={uploadKey}
                                            onFileSelect={handleImageUpload}
                                            accept="image/*"
                                            loading={uploadingImage}
                                        />
                                        {profile?.profilePicture && (
                                            <button
                                                onClick={handleDeleteProfilePicture}
                                                className="w-full text-red-600 text-sm hover:bg-red-50 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                                            >
                                                <FiTrash2 className="h-4 w-4" /> Remove Photo
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 space-y-6">
                            {editing ? (
                                <>
                                    <Input
                                        label="Full Name"
                                        name="fullName"
                                        value={basicInfo.fullName}
                                        onChange={handleBasicInfoChange}
                                    />
                                    <Input
                                        label="Phone"
                                        name="phone"
                                        value={basicInfo.phone}
                                        onChange={handleBasicInfoChange}
                                        placeholder="+1234567890"
                                    />
                                    <div>
                                        <label className="label text-base">Bio</label>
                                        <textarea
                                            name="bio"
                                            value={basicInfo.bio}
                                            onChange={handleBasicInfoChange}
                                            className="input-field text-base"
                                            rows="4"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 mb-2">{profile?.fullName}</h2>
                                        {profile?.phone && <p className="text-gray-600 text-lg">{profile.phone}</p>}
                                    </div>
                                    {profile?.bio && (
                                        <p className="text-gray-700 leading-relaxed text-lg">{profile.bio}</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Premium Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 p-6 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                <FiDollarSign className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Hourly Rate</p>
                                <p className="text-2xl font-black text-gray-900">${profile?.hourlyRate || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 p-6 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <FiBriefcase className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Jobs Done</p>
                                <p className="text-2xl font-black text-gray-900">{profile?.totalJobsCompleted || 0}</p>
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
                                <p className="text-2xl font-black text-gray-900">{profile?.averageRating?.toFixed(1) || '0.0'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 p-6 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4">
                            {editing ? (
                                <select
                                    name="availability"
                                    value={basicInfo.availability}
                                    onChange={handleBasicInfoChange}
                                    className="input-field"
                                >
                                    <option value="available">Available</option>
                                    <option value="busy">Busy</option>
                                    <option value="not-available">Not Available</option>
                                </select>
                            ) : (
                                <>
                                    <div className={`p-4 rounded-xl shadow-lg ${profile?.availability === 'available' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                            profile?.availability === 'busy' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                                                'bg-gradient-to-br from-red-500 to-pink-600'
                                        }`}>
                                        <FiCheckCircle className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Status</p>
                                        <p className="text-lg font-bold text-gray-900 capitalize">{profile?.availability || 'Not set'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-1 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                        <h2 className="text-2xl font-black text-gray-900">Skills & Expertise</h2>
                    </div>
                    {editing ? (
                        <Input
                            label="Skills (comma-separated)"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="React, Node.js, MongoDB, etc."
                        />
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {profile?.skills?.length > 0 ? (
                                profile.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-purple-100 via-primary-100 to-blue-100 text-primary-700 border-2 border-primary-200/50 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                                    >
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center w-full py-4">No skills added yet</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Social Links - Only show when editing OR when links exist */}
                {(editing || profile?.githubProfile || profile?.linkedinProfile) && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-indigo-700 rounded-full"></div>
                            <h2 className="text-2xl font-black text-gray-900">Social Links</h2>
                        </div>
                        {editing ? (
                            <div className="space-y-4">
                                <Input
                                    label="GitHub Profile"
                                    name="githubProfile"
                                    value={basicInfo.githubProfile}
                                    onChange={handleBasicInfoChange}
                                    placeholder="https://github.com/username"
                                />
                                <Input
                                    label="LinkedIn Profile"
                                    name="linkedinProfile"
                                    value={basicInfo.linkedinProfile}
                                    onChange={handleBasicInfoChange}
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                {profile?.githubProfile && (
                                    <a
                                        href={profile.githubProfile}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                    >
                                        <FiGithub className="h-5 w-5" /> GitHub
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
                            </div>
                        )}
                    </div>
                )}

                {/* Experience */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-1 bg-gradient-to-b from-orange-500 to-red-700 rounded-full"></div>
                            <h2 className="text-2xl font-black text-gray-900">Work Experience</h2>
                        </div>
                        <Button
                            variant="primary"
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
                            className="px-5 py-2.5"
                        >
                            Add Experience
                        </Button>
                    </div>
                    {profile?.experience && profile.experience.length > 0 ? (
                        <div className="space-y-6">
                            {profile.experience.map((exp, index) => (
                                <div
                                    key={index}
                                    className="border-l-4 border-primary-600 pl-6 py-4 bg-gradient-to-r from-primary-50/50 to-transparent rounded-r-2xl group hover:shadow-md transition-all"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{exp.title}</h3>
                                            <p className="text-primary-600 font-semibold mb-2">{exp.company}</p>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                                                {exp.current ? <span className="text-green-600 font-semibold">Present</span> : new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </p>
                                            {exp.description && <p className="text-gray-700 leading-relaxed">{exp.description}</p>}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                            <button
                                                onClick={() => handleEditExperience(exp)}
                                                className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Edit"
                                            >
                                                <FiEdit2 className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExperience(exp._id)}
                                                className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete"
                                            >
                                                <FiTrash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                                <FiBriefcase className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">No experience added yet</p>
                            <p className="text-sm text-gray-500 mt-1">Add your work experience to showcase your skills</p>
                        </div>
                    )}
                </div>

                {/* Certifications */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-1 bg-gradient-to-b from-green-500 to-emerald-700 rounded-full"></div>
                            <h2 className="text-2xl font-black text-gray-900">Certifications & Awards</h2>
                        </div>
                        <Button
                            variant="primary"
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
                            className="px-5 py-2.5"
                        >
                            Add Certification
                        </Button>
                    </div>
                    {profile?.certifications && profile.certifications.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {profile.certifications.map((cert, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 relative group hover:shadow-lg hover:border-primary-300 transition-all"
                                >
                                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditCertification(cert)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            title="Edit"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCertification(cert._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg flex-shrink-0">
                                            <FiAward className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1 pr-16">
                                            <h3 className="font-bold text-lg text-gray-900 mb-1">{cert.title}</h3>
                                            <p className="text-gray-600 font-medium">{cert.issuedBy}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Issued: {new Date(cert.issuedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </p>
                                    {cert.certificateUrl && (
                                        <a
                                            href={cert.certificateUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
                                        >
                                            View Certificate →
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                                <FiAward className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">No certifications added yet</p>
                            <p className="text-sm text-gray-500 mt-1">Add certifications to highlight your qualifications</p>
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-1 bg-gradient-to-b from-yellow-500 to-orange-700 rounded-full"></div>
                            <h2 className="text-2xl font-black text-gray-900">Recent Reviews</h2>
                        </div>
                        <Link to="/worker/reviews" className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-2 transition-colors">
                            View All Reviews
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    {profile?.totalReviews > 0 && profile?.recentReviews && profile.recentReviews.length > 0 ? (
                        <div className="space-y-6">
                            {/* Overall Rating Summary */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 pb-6 border-b border-gray-200">
                                <div className="text-center">
                                    <p className="text-6xl font-black text-primary-600 mb-3">
                                        {profile.averageRating?.toFixed(1) || '0.0'}
                                    </p>
                                    <div className="flex items-center gap-1 justify-center mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FiStar
                                                key={star}
                                                className={`h-6 w-6 ${star <= Math.round(profile.averageRating)
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600 font-semibold">{profile.totalReviews} reviews</p>
                                </div>

                                <div className="flex-1 w-full">
                                    <p className="text-gray-700 mb-4 font-bold">Rating Distribution</p>
                                    {[5, 4, 3, 2, 1].map((rating) => {
                                        const count = profile.recentReviews.filter(r => r.rating === rating).length;
                                        const percentage = profile.totalReviews > 0 ? (count / profile.totalReviews) * 100 : 0;
                                        return (
                                            <div key={rating} className="flex items-center gap-3 mb-3">
                                                <div className="flex items-center gap-1 w-20">
                                                    <span className="text-sm font-bold text-gray-700">{rating}</span>
                                                    <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                                                </div>
                                                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600 w-12 text-right font-semibold">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recent Reviews List */}
                            <div className="space-y-6">
                                {profile.recentReviews.slice(0, 3).map((review, index) => (
                                    <div key={index} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                        {/* Review Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                {review.companyLogo ? (
                                                    <img
                                                        src={review.companyLogo}
                                                        alt={review.companyName}
                                                        className="h-12 w-12 rounded-xl object-cover flex-shrink-0 border-2 border-white shadow-md"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-md">
                                                        <span className="text-primary-600 font-bold text-lg">
                                                            {review.companyName?.charAt(0) || 'C'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg">
                                                        {review.companyName || 'Anonymous Client'}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FiStar
                                                        key={star}
                                                        className={`h-5 w-5 ${star <= review.rating
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Job Title */}
                                        {review.jobTitle && review.jobTitle !== 'N/A' && (
                                            <p className="text-sm text-gray-600 mb-3">
                                                Project: <span className="font-bold text-gray-900">{review.jobTitle}</span>
                                            </p>
                                        )}

                                        {/* Review Text */}
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            {review.reviewText}
                                        </p>

                                        {/* Tags and Badges */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {review.tags && review.tags.length > 0 && (
                                                <>
                                                    {review.tags.slice(0, 3).map((tag, idx) => (
                                                        <span key={idx} className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
                                                            {tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                        </span>
                                                    ))}
                                                </>
                                            )}
                                            {review.wouldHireAgain && (
                                                <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-lg text-xs font-bold border border-green-200">
                                                    ✓ Would hire again
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full mb-4">
                                <FiStar className="h-10 w-10 text-yellow-600" />
                            </div>
                            <p className="text-gray-900 font-bold text-xl mb-2">No reviews yet</p>
                            <p className="text-gray-600">
                                Complete jobs to receive reviews from clients
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Experience Modal */}
            {showExpModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl transform animate-slide-up">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-1 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                            <h2 className="text-3xl font-black text-gray-900">{editingExpId ? 'Edit Experience' : 'Add Experience'}</h2>
                        </div>
                        <form onSubmit={handleSaveExperience} className="space-y-6">
                            <Input
                                label="Job Title"
                                value={experienceForm.title}
                                onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                                required
                            />
                            <Input
                                label="Company"
                                value={experienceForm.company}
                                onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                                required
                            />
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Start Date"
                                    type="date"
                                    value={experienceForm.startDate}
                                    onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
                                    required
                                />
                                <Input
                                    label="End Date"
                                    type="date"
                                    value={experienceForm.endDate}
                                    onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
                                    disabled={experienceForm.current}
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="current"
                                    checked={experienceForm.current}
                                    onChange={(e) => setExperienceForm({ ...experienceForm, current: e.target.checked })}
                                    className="h-5 w-5 text-primary-600 rounded"
                                />
                                <label htmlFor="current" className="ml-3 text-base text-gray-700 font-medium">
                                    I currently work here
                                </label>
                            </div>
                            <div>
                                <label className="label text-base">Description</label>
                                <textarea
                                    value={experienceForm.description}
                                    onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                                    rows="5"
                                    className="input-field text-base"
                                    placeholder="Describe your role and achievements..."
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="submit" variant="primary" className="flex-1 text-lg py-4">
                                    {editingExpId ? 'Save Changes' : 'Add Experience'}
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => setShowExpModal(false)} className="flex-1 text-lg py-4">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add/Edit Certification Modal */}
            {showCertModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl transform animate-slide-up">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-1 bg-gradient-to-b from-green-500 to-emerald-700 rounded-full"></div>
                            <h2 className="text-3xl font-black text-gray-900">{editingCertId ? 'Edit Certification' : 'Add Certification'}</h2>
                        </div>
                        <form onSubmit={handleSaveCertification} className="space-y-6">
                            <Input
                                label="Certificate Title"
                                value={certificationForm.title}
                                onChange={(e) => setCertificationForm({ ...certificationForm, title: e.target.value })}
                                required
                            />
                            <Input
                                label="Issued By"
                                value={certificationForm.issuedBy}
                                onChange={(e) => setCertificationForm({ ...certificationForm, issuedBy: e.target.value })}
                                required
                            />
                            <Input
                                label="Issued Date"
                                type="date"
                                value={certificationForm.issuedDate}
                                onChange={(e) => setCertificationForm({ ...certificationForm, issuedDate: e.target.value })}
                            />
                            <Input
                                label="Certificate URL (optional)"
                                value={certificationForm.certificateUrl}
                                onChange={(e) => setCertificationForm({ ...certificationForm, certificateUrl: e.target.value })}
                                placeholder="https://..."
                            />
                            <div className="flex gap-4 pt-4">
                                <Button type="submit" variant="primary" className="flex-1 text-lg py-4">
                                    {editingCertId ? 'Save Changes' : 'Add Certification'}
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => setShowCertModal(false)} className="flex-1 text-lg py-4">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default WorkerProfile;