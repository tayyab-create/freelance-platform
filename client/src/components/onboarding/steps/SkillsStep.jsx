import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Input from '../../common/Input';
import { Plus, X, Briefcase, DollarSign, Check } from 'lucide-react';

const SkillsStep = ({ formData, onChange, errors = {}, disabled = false }) => {
    const [skillInput, setSkillInput] = useState('');
    const [preferredJobType, setPreferredJobType] = useState(formData.preferredJobTypes || []);

    // Sync local state with formData when it changes
    useEffect(() => {
        setPreferredJobType(formData.preferredJobTypes || []);
    }, [formData.preferredJobTypes]);

    const handleAddSkill = () => {
        if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
            const newSkills = [...(formData.skills || []), skillInput.trim()];
            onChange({ ...formData, skills: newSkills });
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        const newSkills = formData.skills.filter(skill => skill !== skillToRemove);
        onChange({ ...formData, skills: newSkills });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const handleJobTypeToggle = (type) => {
        const newTypes = preferredJobType.includes(type)
            ? preferredJobType.filter(t => t !== type)
            : [...preferredJobType, type];

        setPreferredJobType(newTypes);
        onChange({ ...formData, preferredJobTypes: newTypes });
    };

    const jobTypes = [
        { value: 'full-time', label: 'Full-Time', icon: Briefcase },
        { value: 'part-time', label: 'Part-Time', icon: Briefcase },
        { value: 'contract', label: 'Contract', icon: Briefcase },
        { value: 'freelance', label: 'Freelance', icon: Briefcase }
    ];

    return (
        <div className="space-y-8">
            {/* Skills Section */}
            <div>
                <label className="label">
                    Skills <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-3">
                    Add at least 3 skills that describe your expertise
                </p>

                {/* Skill Input */}
                <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                        <Input
                            name="skillInput"
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="e.g., React, JavaScript, UI/UX Design"
                            className="w-full mb-0"
                            disabled={disabled}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleAddSkill}
                        disabled={!skillInput.trim() || disabled}
                        className="h-[50px] px-6 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Skills List - Flat Design */}
                {formData.skills && formData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
                            >
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={disabled}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic">No skills added yet</p>
                )}

                {errors.skills && (
                    <p className="mt-2 text-sm text-red-600">{errors.skills}</p>
                )}
            </div>

            {/* Hourly Rate */}
            <Input
                label="Hourly Rate (USD)"
                name="hourlyRate"
                type="number"
                value={formData.hourlyRate || ''}
                onChange={(e) => onChange({ ...formData, hourlyRate: e.target.value })}
                placeholder="50"
                required
                icon={DollarSign}
                error={errors.hourlyRate}
                helperText="Set your expected hourly rate in USD"
                min="1"
                disabled={disabled}
            />

            {/* Preferred Job Types - Flat Design */}
            <div>
                <label className="label mb-3">
                    Preferred Job Types <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-4">
                    Select all job types you're interested in
                </p>

                <div className="grid grid-cols-2 gap-3">
                    {jobTypes.map(({ value, label, icon: Icon }) => {
                        const isSelected = preferredJobType.includes(value);
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => handleJobTypeToggle(value)}
                                disabled={disabled}
                                className={`
                                    flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left
                                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}
                                    ${isSelected
                                        ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600'
                                        : 'border-gray-200 bg-white text-gray-600'
                                    }
                                `}
                            >
                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-sm">{label}</span>
                                {isSelected && (
                                    <div className="ml-auto">
                                        <Check className="w-4 h-4 text-primary-600" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {errors.preferredJobTypes && (
                    <p className="mt-2 text-sm text-red-600">{errors.preferredJobTypes}</p>
                )}
            </div>

            {/* Willing to Relocate - Flat Design */}
            <div>
                <label className="label mb-3">Relocation Preference</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => onChange({ ...formData, willingToRelocate: true })}
                        disabled={disabled}
                        className={`
                            p-3 rounded-xl border transition-all duration-200 font-medium text-sm
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}
                            ${formData.willingToRelocate
                                ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600'
                                : 'border-gray-200 bg-white text-gray-600'
                            }
                        `}
                    >
                        Yes, open to relocating
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange({ ...formData, willingToRelocate: false })}
                        disabled={disabled}
                        className={`
                            p-3 rounded-xl border transition-all duration-200 font-medium text-sm
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}
                            ${formData.willingToRelocate === false
                                ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600'
                                : 'border-gray-200 bg-white text-gray-600'
                            }
                        `}
                    >
                        No, remote only
                    </button>
                </div>
            </div>
        </div>
    );
};

SkillsStep.propTypes = {
    formData: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object
};

export default SkillsStep;
