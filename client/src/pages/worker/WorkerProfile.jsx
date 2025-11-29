import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { workerAPI, uploadAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import Input from '../../components/common/Input';
import {
    FiEdit2, FiSave, FiX, FiTrash2, FiBriefcase, FiCheckCircle, FiStar,
    FiMapPin, FiGlobe, FiLinkedin, FiUsers, FiMail, FiPhone,
    FiCalendar, FiShield, FiVideo, FiFacebook, FiInstagram, FiTwitter, FiLink, FiAward,
    FiMessageSquare, FiPlayCircle, FiExternalLink, FiFileText, FiShare2, FiDollarSign, FiUploadCloud, FiEye, FiPlus
} from 'react-icons/fi';
import { SiGithub, SiBehance, SiDribbble, SiStackoverflow } from 'react-icons/si';
import { toast } from '../../utils/toast';
import FileUpload from '../../components/common/FileUpload';
import { PageHeader, DeleteConfirmationModal, Select, Avatar, CustomVideoPlayer } from '../../components/shared';
import TagInput from '../../components/common/TagInput';
import { getWorkerBreadcrumbs } from '../../utils/breadcrumbUtils';
import useUndo from '../../hooks/useUndo';
import InfoCard from '../../components/company/InfoCard'; // Reusing generic InfoCard
import ExperienceModal from '../../components/worker/profile/ExperienceModal';
import CertificationModal from '../../components/worker/profile/CertificationModal';

const WorkerProfile = () => {
    const { user } = useSelector((state) => state.auth);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Upload States
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [resumeUploadProgress, setResumeUploadProgress] = useState(0);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);
    const [uploadKey, setUploadKey] = useState(0);

    // Modals
    const [showExpModal, setShowExpModal] = useState(false);
    const [showCertModal, setShowCertModal] = useState(false);
    const [editingExpId, setEditingExpId] = useState(null);
    const [editingCertId, setEditingCertId] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Forms
    const [basicInfo, setBasicInfo] = useState({
        fullName: '',
        phone: '',
        bio: '',
        location: '',
        website: '',
        githubProfile: '',
        linkedinProfile: '',
        twitterProfile: '',
        dribbbleProfile: '',
        behanceProfile: '',
        instagramProfile: '',
        stackoverflowProfile: '',
        hourlyRate: '',
        availability: 'available',
        willingToRelocate: false,
        expectedSalaryMin: '',
        expectedSalaryMax: '',
        expectedSalaryCurrency: 'USD',
        preferredJobTypes: [],
        resume: '',
        videoIntroduction: '',
        portfolioLinks: [],
    });

    const [skills, setSkills] = useState([]);
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

    const { executeWithUndo } = useUndo();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await workerAPI.getProfile();
            const profileData = response.data.data;
            setProfile(profileData);

            setBasicInfo({
                fullName: profileData.fullName || '',
                phone: profileData.phone || '',
                bio: profileData.bio || '',
                location: profileData.location || '',
                website: profileData.website || '',
                githubProfile: profileData.githubProfile || '',
                linkedinProfile: profileData.linkedinProfile || '',
                twitterProfile: profileData.twitterProfile || '',
                dribbbleProfile: profileData.dribbbleProfile || '',
                behanceProfile: profileData.behanceProfile || '',
                instagramProfile: profileData.instagramProfile || '',
                stackoverflowProfile: profileData.stackoverflowProfile || '',
                hourlyRate: profileData.hourlyRate || '',
                availability: profileData.availability || 'available',
                willingToRelocate: profileData.willingToRelocate || false,
                expectedSalaryMin: profileData.expectedSalary?.min || '',
                expectedSalaryMax: profileData.expectedSalary?.max || '',
                expectedSalaryCurrency: profileData.expectedSalary?.currency || 'USD',
                preferredJobTypes: profileData.preferredJobTypes || [],
                resume: profileData.resume || '',
                videoIntroduction: profileData.videoIntroduction || '',
                portfolioLinks: profileData.portfolioLinks || [],
            });
            setSkills(profileData.skills || []);
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    // --- Upload Handlers ---

    const handleImageUpload = async (file) => {
        if (!file) return;
        setUploadingImage(true);
        setUploadProgress(0);
        try {
            const response = await uploadAPI.uploadSingle(file, 'profiles', (p) => setUploadProgress(p));
            const imageUrl = `http://localhost:5000${response.data.data.fileUrl}`;
            await workerAPI.updateProfile({ profilePicture: imageUrl });
            toast.success('Profile picture updated!');
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploadingImage(false);
            setUploadProgress(0);
            setUploadKey(prev => prev + 1);
        }
    };

    const handleResumeUpload = async (file) => {
        if (!file) return;
        setUploadingResume(true);
        setResumeUploadProgress(0);
        try {
            const response = await uploadAPI.uploadSingle(file, 'documents', (p) => setResumeUploadProgress(p));
            const fileUrl = `http://localhost:5000${response.data.data.fileUrl}`;
            setBasicInfo(prev => ({ ...prev, resume: fileUrl }));
            toast.success('Resume uploaded! Click Save to apply.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload resume');
        } finally {
            setUploadingResume(false);
            setResumeUploadProgress(0);
        }
    };

    const handleVideoUpload = async (file) => {
        if (!file) return;
        setUploadingVideo(true);
        setVideoUploadProgress(0);
        try {
            const response = await uploadAPI.uploadSingle(file, 'worker-video', (p) => setVideoUploadProgress(p));
            const fileUrl = `http://localhost:5000${response.data.data.fileUrl}`;
            setBasicInfo(prev => ({ ...prev, videoIntroduction: fileUrl }));
            toast.success('Video uploaded! Click Save to apply.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload video');
        } finally {
            setUploadingVideo(false);
            setVideoUploadProgress(0);
        }
    };

    // --- Delete Handlers ---

    const handleDeleteClick = (type, id = null, name = '') => {
        setItemToDelete({ type, id, name });
    };

    const handleDeleteConfirm = async () => {
        const item = itemToDelete;
        setItemToDelete(null);
        const previousProfile = { ...profile };

        // Optimistic UI Update
        if (item.type === 'profilePicture') setProfile(prev => ({ ...prev, profilePicture: '' }));
        else if (item.type === 'resume') setBasicInfo(prev => ({ ...prev, resume: '' })); // Update form state too
        else if (item.type === 'videoIntroduction') setBasicInfo(prev => ({ ...prev, videoIntroduction: '' }));
        else if (item.type === 'experience') setProfile(prev => ({ ...prev, experience: prev.experience.filter(e => e._id !== item.id) }));
        else if (item.type === 'certification') setProfile(prev => ({ ...prev, certifications: prev.certifications.filter(c => c._id !== item.id) }));

        try {
            if (item.type === 'profilePicture') await workerAPI.updateProfile({ profilePicture: '' });
            else if (item.type === 'resume') await workerAPI.updateProfile({ resume: '' });
            else if (item.type === 'videoIntroduction') await workerAPI.updateProfile({ videoIntroduction: '' });
            else if (item.type === 'experience') await workerAPI.deleteExperience(item.id);
            else if (item.type === 'certification') await workerAPI.deleteCertification(item.id);

            toast.success(`${item.name} deleted`);
            fetchProfile();
        } catch (error) {
            toast.error(`Failed to delete ${item.name}`);
            setProfile(previousProfile);
        }
    };

    // --- Form Handlers ---

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBasicInfo(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePortfolioLinkChange = (index, value) => {
        const newLinks = [...basicInfo.portfolioLinks];
        newLinks[index] = value;
        setBasicInfo(prev => ({ ...prev, portfolioLinks: newLinks }));
    };

    const handleAddPortfolioLink = () => {
        setBasicInfo(prev => ({ ...prev, portfolioLinks: [...prev.portfolioLinks, ''] }));
    };

    const handleRemovePortfolioLink = (index) => {
        const newLinks = basicInfo.portfolioLinks.filter((_, i) => i !== index);
        setBasicInfo(prev => ({ ...prev, portfolioLinks: newLinks }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updateData = {
                ...basicInfo,
                skills: skills,
                expectedSalary: {
                    min: basicInfo.expectedSalaryMin,
                    max: basicInfo.expectedSalaryMax,
                    currency: basicInfo.expectedSalaryCurrency
                }
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

    // --- Experience & Certification Modal Handlers ---

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

    const handleSaveExperience = async (e) => {
        e.preventDefault();
        try {
            if (editingExpId) {
                await workerAPI.updateExperience(editingExpId, experienceForm);
                toast.success('Experience updated!');
            } else {
                await workerAPI.addExperience(experienceForm);
                toast.success('Experience added!');
            }
            setShowExpModal(false);
            setEditingExpId(null);
            fetchProfile();
        } catch (error) {
            toast.error('Failed to save experience');
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

    const handleSaveCertification = async (e) => {
        e.preventDefault();
        try {
            if (editingCertId) {
                await workerAPI.updateCertification(editingCertId, certificationForm);
                toast.success('Certification updated!');
            } else {
                await workerAPI.addCertification(certificationForm);
                toast.success('Certification added!');
            }
            setShowCertModal(false);
            setEditingCertId(null);
            fetchProfile();
        } catch (error) {
            toast.error('Failed to save certification');
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
                <PageHeader breadcrumbs={getWorkerBreadcrumbs('profile')} />

                {/* HEADER CARD */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Profile Picture */}
                        <div className="relative group">
                            {editing ? (
                                <FileUpload
                                    key={uploadKey}
                                    onFileSelect={handleImageUpload}
                                    accept="image/*"
                                    isUploading={uploadingImage}
                                    uploadProgress={uploadProgress}
                                    showProgress={true}
                                >
                                    <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 p-2 shrink-0 cursor-pointer hover:border-slate-300 transition-all flex items-center justify-center overflow-hidden">
                                        <Avatar
                                            src={profile?.profilePicture || user?.avatar}
                                            name={profile?.fullName || user?.name}
                                            size="custom"
                                            className="w-full h-full rounded-xl !border-0 !shadow-none !bg-transparent"
                                            shape="rounded-xl"
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
                                <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                                    <Avatar
                                        src={profile?.profilePicture || user?.avatar}
                                        name={profile?.fullName || user?.name}
                                        size="custom"
                                        className="w-full h-full rounded-xl !border-0 !shadow-none !bg-transparent"
                                        shape="rounded-xl"
                                    />
                                </div>
                            )}
                            {editing && profile?.profilePicture && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick('profilePicture', null, 'Profile Picture'); }}
                                    className="absolute -top-1 -right-1 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-30"
                                    title="Remove Picture"
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
                                        label="Full Name"
                                        name="fullName"
                                        value={basicInfo.fullName}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                    />
                                    <Input
                                        label="Location"
                                        name="location"
                                        value={basicInfo.location}
                                        onChange={handleChange}
                                        placeholder="New York, USA"
                                        icon={FiMapPin}
                                    />
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                        <h1 className="text-2xl font-bold text-slate-900">{profile?.fullName}</h1>
                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100 w-fit">
                                            Verified Worker
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                                        <FiMapPin className="w-4 h-4" />
                                        <span>{profile?.location || 'Location not set'}</span>
                                    </div>
                                </div>
                            )}

                            {/* Social Links */}
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                {profile?.website && (
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                                        <FiGlobe className="w-4 h-4" />
                                        <span>Website</span>
                                    </a>
                                )}
                                <div className="flex gap-3 pl-2 border-l border-slate-200 ml-1">
                                    {profile?.linkedinProfile && <a href={profile.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600"><FiLinkedin className="w-4 h-4" /></a>}
                                    {profile?.githubProfile && <a href={profile.githubProfile} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900"><SiGithub className="w-4 h-4" /></a>}
                                    {profile?.twitterProfile && <a href={profile.twitterProfile} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400"><FiTwitter className="w-4 h-4" /></a>}
                                    {profile?.dribbbleProfile && <a href={profile.dribbbleProfile} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500"><SiDribbble className="w-4 h-4" /></a>}
                                    {profile?.behanceProfile && <a href={profile.behanceProfile} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-700"><SiBehance className="w-4 h-4" /></a>}
                                    {profile?.stackoverflowProfile && <a href={profile.stackoverflowProfile} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-orange-500"><SiStackoverflow className="w-4 h-4" /></a>}
                                    {profile?.instagramProfile && <a href={profile.instagramProfile} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600"><FiInstagram className="w-4 h-4" /></a>}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {editing ? (
                                <>
                                    <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
                                    <Button onClick={handleSave} loading={saving} icon={FiSave}>Save Changes</Button>
                                </>
                            ) : (
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
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><FiCheckCircle className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-slate-900">{profile?.totalJobsCompleted || 0}</span>
                            <p className="text-xs text-slate-500 font-medium mt-1">Jobs Completed</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-amber-50 text-amber-500"><FiStar className="w-5 h-5" /></div>
                            <span className="text-xs text-slate-400 font-medium">Average</span>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-slate-900">{profile?.averageRating?.toFixed(1) || '0.0'}</span>
                            <p className="text-xs text-slate-500 font-medium mt-1">Rating</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><FiMessageSquare className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-slate-900">{profile?.totalReviews || 0}</span>
                            <p className="text-xs text-slate-500 font-medium mt-1">Reviews</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-green-50 text-green-600"><FiDollarSign className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-slate-900">${profile?.hourlyRate || 0}</span>
                            <p className="text-xs text-slate-500 font-medium mt-1">Hourly Rate</p>
                        </div>
                    </div>
                </div>

                {/* CONTENT COLUMNS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN (Main Info) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Bio Section */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FiBriefcase className="text-blue-600" />
                                About Me
                            </h2>
                            {editing ? (
                                <Textarea
                                    label="Bio"
                                    name="bio"
                                    value={basicInfo.bio}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {profile?.bio || 'No bio added yet.'}
                                </p>
                            )}
                        </div>

                        {/* Skills Section */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FiStar className="text-yellow-500" />
                                Skills
                            </h2>
                            {editing ? (
                                <TagInput
                                    label="Add Skills"
                                    value={skills}
                                    onChange={setSkills}
                                    placeholder="Type skill..."
                                />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {profile?.skills?.length > 0 ? (
                                        profile.skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-slate-50 text-slate-700 border border-slate-200">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-sm italic">No skills added.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Experience Section */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <FiBriefcase className="text-purple-600" />
                                    Experience
                                </h2>
                                <button onClick={() => { setEditingExpId(null); setExperienceForm({ title: '', company: '', startDate: '', endDate: '', current: false, description: '' }); setShowExpModal(true); }} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                                    <FiPlus /> Add Experience
                                </button>
                            </div>
                            <div className="space-y-6">
                                {profile?.experience?.length > 0 ? (
                                    profile.experience.map((exp) => (
                                        <div key={exp._id} className="relative pl-6 border-l-2 border-slate-100 last:border-0 pb-6 last:pb-0">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{exp.title}</h3>
                                                    <p className="text-sm text-slate-600 font-medium">{exp.company}</p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                                                    </p>
                                                    {exp.description && <p className="text-sm text-slate-500 mt-2">{exp.description}</p>}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditExperience(exp)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteClick('experience', exp._id, exp.title)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-sm italic">No experience added.</p>
                                )}
                            </div>
                        </div>

                        {/* Certifications Section */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <FiAward className="text-orange-500" />
                                    Certifications
                                </h2>
                                <button onClick={() => { setEditingCertId(null); setCertificationForm({ title: '', issuedBy: '', issuedDate: '', certificateUrl: '' }); setShowCertModal(true); }} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                                    <FiPlus /> Add Certification
                                </button>
                            </div>
                            <div className="space-y-4">
                                {profile?.certifications?.length > 0 ? (
                                    profile.certifications.map((cert) => (
                                        <div key={cert._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white rounded-lg border border-slate-200 text-orange-500">
                                                    <FiAward className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{cert.title}</h3>
                                                    <p className="text-sm text-slate-600">{cert.issuedBy}</p>
                                                    <p className="text-xs text-slate-400">{new Date(cert.issuedDate).toLocaleDateString()}</p>
                                                    {cert.certificateUrl && (
                                                        <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">View Certificate</a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditCertification(cert)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteClick('certification', cert._id, cert.title)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-sm italic">No certifications added.</p>
                                )}
                            </div>
                        </div>

                        {/* Video Introduction */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FiVideo className="text-red-500" />
                                Video Introduction
                            </h2>
                            {editing ? (
                                <FileUpload
                                    name="videoIntroduction"
                                    accept="video/*"
                                    value={basicInfo.videoIntroduction}
                                    onFileSelect={handleVideoUpload}
                                    helperText="MP4, MOV (max 50MB)"
                                    maxSize={50}
                                    isUploading={uploadingVideo}
                                    uploadProgress={videoUploadProgress}
                                />
                            ) : (
                                <>
                                    {profile?.videoIntroduction ? (
                                        <CustomVideoPlayer src={profile.videoIntroduction} className="w-full aspect-video rounded-xl shadow-sm" />
                                    ) : (
                                        <div className="w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center border border-dashed border-slate-300">
                                            <div className="text-center">
                                                <FiPlayCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                                <p className="text-sm text-slate-500 font-medium">No video uploaded</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Resume Section */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FiFileText className="text-blue-500" />
                                Resume
                            </h2>
                            {editing ? (
                                <FileUpload
                                    name="resume"
                                    accept=".pdf,.doc,.docx"
                                    value={basicInfo.resume}
                                    onFileSelect={handleResumeUpload}
                                    helperText="PDF, DOC, DOCX (max 5MB)"
                                    maxSize={5}
                                    isUploading={uploadingResume}
                                    uploadProgress={resumeUploadProgress}
                                />
                            ) : (
                                <>
                                    {profile?.resume ? (
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <FiFileText className="w-8 h-8 text-blue-500" />
                                                <div>
                                                    <p className="font-medium text-slate-900">Resume</p>
                                                    <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View Document</a>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-sm italic">No resume uploaded.</p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Portfolio Links */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <FiLink className="text-green-500" />
                                    Portfolio Links
                                </h2>
                                {editing && (
                                    <button onClick={handleAddPortfolioLink} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                                        <FiPlus /> Add Link
                                    </button>
                                )}
                            </div>
                            {editing ? (
                                <div className="space-y-3">
                                    {basicInfo.portfolioLinks.map((link, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input
                                                value={link}
                                                onChange={(e) => handlePortfolioLinkChange(idx, e.target.value)}
                                                placeholder="https://portfolio.com/project"
                                            />
                                            <button onClick={() => handleRemovePortfolioLink(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {profile?.portfolioLinks?.length > 0 ? (
                                        profile.portfolioLinks.map((link, idx) => (
                                            <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline p-2 hover:bg-blue-50 rounded-lg transition-colors">
                                                <FiExternalLink className="w-4 h-4" />
                                                <span className="truncate">{link}</span>
                                            </a>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-sm italic">No portfolio links added.</p>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN (Sidebar Info) */}
                    <div className="space-y-6">

                        {/* Availability & Contact */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FiUsers className="text-purple-600" />
                                Availability & Contact
                            </h3>
                            {editing ? (
                                <div className="space-y-4">
                                    <Select
                                        label="Availability"
                                        name="availability"
                                        value={basicInfo.availability}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'available', label: 'Available' },
                                            { value: 'busy', label: 'Busy' },
                                            { value: 'not-available', label: 'Unavailable' }
                                        ]}
                                    />
                                    <Input label="Phone" name="phone" value={basicInfo.phone} onChange={handleChange} icon={FiPhone} />
                                    <Input label="Hourly Rate ($)" name="hourlyRate" type="number" value={basicInfo.hourlyRate} onChange={handleChange} icon={FiDollarSign} />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <InfoCard icon={FiCheckCircle} label="Availability" value={profile?.availability} />
                                    <InfoCard icon={FiPhone} label="Phone" value={profile?.phone || 'Not set'} />
                                    <InfoCard icon={FiMail} label="Email" value={user?.email} />
                                    <InfoCard icon={FiDollarSign} label="Hourly Rate" value={profile?.hourlyRate ? `$${profile.hourlyRate}/hr` : 'Not set'} />
                                </div>
                            )}
                        </div>

                        {/* Job Preferences */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FiBriefcase className="text-green-600" />
                                Job Preferences
                            </h3>
                            {editing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Job Types</label>
                                        <div className="space-y-2">
                                            {['full-time', 'part-time', 'contract', 'freelance'].map(type => (
                                                <label key={type} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={basicInfo.preferredJobTypes.includes(type)}
                                                        onChange={(e) => {
                                                            const newTypes = e.target.checked
                                                                ? [...basicInfo.preferredJobTypes, type]
                                                                : basicInfo.preferredJobTypes.filter(t => t !== type);
                                                            setBasicInfo(prev => ({ ...prev, preferredJobTypes: newTypes }));
                                                        }}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="capitalize">{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="willingToRelocate"
                                            checked={basicInfo.willingToRelocate}
                                            onChange={handleChange}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Willing to Relocate</span>
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Job Types</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile?.preferredJobTypes?.length > 0 ? (
                                                profile.preferredJobTypes.map(type => (
                                                    <span key={type} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded capitalize">{type}</span>
                                                ))
                                            ) : <span className="text-sm text-slate-500">Not specified</span>}
                                        </div>
                                    </div>
                                    <InfoCard icon={FiMapPin} label="Relocation" value={profile?.willingToRelocate ? 'Yes' : 'No'} />
                                </div>
                            )}
                        </div>

                        {/* Expected Salary */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FiDollarSign className="text-emerald-600" />
                                Expected Salary
                            </h3>
                            {editing ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <Input label="Min" name="expectedSalaryMin" type="number" value={basicInfo.expectedSalaryMin} onChange={handleChange} />
                                    <Input label="Max" name="expectedSalaryMax" type="number" value={basicInfo.expectedSalaryMax} onChange={handleChange} />
                                    <div className="col-span-2">
                                        <Select
                                            label="Currency"
                                            name="expectedSalaryCurrency"
                                            value={basicInfo.expectedSalaryCurrency}
                                            onChange={handleChange}
                                            options={[{ value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }, { value: 'GBP', label: 'GBP' }]}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {profile?.expectedSalary?.min && profile?.expectedSalary?.max
                                            ? `${profile.expectedSalary.currency} ${profile.expectedSalary.min} - ${profile.expectedSalary.max}`
                                            : 'Not specified'}
                                    </p>
                                    <p className="text-xs text-slate-500">Annual Salary</p>
                                </div>
                            )}
                        </div>

                        {/* Social Profiles Edit (Sidebar) */}
                        {editing && (
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <h3 className="text-base font-bold text-slate-900 mb-4">Social Profiles</h3>
                                <div className="space-y-3">
                                    <Input label="Website" name="website" value={basicInfo.website} onChange={handleChange} icon={FiGlobe} />
                                    <Input label="LinkedIn" name="linkedinProfile" value={basicInfo.linkedinProfile} onChange={handleChange} icon={FiLinkedin} />
                                    <Input label="GitHub" name="githubProfile" value={basicInfo.githubProfile} onChange={handleChange} icon={SiGithub} />
                                    <Input label="Twitter" name="twitterProfile" value={basicInfo.twitterProfile} onChange={handleChange} icon={FiTwitter} />
                                    <Input label="Dribbble" name="dribbbleProfile" value={basicInfo.dribbbleProfile} onChange={handleChange} icon={SiDribbble} />
                                    <Input label="Behance" name="behanceProfile" value={basicInfo.behanceProfile} onChange={handleChange} icon={SiBehance} />
                                    <Input label="Instagram" name="instagramProfile" value={basicInfo.instagramProfile} onChange={handleChange} icon={FiInstagram} />
                                    <Input label="StackOverflow" name="stackoverflowProfile" value={basicInfo.stackoverflowProfile} onChange={handleChange} icon={SiStackoverflow} />
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Modals */}
                <ExperienceModal
                    showExpModal={showExpModal}
                    setShowExpModal={setShowExpModal}
                    editingExpId={editingExpId}
                    experienceForm={experienceForm}
                    setExperienceForm={setExperienceForm}
                    handleSaveExperience={handleSaveExperience}
                />

                <CertificationModal
                    showCertModal={showCertModal}
                    setShowCertModal={setShowCertModal}
                    editingCertId={editingCertId}
                    certificationForm={certificationForm}
                    setCertificationForm={setCertificationForm}
                    handleSaveCertification={handleSaveCertification}
                />

                <DeleteConfirmationModal
                    isOpen={!!itemToDelete}
                    onClose={() => setItemToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    itemName={itemToDelete?.name}
                    itemType={itemToDelete?.type === 'profilePicture' ? 'image' : itemToDelete?.type === 'resume' ? 'document' : itemToDelete?.type === 'videoIntroduction' ? 'video' : 'item'}
                />
            </div>
        </DashboardLayout>
    );
};

export default WorkerProfile;