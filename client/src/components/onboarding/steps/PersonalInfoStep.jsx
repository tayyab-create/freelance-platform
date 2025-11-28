import React from 'react';
import PropTypes from 'prop-types';
import Input from '../../common/Input';
import Textarea from '../../common/Textarea';
import FileUpload from '../../common/FileUpload';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github, Twitter, Dribbble, Layout, Instagram, Code } from 'lucide-react';

const PersonalInfoStep = ({ formData, onChange, onFileUpload, errors = {} }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...formData, [name]: value });
    };

    const handlePhotoUpload = (file) => {
        onFileUpload('profilePicture', file);
    };

    return (
        <div className="space-y-6">
            {/* Profile Picture */}
            <div>
                <FileUpload
                    label="Profile Picture"
                    name="profilePicture"
                    accept="image/*"
                    value={formData.profilePicture}
                    onFileSelect={handlePhotoUpload}
                    helperText="Upload a professional photo (JPG, PNG - max 5MB)"
                    maxSize={5}
                    preview
                />
            </div>

            {/* Full Name */}
            <Input
                label="Full Name"
                name="fullName"
                type="text"
                value={formData.fullName || ''}
                onChange={handleChange}
                placeholder="John Doe"
                required
                icon={User}
                error={errors.fullName}
                helperText="Your legal name as it appears on official documents"
                maxLength={100}
                showCharacterCount
            />

            {/* Phone Number */}
            <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                required
                icon={Phone}
                error={errors.phone}
                helperText="Include country code for international numbers"
                maxLength={20}
            />

            {/* Professional Bio */}
            <Textarea
                label="Professional Bio"
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                placeholder="Tell us about yourself, your experience, and what makes you unique..."
                required
                rows={5}
                error={errors.bio}
                helperText="Minimum 50 characters - this will be shown on your public profile"
                maxLength={500}
                showCharacterCount
                minLength={50}
            />

            {/* Location (Optional) */}
            <Input
                label="Location"
                name="location"
                type="text"
                value={formData.location || ''}
                onChange={handleChange}
                placeholder="City, Country"
                icon={MapPin}
                helperText="Where are you based? This helps companies find local talent"
                maxLength={100}
            />

            {/* Social & Professional Links */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">Social & Professional Links</h3>
                <p className="text-sm text-gray-500">Add links to your online presence (all optional)</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Website / Portfolio"
                        name="website"
                        type="url"
                        value={formData.website || ''}
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                        icon={Globe}
                    />

                    <Input
                        label="LinkedIn Profile"
                        name="linkedinProfile"
                        type="url"
                        value={formData.linkedinProfile || ''}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/profile"
                        icon={Linkedin}
                    />

                    <Input
                        label="GitHub Profile"
                        name="githubProfile"
                        type="url"
                        value={formData.githubProfile || ''}
                        onChange={handleChange}
                        placeholder="https://github.com/username"
                        icon={Github}
                    />

                    <Input
                        label="Twitter / X"
                        name="twitterProfile"
                        type="url"
                        value={formData.twitterProfile || ''}
                        onChange={handleChange}
                        placeholder="https://twitter.com/username"
                        icon={Twitter}
                    />

                    <Input
                        label="Dribbble"
                        name="dribbbleProfile"
                        type="url"
                        value={formData.dribbbleProfile || ''}
                        onChange={handleChange}
                        placeholder="https://dribbble.com/username"
                        icon={Dribbble}
                    />

                    <Input
                        label="Behance"
                        name="behanceProfile"
                        type="url"
                        value={formData.behanceProfile || ''}
                        onChange={handleChange}
                        placeholder="https://behance.net/username"
                        icon={Layout}
                    />

                    <Input
                        label="Instagram"
                        name="instagramProfile"
                        type="url"
                        value={formData.instagramProfile || ''}
                        onChange={handleChange}
                        placeholder="https://instagram.com/username"
                        icon={Instagram}
                    />

                    <Input
                        label="StackOverflow"
                        name="stackoverflowProfile"
                        type="url"
                        value={formData.stackoverflowProfile || ''}
                        onChange={handleChange}
                        placeholder="https://stackoverflow.com/users/..."
                        icon={Code}
                    />
                </div>
            </div>
        </div>
    );
};

PersonalInfoStep.propTypes = {
    formData: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onFileUpload: PropTypes.func.isRequired,
    errors: PropTypes.object
};

export default PersonalInfoStep;
