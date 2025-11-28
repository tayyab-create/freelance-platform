import React from 'react';
import { FiDollarSign, FiBriefcase, FiStar, FiCheckCircle, FiGithub, FiLinkedin } from 'react-icons/fi';
import Input from '../../common/Input';
import { Select } from '../../shared';

const OverviewTab = ({
    profile,
    editing,
    basicInfo,
    handleBasicInfoChange,
    skills,
    setSkills
}) => {
    return (
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
                        <Select
                            name="availability"
                            value={basicInfo.availability}
                            onChange={handleBasicInfoChange}
                            icon={FiCheckCircle}
                            options={[
                                { value: 'available', label: 'Available' },
                                { value: 'busy', label: 'Busy' },
                                { value: 'not-available', label: 'Unavailable' }
                            ]}
                        />
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
                                label="Website"
                                name="website"
                                value={basicInfo.website}
                                onChange={handleBasicInfoChange}
                                placeholder="https://yourwebsite.com"
                            />
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
                            <Input
                                label="Twitter / X"
                                name="twitterProfile"
                                value={basicInfo.twitterProfile}
                                onChange={handleBasicInfoChange}
                                placeholder="username"
                            />
                            <Input
                                label="Dribbble"
                                name="dribbbleProfile"
                                value={basicInfo.dribbbleProfile}
                                onChange={handleBasicInfoChange}
                                placeholder="username"
                            />
                            <Input
                                label="Behance"
                                name="behanceProfile"
                                value={basicInfo.behanceProfile}
                                onChange={handleBasicInfoChange}
                                placeholder="username"
                            />
                            <Input
                                label="Instagram"
                                name="instagramProfile"
                                value={basicInfo.instagramProfile}
                                onChange={handleBasicInfoChange}
                                placeholder="username"
                            />
                            <Input
                                label="StackOverflow"
                                name="stackoverflowProfile"
                                value={basicInfo.stackoverflowProfile}
                                onChange={handleBasicInfoChange}
                                placeholder="username"
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {profile?.website && (
                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors">
                                    <span className="font-medium">Website</span>
                                </a>
                            )}
                            {profile?.githubProfile && (
                                <a href={profile.githubProfile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors">
                                    <FiGithub className="h-5 w-5" />
                                    <span className="font-medium">GitHub</span>
                                </a>
                            )}
                            {profile?.linkedinProfile && (
                                <a href={profile.linkedinProfile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors">
                                    <FiLinkedin className="h-5 w-5" />
                                    <span className="font-medium">LinkedIn</span>
                                </a>
                            )}
                            {/* Add other social links display here if needed, or keep it minimal */}
                        </div>
                    )}
                </div>

                {/* Documents & Media */}
                <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Documents & Media</h3>
                    {editing ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Resume URL"
                                name="resume"
                                value={basicInfo.resume}
                                onChange={handleBasicInfoChange}
                                placeholder="https://..."
                            />
                            <Input
                                label="Video Introduction URL"
                                name="videoIntroduction"
                                value={basicInfo.videoIntroduction}
                                onChange={handleBasicInfoChange}
                                placeholder="https://..."
                            />
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            {profile?.resume && (
                                <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 transition-colors">
                                    View Resume
                                </a>
                            )}
                            {profile?.videoIntroduction && (
                                <a href={profile.videoIntroduction} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                    Watch Video Intro
                                </a>
                            )}
                            {!profile?.resume && !profile?.videoIntroduction && (
                                <p className="text-gray-400 text-sm">No documents or media added.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
