import React from 'react';
import PropTypes from 'prop-types';
import Input from '../../common/Input';
import Textarea from '../../common/Textarea';
import { Building, Globe, Briefcase, Users } from 'lucide-react';

const CompanyInfoStep = ({ formData, onChange, errors = {} }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...formData, [name]: value });
    };

    const companySizes = [
        '1-10', '11-50', '51-200', '201-500', '500+'
    ];

    return (
        <div className="space-y-6">
            {/* Company Name */}
            <Input
                label="Company Name"
                name="companyName"
                type="text"
                value={formData.companyName || ''}
                onChange={handleChange}
                placeholder="Acme Inc."
                required
                icon={Building}
                error={errors.companyName}
                maxLength={100}
            />

            {/* Tagline */}
            <Input
                label="Tagline"
                name="tagline"
                type="text"
                value={formData.tagline || ''}
                onChange={handleChange}
                placeholder="Innovation for the future"
                helperText="A short catchphrase that represents your brand"
                maxLength={100}
            />

            {/* Website */}
            <Input
                label="Website"
                name="website"
                type="url"
                value={formData.website || ''}
                onChange={handleChange}
                placeholder="https://acme.com"
                required
                icon={Globe}
                error={errors.website}
            />

            {/* Industry */}
            <Input
                label="Industry"
                name="industry"
                type="text"
                value={formData.industry || ''}
                onChange={handleChange}
                placeholder="e.g. Technology, Healthcare, Finance"
                required
                icon={Briefcase}
                error={errors.industry}
            />

            {/* Company Size */}
            <div>
                <label className="label">
                    Company Size <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {companySizes.map((size) => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => onChange({ ...formData, companySize: size })}
                            className={`
                p-3 rounded-xl border-2 transition-all duration-300 font-medium text-sm
                ${formData.companySize === size
                                    ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                                    : 'border-gray-200 bg-white hover:border-primary-300 text-gray-600'
                                }
              `}
                        >
                            {size}
                        </button>
                    ))}
                </div>
                {errors.companySize && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {errors.companySize}
                    </p>
                )}
            </div>

            {/* Description */}
            <Textarea
                label="Company Description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Tell us about your company, mission, and culture..."
                required
                rows={6}
                error={errors.description}
                helperText="Minimum 100 characters"
                maxLength={1000}
                showCharacterCount
                minLength={100}
            />

            {/* Founded Year */}
            <Input
                label="Founded Year"
                name="foundedYear"
                type="number"
                value={formData.foundedYear || ''}
                onChange={handleChange}
                placeholder="2020"
                min="1800"
                max={new Date().getFullYear()}
            />
        </div>
    );
};

CompanyInfoStep.propTypes = {
    formData: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object
};

export default CompanyInfoStep;
