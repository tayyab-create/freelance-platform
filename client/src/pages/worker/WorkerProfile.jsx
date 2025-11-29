import React, { useEffect, useState } from 'react';
import { workerAPI, uploadAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { toast } from '../../utils/toast';

// Import new modular components
import ProfileHeader from '../../components/worker/profile/ProfileHeader';
import OverviewTab from '../../components/worker/profile/OverviewTab';
import PortfolioTab from '../../components/worker/profile/PortfolioTab';
import ReviewsTab from '../../components/worker/profile/ReviewsTab';
import ExperienceModal from '../../components/worker/profile/ExperienceModal';
import CertificationModal from '../../components/worker/profile/CertificationModal';
import { PageHeader, DeleteConfirmationModal } from '../../components/shared';
import { getWorkerBreadcrumbs } from '../../utils/breadcrumbUtils';
import useUndo from '../../hooks/useUndo';

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
    const [showExpModal, setShowExpModal] = useState(false);
    const [showCertModal, setShowCertModal] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [resumeUploadProgress, setResumeUploadProgress] = useState(0);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);

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

    // Delete State
    const [itemToDelete, setItemToDelete] = useState(null);
    const { executeWithUndo } = useUndo();

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleImageUpload = async (file) => {
        if (!file) return;

        setUploadingImage(true);
        setUploadProgress(0);
        try {
            const response = await uploadAPI.uploadSingle(
                file,
                'profiles',
                (progress) => setUploadProgress(progress)
            );
            const imageUrl = `http://localhost:5000${response.data.data.fileUrl}`;

            // Update profile with new image URL
            await workerAPI.updateProfile({ profilePicture: imageUrl });
            toast.success('Profile picture updated!');
            fetchProfile();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to upload image';
            toast.error(errorMessage);
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
            const response = await uploadAPI.uploadSingle(
                file,
                'documents',
                (progress) => setResumeUploadProgress(progress)
            );
            const fileUrl = `http://localhost:5000${response.data.data.fileUrl}`;

            // Update basic info state immediately
            setBasicInfo(prev => ({ ...prev, resume: fileUrl }));
            toast.success('Resume uploaded!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to upload resume';
            toast.error(errorMessage);
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
            const response = await uploadAPI.uploadSingle(
                file,
                'worker-video',
                (progress) => setVideoUploadProgress(progress)
            );
            const fileUrl = `http://localhost:5000${response.data.data.fileUrl}`;

            // Update basic info state immediately
            setBasicInfo(prev => ({ ...prev, videoIntroduction: fileUrl }));
            toast.success('Video introduction uploaded!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to upload video';
            toast.error(errorMessage);
        } finally {
            setUploadingVideo(false);
            setVideoUploadProgress(0);
        }
    };

    const handleDeleteProfilePicture = () => {
        setItemToDelete({ type: 'profilePicture', name: 'Profile Picture' });
    };

    const handleDeleteResume = () => {
        setItemToDelete({ type: 'resume', name: 'Resume' });
    };

    const handleDeleteVideo = () => {
        setItemToDelete({ type: 'videoIntroduction', name: 'Video Introduction' });
    };

    const handleDeleteExperience = (id) => {
        const exp = profile.experience.find(e => e._id === id);
        setItemToDelete({ type: 'experience', id, name: exp?.title || 'Experience' });
    };

    const handleDeleteCertification = (id) => {
        const cert = profile.certifications.find(c => c._id === id);
        setItemToDelete({ type: 'certification', id, name: cert?.title || 'Certification' });
    };

    const handleDeleteConfirm = async () => {
        const item = itemToDelete;
        setItemToDelete(null);
        const previousProfile = { ...profile };

        // Optimistic Updates (Update UI immediately)
        if (item.type === 'profilePicture') {
            setProfile(prev => ({ ...prev, profilePicture: '' }));
        } else if (item.type === 'videoIntroduction') {
            setProfile(prev => ({ ...prev, videoIntroduction: '' }));
        } else if (item.type === 'experience') {
            setProfile(prev => ({
                ...prev,
                experience: prev.experience.filter(e => e._id !== item.id)
            }));
        } else if (item.type === 'certification') {
            setProfile(prev => ({
                ...prev,
                certifications: prev.certifications.filter(c => c._id !== item.id)
            }));
        }

        // Perform actual deletion immediately (No Undo delay)
        try {
            if (item.type === 'profilePicture') {
                await workerAPI.updateProfile({ profilePicture: '' });
            } else if (item.type === 'videoIntroduction') {
                await workerAPI.updateProfile({ videoIntroduction: '' });
            } else if (item.type === 'experience') {
                await workerAPI.deleteExperience(item.id);
            } else if (item.type === 'certification') {
                await workerAPI.deleteCertification(item.id);
            }

            toast.success(`${item.name} deleted`);
            fetchProfile(); // Sync with server
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error(`Failed to delete ${item.name}`);
            setProfile(previousProfile); // Revert UI on error
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

    const handleBasicInfoChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBasicInfo(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveBasicInfo = async () => {
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
                    uploadProgress={uploadProgress}
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
                            handleResumeUpload={handleResumeUpload}
                            uploadingResume={uploadingResume}
                            resumeUploadProgress={resumeUploadProgress}
                            handleDeleteResume={handleDeleteResume}
                            handleVideoUpload={handleVideoUpload}
                            uploadingVideo={uploadingVideo}
                            videoUploadProgress={videoUploadProgress}
                            handleDeleteVideo={handleDeleteVideo}
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

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={!!itemToDelete}
                    onClose={() => setItemToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    itemName={itemToDelete?.name}
                    itemType={
                        itemToDelete?.type === 'profilePicture' ? 'image' :
                            itemToDelete?.type === 'resume' ? 'document' :
                                itemToDelete?.type === 'videoIntroduction' ? 'video' :
                                    itemToDelete?.type
                    }
                />
            </div>
        </DashboardLayout>
    );
};

export default WorkerProfile;