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

                {/* Profile Picture & Basic Info */}
                <div className="card">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <img
                                    src={profile?.profilePicture || 'https://via.placeholder.com/150'}
                                    alt="Profile"
                                    className="h-32 w-32 rounded-full object-cover border-4 border-gray-100"
                                />
                                {editing && (
                                    <div className="mt-3">
                                        <FileUpload
                                            onFileSelect={handleImageUpload}
                                            accept="image/*"
                                            loading={uploadingImage}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 space-y-4">
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
                                        <label className="label">Bio</label>
                                        <textarea
                                            name="bio"
                                            value={basicInfo.bio}
                                            onChange={handleBasicInfoChange}
                                            className="input-field"
                                            rows="3"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <h2 className="text-2xl font-bold">{profile?.fullName}</h2>
                                        {profile?.phone && <p className="text-gray-600">{profile.phone}</p>}
                                    </div>
                                    {profile?.bio && (
                                        <p className="text-gray-700">{profile.bio}</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Skills</h2>
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
                                    <span key={index} className="badge badge-primary">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500">No skills added yet</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Hourly Rate & Availability */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="card">
                        <h3 className="font-bold mb-2">Hourly Rate</h3>
                        {editing ? (
                            <Input
                                type="number"
                                name="hourlyRate"
                                value={basicInfo.hourlyRate}
                                onChange={handleBasicInfoChange}
                                placeholder="50"
                            />
                        ) : (
                            <p className="text-2xl font-bold text-primary-600">
                                ${profile?.hourlyRate || 0}/hr
                            </p>
                        )}
                    </div>
                    <div className="card">
                        <h3 className="font-bold mb-2">Availability</h3>
                        {editing ? (
                            <select
                                name="availability"
                                value={basicInfo.availability}
                                onChange={handleBasicInfoChange}
                                className="input-field"
                            >
                                <option value="available">Available</option>
                                <option value="busy">Busy</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                        ) : (
                            <span
                                className={`badge ${profile?.availability === 'available'
                                    ? 'badge-success'
                                    : profile?.availability === 'busy'
                                        ? 'badge-warning'
                                        : 'badge-error'
                                    }`}
                            >
                                {profile?.availability || 'Not set'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Social Links */}
                {editing && (
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Social Links</h2>
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
                    </div>
                )}

                {!editing && (profile?.githubProfile || profile?.linkedinProfile) && (
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Social Links</h2>
                        <div className="flex gap-4">
                            {profile?.githubProfile && (
                                <a
                                    href={profile.githubProfile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:underline"
                                >
                                    GitHub →
                                </a>
                            )}
                            {profile?.linkedinProfile && (
                                <a
                                    href={profile.linkedinProfile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:underline"
                                >
                                    LinkedIn →
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Experience */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Experience</h2>
                        <Button variant="primary" size="sm" icon={FiPlus} onClick={() => setShowExpModal(true)}>
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
                                        {new Date(exp.startDate).toLocaleDateString()} -{' '}
                                        {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                                    </p>
                                    {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No experience added yet</p>
                    )}
                </div>

                {/* Certifications */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Certifications</h2>
                        <Button variant="primary" size="sm" icon={FiPlus} onClick={() => setShowCertModal(true)}>
                            Add Certification
                        </Button>
                    </div>
                    {profile?.certifications && profile.certifications.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            {profile.certifications.map((cert, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-bold text-lg">{cert.title}</h3>
                                    <p className="text-gray-600">{cert.issuedBy}</p>
                                    <p className="text-sm text-gray-500">
                                        Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                                    </p>
                                    {cert.certificateUrl && (
                                        <a  // <--- You are missing this opening tag in your screenshot
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

                {/* Reviews Section - FIXED VERSION */}
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Recent Reviews</h2>
                        <Link to="/worker/reviews" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            View All Reviews →
                        </Link>
                    </div>

                    {profile?.totalReviews > 0 && profile?.recentReviews && profile.recentReviews.length > 0 ? (
                        <div className="space-y-6">
                            {/* Overall Rating Summary */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-gray-200">
                                <div className="text-center md:text-left">
                                    <p className="text-5xl font-bold text-primary-600 mb-2">
                                        {profile.averageRating?.toFixed(1) || '0.0'}
                                    </p>
                                    <div className="flex items-center gap-1 justify-center md:justify-start mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FiStar
                                                key={star}
                                                className={`h-5 w-5 ${star <= Math.round(profile.averageRating)
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600">{profile.totalReviews} reviews</p>
                                </div>

                                <div className="flex-1 w-full">
                                    <p className="text-gray-700 mb-3 text-sm font-medium">Rating Distribution</p>
                                    {[5, 4, 3, 2, 1].map((rating) => {
                                        const count = profile.recentReviews.filter(r => r.rating === rating).length;
                                        const percentage = profile.totalReviews > 0 ? (count / profile.totalReviews) * 100 : 0;
                                        return (
                                            <div key={rating} className="flex items-center gap-3 mb-2">
                                                <div className="flex items-center gap-1 w-16">
                                                    <span className="text-sm font-medium text-gray-700">{rating}</span>
                                                    <FiStar className="h-3 w-3 text-yellow-400 fill-current" />
                                                </div>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-primary-600 h-full rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-600 w-8 text-right">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recent Reviews List */}
                            <div className="space-y-4">
                                {profile.recentReviews.slice(0, 3).map((review, index) => (
                                    <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                        {/* Review Header */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                {review.companyLogo ? (
                                                    <img
                                                        src={review.companyLogo}
                                                        alt={review.companyName}
                                                        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-primary-600 font-semibold text-sm">
                                                            {review.companyName?.charAt(0) || 'C'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {review.companyName || 'Anonymous Client'}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
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
                                                        className={`h-4 w-4 ${star <= review.rating
                                                                ? 'text-yellow-400 fill-current'
                                                                : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Job Title */}
                                        {review.jobTitle && review.jobTitle !== 'N/A' && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                Project: <span className="font-medium text-gray-900">{review.jobTitle}</span>
                                            </p>
                                        )}

                                        {/* Review Text */}
                                        <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                            {review.reviewText}
                                        </p>

                                        {/* Tags and Badges */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {review.tags && review.tags.length > 0 && (
                                                <>
                                                    {review.tags.slice(0, 3).map((tag, idx) => (
                                                        <span key={idx} className="badge badge-info text-xs">
                                                            {tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                        </span>
                                                    ))}
                                                </>
                                            )}
                                            {review.wouldHireAgain && (
                                                <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
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
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                                <FiStar className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 mb-2 font-medium">No reviews yet</p>
                            <p className="text-sm text-gray-500">
                                Complete jobs to receive reviews from clients
                            </p>
                        </div>
                    )}
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
        </DashboardLayout>
    );
};

export default WorkerProfile;