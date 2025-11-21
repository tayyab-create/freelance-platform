import React, { useEffect, useState } from 'react';
import { workerAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FiEdit2, FiPlus, FiTrash2, FiSave, FiX, FiStar } from 'react-icons/fi';
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

    const handleAddExperience = async (e) => {
        e.preventDefault();
        try {
            await workerAPI.addExperience(experienceForm);
            toast.success('Experience added successfully!');
            setShowExpModal(false);
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
            toast.error('Failed to add experience');
        }
    };

    const handleAddCertification = async (e) => {
        e.preventDefault();
        try {
            await workerAPI.addCertification(certificationForm);
            toast.success('Certification added successfully!');
            setShowCertModal(false);
            setCertificationForm({
                title: '',
                issuedBy: '',
                issuedDate: '',
                certificateUrl: '',
            });
            fetchProfile();
        } catch (error) {
            toast.error('Failed to add certification');
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
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    {!editing ? (
                        <Button variant="primary" icon={FiEdit2} onClick={() => setEditing(true)}>
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="primary" icon={FiSave} onClick={handleSaveBasicInfo} loading={saving}>
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
                    {/* Profile Picture */}
                    {editing && (
                        <div className="mb-6">
                            <FileUpload
                                label="Profile Picture"
                                accept="image/*"
                                preview={true}
                                currentImage={profile?.profilePicture}
                                onFileSelect={handleImageUpload}
                                maxSize={5}
                            />
                            {uploadingImage && (
                                <p className="text-sm text-primary-600 mt-2">Uploading...</p>
                            )}
                        </div>
                    )}

                    {!editing && profile?.profilePicture && (
                        <div className="mb-6">
                            <label className="label">Profile Picture</label>
                            <img
                                src={profile.profilePicture}
                                alt="Profile"
                                className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300"
                            />
                        </div>
                    )}
                    <div className="space-y-4">
                        <Input
                            label="Full Name"
                            name="fullName"
                            value={basicInfo.fullName}
                            onChange={handleBasicInfoChange}
                            disabled={!editing}
                            required
                        />

                        <Input
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            value={basicInfo.phone}
                            onChange={handleBasicInfoChange}
                            disabled={!editing}
                        />

                        <div>
                            <label className="label">Bio</label>
                            <textarea
                                name="bio"
                                value={basicInfo.bio}
                                onChange={handleBasicInfoChange}
                                disabled={!editing}
                                rows="4"
                                className="input-field"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <Input
                            label="GitHub Profile"
                            name="githubProfile"
                            value={basicInfo.githubProfile}
                            onChange={handleBasicInfoChange}
                            disabled={!editing}
                            placeholder="https://github.com/username"
                        />

                        <Input
                            label="LinkedIn Profile"
                            name="linkedinProfile"
                            value={basicInfo.linkedinProfile}
                            onChange={handleBasicInfoChange}
                            disabled={!editing}
                            placeholder="https://linkedin.com/in/username"
                        />

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Hourly Rate ($)"
                                name="hourlyRate"
                                type="number"
                                value={basicInfo.hourlyRate}
                                onChange={handleBasicInfoChange}
                                disabled={!editing}
                            />

                            <div>
                                <label className="label">Availability</label>
                                <select
                                    name="availability"
                                    value={basicInfo.availability}
                                    onChange={handleBasicInfoChange}
                                    disabled={!editing}
                                    className="input-field"
                                >
                                    <option value="available">Available</option>
                                    <option value="busy">Busy</option>
                                    <option value="not-available">Not Available</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="label">Skills (comma-separated)</label>
                            <input
                                type="text"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                disabled={!editing}
                                className="input-field"
                                placeholder="React, Node.js, MongoDB, etc."
                            />
                        </div>
                    </div>
                </div>

                {/* Skills Display */}
                {profile?.skills && profile.skills.length > 0 && (
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, index) => (
                                <span key={index} className="badge badge-info">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Experience Section */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Experience</h2>
                        <Button variant="primary" icon={FiPlus} onClick={() => setShowExpModal(true)}>
                            Add Experience
                        </Button>
                    </div>

                    {profile?.experience && profile.experience.length > 0 ? (
                        <div className="space-y-4">
                            {profile.experience.map((exp, index) => (
                                <div key={index} className="border-l-4 border-primary-600 pl-4 py-2">
                                    <h3 className="font-bold text-lg">{exp.title}</h3>
                                    <p className="text-gray-600">{exp.company}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(exp.startDate).toLocaleDateString()} -
                                        {exp.current ? ' Present' : ` ${new Date(exp.endDate).toLocaleDateString()}`}
                                    </p>
                                    {exp.description && (
                                        <p className="text-gray-700 mt-2">{exp.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No experience added yet</p>
                    )}
                </div>

                {/* Certifications Section */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Certifications</h2>
                        <Button variant="primary" icon={FiPlus} onClick={() => setShowCertModal(true)}>
                            Add Certification
                        </Button>
                    </div>

                    {profile?.certifications && profile.certifications.length > 0 ? (
                        <div className="space-y-4">
                            {profile.certifications.map((cert, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <h3 className="font-bold text-lg">{cert.title}</h3>
                                    <p className="text-gray-600">{cert.issuedBy}</p>
                                    <p className="text-sm text-gray-500">
                                        Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                                    </p>
                                    {cert.certificateUrl && (
                                        <a
                                            href={cert.certificateUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-600 hover:underline text-sm mt-2 inline-block"
                                        >
                                            View Certificate →
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No certifications added yet</p>
                    )}
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4">
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
                    <div className="card text-center">
                        <p className="text-gray-600">Total Reviews</p>
                        <p className="text-3xl font-bold text-primary-600">{profile?.totalReviews || 0}</p>
                    </div>
                </div>
            </div>

            {/* Add Experience Modal */}
            {showExpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Add Experience</h2>
                        <form onSubmit={handleAddExperience} className="space-y-4">
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
                                    className="h-4 w-4 text-primary-600 rounded"
                                />
                                <label htmlFor="current" className="ml-2 text-sm text-gray-700">
                                    I currently work here
                                </label>
                            </div>
                            <div>
                                <label className="label">Description</label>
                                <textarea
                                    value={experienceForm.description}
                                    onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                                    rows="4"
                                    className="input-field"
                                />
                            </div>
                            <div className="flex gap-4">
                                <Button type="submit" variant="primary">Add Experience</Button>
                                <Button type="button" variant="secondary" onClick={() => setShowExpModal(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Certification Modal */}
            {showCertModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                        <h2 className="text-2xl font-bold mb-4">Add Certification</h2>
                        <form onSubmit={handleAddCertification} className="space-y-4">
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
                            <div className="flex gap-4">
                                <Button type="submit" variant="primary">Add Certification</Button>
                                <Button type="button" variant="secondary" onClick={() => setShowCertModal(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Reviews Section */}
<div className="card">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">Recent Reviews</h2>
    <Link to="/worker/reviews" className="text-primary-600 hover:text-primary-700 text-sm">
      View All →
    </Link>
  </div>
  
  {profile?.totalReviews > 0 ? (
    <div className="flex items-center gap-4 mb-4">
      <div className="text-center">
        <p className="text-4xl font-bold text-primary-600">
          {profile.averageRating?.toFixed(1)}
        </p>
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FiStar
              key={star}
              className={`h-4 w-4 ${
                star <= Math.round(profile.averageRating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">{profile.totalReviews} reviews</p>
      </div>
    </div>
  ) : (
    <p className="text-gray-500 text-center py-8">No reviews yet</p>
  )}
</div>
        </DashboardLayout>
    );
};

export default WorkerProfile;