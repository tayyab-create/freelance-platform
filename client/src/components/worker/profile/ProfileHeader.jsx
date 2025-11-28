import React from 'react';
import { FiEdit2, FiSave, FiX, FiUser, FiTrash2, FiPhone, FiMail, FiMapPin, FiDollarSign } from 'react-icons/fi';
import FileUpload from '../../common/FileUpload';
import Spinner from '../../common/Spinner';
import { ExpandableText } from '../../shared';
import Textarea from '../../common/Textarea';

const ProfileHeader = ({
    profile,
    editing,
    setEditing,
    saving,
    handleSaveBasicInfo,
    handleImageUpload,
    handleDeleteProfilePicture,
    uploadingImage,
    uploadProgress = 0,
    basicInfo,
    handleBasicInfoChange,
    uploadKey
}) => {
    const jobTypes = ['full-time', 'part-time', 'contract', 'freelance'];

    const handleJobTypeChange = (type) => {
        const currentTypes = basicInfo.preferredJobTypes || [];
        const newTypes = currentTypes.includes(type)
            ? currentTypes.filter(t => t !== type)
            : [...currentTypes, type];

        handleBasicInfoChange({
            target: {
                name: 'preferredJobTypes',
                value: newTypes
            }
        });
    };

    return (
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
                                        isUploading={uploadingImage}
                                        uploadProgress={uploadProgress}
                                        showProgress={true}
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
                                <div className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white shadow-sm z-30 ${profile.availability === 'available' ? 'bg-emerald-500' :
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={basicInfo.location}
                                        onChange={handleBasicInfoChange}
                                        placeholder="City, Country"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="willingToRelocate"
                                            checked={basicInfo.willingToRelocate}
                                            onChange={handleBasicInfoChange}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Willing to Relocate</span>
                                    </label>
                                </div>

                                {/* Salary Expectations */}
                                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                                        <input
                                            type="number"
                                            name="expectedSalaryMin"
                                            value={basicInfo.expectedSalaryMin}
                                            onChange={handleBasicInfoChange}
                                            placeholder="Min"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                                        <input
                                            type="number"
                                            name="expectedSalaryMax"
                                            value={basicInfo.expectedSalaryMax}
                                            onChange={handleBasicInfoChange}
                                            placeholder="Max"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                        <select
                                            name="expectedSalaryCurrency"
                                            value={basicInfo.expectedSalaryCurrency}
                                            onChange={handleBasicInfoChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="PKR">PKR</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Job Types */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Job Types</label>
                                    <div className="flex flex-wrap gap-4">
                                        {jobTypes.map((type) => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={basicInfo.preferredJobTypes?.includes(type)}
                                                    onChange={() => handleJobTypeChange(type)}
                                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                />
                                                <span className="text-sm text-gray-700 capitalize">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <Textarea
                                        label="Bio"
                                        name="bio"
                                        value={basicInfo.bio}
                                        onChange={handleBasicInfoChange}
                                        placeholder="Tell us about yourself..."
                                        rows={3}
                                        maxLength={500}
                                        showCharacterCount
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-gray-900">{profile?.fullName}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${profile?.availability === 'available'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}>
                                        {profile?.availability === 'available' ? 'Available for Work' : 'Busy / Unavailable'}
                                    </span>
                                    {profile?.willingToRelocate && (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                            Willing to Relocate
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                    {profile?.location && (
                                        <div className="flex items-center gap-1">
                                            <FiMapPin className="w-4 h-4" />
                                            <span>{profile.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <FiPhone className="w-4 h-4" />
                                        <span>{profile?.phone || 'No phone added'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FiMail className="w-4 h-4" />
                                        <span>{profile?.email}</span>
                                    </div>
                                    {profile?.expectedSalary && (profile.expectedSalary.min || profile.expectedSalary.max) && (
                                        <div className="flex items-center gap-1">
                                            <FiDollarSign className="w-4 h-4" />
                                            <span>
                                                {profile.expectedSalary.currency} {profile.expectedSalary.min?.toLocaleString()} - {profile.expectedSalary.max?.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-gray-600 leading-relaxed max-w-2xl mb-4">
                                    {profile?.bio || 'No bio added yet.'}
                                </p>

                                {profile?.preferredJobTypes?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {profile.preferredJobTypes.map((type, index) => (
                                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md capitalize">
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
