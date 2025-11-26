import React, { useEffect, useState } from 'react';
import { workerAPI, uploadAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';

// Import new modular components
import ProfileHeader from '../../components/worker/profile/ProfileHeader';
import OverviewTab from '../../components/worker/profile/OverviewTab';
import PortfolioTab from '../../components/worker/profile/PortfolioTab';
import ReviewsTab from '../../components/worker/profile/ReviewsTab';
import ExperienceModal from '../../components/worker/profile/ExperienceModal';
import CertificationModal from '../../components/worker/profile/CertificationModal';
import { PageHeader } from '../../components/shared';
import { getWorkerBreadcrumbs } from '../../utils/breadcrumbUtils';

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
                {/* Breadcrumbs */}
                <PageHeader
                    breadcrumbs={getWorkerBreadcrumbs('profile')}
                />

                {/* Modern Header Section - Minimalist */}
                <ProfileHeader
                    profile={profile}
                    editing={editing}
                    setEditing={setEditing}
                    saving={saving}
                    handleSaveBasicInfo={handleSaveBasicInfo}
                    handleImageUpload={handleImageUpload}
                    handleDeleteProfilePicture={handleDeleteProfilePicture}
                    uploadingImage={uploadingImage}
                    basicInfo={basicInfo}
                    handleBasicInfoChange={handleBasicInfoChange}
                    uploadKey={uploadKey}
                />

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
                        <OverviewTab
                            profile={profile}
                            editing={editing}
                            basicInfo={basicInfo}
                            handleBasicInfoChange={handleBasicInfoChange}
                            skills={skills}
                            setSkills={setSkills}
                        />
                    )}

                    {activeTab === 'portfolio' && (
                        <PortfolioTab
                            profile={profile}
                            setEditingExpId={setEditingExpId}
                            setExperienceForm={setExperienceForm}
                            setShowExpModal={setShowExpModal}
                            handleEditExperience={handleEditExperience}
                            handleDeleteExperience={handleDeleteExperience}
                            setEditingCertId={setEditingCertId}
                            setCertificationForm={setCertificationForm}
                            setShowCertModal={setShowCertModal}
                            handleEditCertification={handleEditCertification}
                            handleDeleteCertification={handleDeleteCertification}
                        />
                    )}

                    {activeTab === 'reviews' && (
                        <ReviewsTab profile={profile} />
                    )}
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
            </div>
        </DashboardLayout>
    );
};

export default WorkerProfile;