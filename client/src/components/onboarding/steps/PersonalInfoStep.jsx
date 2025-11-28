import React from 'react';
import PropTypes from 'prop-types';
import Input from '../../common/Input';
import Textarea from '../../common/Textarea';
import FileUpload from '../../common/FileUpload';
import { User, Mail, Phone, MapPin } from 'lucide-react';

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

            {/* LinkedIn Profile (Optional) */}
            <Input
                label="LinkedIn Profile"
                name="linkedinProfile"
                type="url"
                value={formData.linkedinProfile || ''}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
                icon={Mail}
                helperText="Your professional LinkedIn URL"
            />

            {/* GitHub Profile (Optional) */}
            <Input
                label="GitHub Profile"
                name="githubProfile"
                type="url"
                value={formData.githubProfile || ''}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
                helperText="Showcase your code and projects"
            />
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
