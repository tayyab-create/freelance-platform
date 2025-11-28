import React from 'react';
import {
    FiDollarSign, FiBriefcase, FiStar, FiCheckCircle,
    FiGithub, FiLinkedin, FiTwitter, FiInstagram,
    FiFileText, FiVideo, FiUploadCloud, FiTrash2,
    FiGlobe, FiLayers, FiCode, FiDribbble
} from 'react-icons/fi';
import Input from '../../common/Input';
import CustomSelect from '../../shared/CustomSelect';
import FileUpload from '../../common/FileUpload';
import Spinner from '../../common/Spinner';
import TagInput from '../../common/TagInput';

const OverviewTab = ({
    profile,
    editing,
    basicInfo,
    handleBasicInfoChange,
    skills,
    setSkills,
    handleResumeUpload,
    uploadingResume,
    resumeUploadProgress,
    handleDeleteResume
}) => {
    const socialInputs = [
        { name: 'website', label: 'Website', icon: FiGlobe, placeholder: 'https://yourwebsite.com' },
        { name: 'githubProfile', label: 'GitHub', icon: FiGithub, placeholder: 'username' },
        { name: 'linkedinProfile', label: 'LinkedIn', icon: FiLinkedin, placeholder: 'username' },
        { name: 'twitterProfile', label: 'Twitter / X', icon: FiTwitter, placeholder: 'username' },
        { name: 'dribbbleProfile', label: 'Dribbble', icon: FiDribbble, placeholder: 'username' },
        { name: 'behanceProfile', label: 'Behance', icon: FiLayers, placeholder: 'username' },
        { name: 'instagramProfile', label: 'Instagram', icon: FiInstagram, placeholder: 'username' },
        { name: 'stackoverflowProfile', label: 'StackOverflow', icon: FiCode, placeholder: 'username' },
    ];

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
                        <CustomSelect
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
                {/* Social Links */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FiGlobe className="text-blue-500" />
                        Social Profiles
                    </h3>
                    {editing ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            {socialInputs.map((social) => {
                                const hasValue = basicInfo[social.name] && basicInfo[social.name].length > 0;
                                return (
                                    <div key={social.name} className="relative group">
                                        <Input
                                            label={social.label}
                                            name={social.name}
                                            value={basicInfo[social.name]}
                                            onChange={handleBasicInfoChange}
                                            placeholder={social.placeholder}
                                            icon={social.icon}
                                            iconClassName={`transition-colors ${hasValue ? 'text-primary-500' : 'text-gray-400 group-focus-within:text-primary-500'}`}
                                            className="group"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {profile?.website && (
                                <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all">
                                    <FiGlobe className="h-4 w-4" />
                                    <span className="font-medium">Website</span>
                                </a>
                            )}
                            {profile?.githubProfile && (
                                <a href={profile.githubProfile.startsWith('http') ? profile.githubProfile : `https://github.com/${profile.githubProfile}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#24292e]/5 hover:bg-[#24292e]/10 text-[#24292e] border border-[#24292e]/10 transition-all">
                                    <FiGithub className="h-4 w-4" />
                                    <span className="font-medium">GitHub</span>
                                </a>
                            )}
                            {profile?.linkedinProfile && (
                                <a href={profile.linkedinProfile.startsWith('http') ? profile.linkedinProfile : `https://linkedin.com/in/${profile.linkedinProfile}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0077b5]/5 hover:bg-[#0077b5]/10 text-[#0077b5] border border-[#0077b5]/10 transition-all">
                                    <FiLinkedin className="h-4 w-4" />
                                    <span className="font-medium">LinkedIn</span>
                                </a>
                            )}
                            {profile?.twitterProfile && (
                                <a href={profile.twitterProfile.startsWith('http') ? profile.twitterProfile : `https://twitter.com/${profile.twitterProfile}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1da1f2]/5 hover:bg-[#1da1f2]/10 text-[#1da1f2] border border-[#1da1f2]/10 transition-all">
                                    <FiTwitter className="h-4 w-4" />
                                    <span className="font-medium">Twitter</span>
                                </a>
                            )}
                            {profile?.dribbbleProfile && (
                                <a href={profile.dribbbleProfile.startsWith('http') ? profile.dribbbleProfile : `https://dribbble.com/${profile.dribbbleProfile}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ea4c89]/5 hover:bg-[#ea4c89]/10 text-[#ea4c89] border border-[#ea4c89]/10 transition-all">
                                    <FiDribbble className="h-4 w-4" />
                                    <span className="font-medium">Dribbble</span>
                                </a>
                            )}
                            {profile?.behanceProfile && (
                                <a href={profile.behanceProfile.startsWith('http') ? profile.behanceProfile : `https://behance.net/${profile.behanceProfile}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1769ff]/5 hover:bg-[#1769ff]/10 text-[#1769ff] border border-[#1769ff]/10 transition-all">
                                    <FiLayers className="h-4 w-4" />
                                    <span className="font-medium">Behance</span>
                                </a>
                            )}
                            {profile?.instagramProfile && (
                                <a href={profile.instagramProfile.startsWith('http') ? profile.instagramProfile : `https://instagram.com/${profile.instagramProfile}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e1306c]/5 hover:bg-[#e1306c]/10 text-[#e1306c] border border-[#e1306c]/10 transition-all">
                                    <FiInstagram className="h-4 w-4" />
                                    <span className="font-medium">Instagram</span>
                                </a>
                            )}
                            {profile?.stackoverflowProfile && (
                                <a href={profile.stackoverflowProfile.startsWith('http') ? profile.stackoverflowProfile : `https://stackoverflow.com/users/${profile.stackoverflowProfile}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f48024]/5 hover:bg-[#f48024]/10 text-[#f48024] border border-[#f48024]/10 transition-all">
                                    <FiCode className="h-4 w-4" />
                                    <span className="font-medium">StackOverflow</span>
                                </a>
                            )}

                            {!profile?.website && !profile?.githubProfile && !profile?.linkedinProfile &&
                                !profile?.twitterProfile && !profile?.dribbbleProfile && !profile?.behanceProfile &&
                                !profile?.instagramProfile && !profile?.stackoverflowProfile && (
                                    <p className="text-gray-400 text-sm italic">No social profiles added</p>
                                )}
                        </div>
                    )}
                </div>

                {/* Skills */}
                <div className="md:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiStar className="text-yellow-500" />
                        Skills & Expertise
                    </h3>
                    {editing ? (
                        <TagInput
                            label="Add Skills"
                            value={skills}
                            onChange={setSkills}
                            placeholder="Type skill..."
                            helperText="Press Enter to add"
                        />
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {profile?.skills?.length > 0 ? (
                                profile.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-primary-50 text-primary-700 border border-primary-100"
                                    >
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm italic">No skills added yet</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Documents & Media */}
                <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Documents & Media</h3>
                    {editing ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Resume Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                                {basicInfo.resume ? (
                                    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between group hover:border-primary-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-lg border border-gray-100 text-primary-600 shadow-sm">
                                                <FiFileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Resume Uploaded</p>
                                                <a
                                                    href={basicInfo.resume}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline flex items-center gap-1 mt-0.5"
                                                >
                                                    View Document
                                                </a>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleDeleteResume}
                                            type="button"
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Remove Resume"
                                        >
                                            <FiTrash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <FileUpload
                                        onFileSelect={handleResumeUpload}
                                        accept=".pdf,.doc,.docx"
                                        isUploading={uploadingResume}
                                        uploadProgress={resumeUploadProgress}
                                        showProgress={true}
                                    >
                                        <div className="relative h-32 w-full rounded-xl overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all bg-white flex flex-col items-center justify-center group">
                                            <div className="flex flex-col items-center text-gray-400 group-hover:text-primary-500 transition-colors">
                                                <div className="p-3 bg-gray-50 rounded-full mb-2 group-hover:bg-white transition-colors">
                                                    <FiUploadCloud className="h-6 w-6" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700 group-hover:text-primary-700">Upload Resume</span>
                                                <span className="text-xs text-gray-400 mt-1">PDF, DOC up to 5MB</span>
                                            </div>

                                            {uploadingResume && (
                                                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                                                    <Spinner size="md" />
                                                    <span className="text-xs font-medium text-primary-600 mt-2">Uploading... {resumeUploadProgress}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </FileUpload>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            {profile?.resume && (
                                <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 transition-colors">
                                    <FiFileText className="h-4 w-4" />
                                    View Resume
                                </a>
                            )}
                            {profile?.videoIntroduction && (
                                <a href={profile.videoIntroduction} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                    <FiVideo className="h-4 w-4" />
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
