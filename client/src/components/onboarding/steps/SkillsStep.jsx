import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../common/Input';
import { Plus, X, Briefcase, DollarSign } from 'lucide-react';

const SkillsStep = ({ formData, onChange, errors = {} }) => {
    const [skillInput, setSkillInput] = useState('');
    const [preferredJobType, setPreferredJobType] = useState(formData.preferredJobTypes || []);

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
        <div className="space-y-6">
            {/* Skills Section */}
            <div>
                <label className="label">
                    Skills <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-3">
                    Add at least 3 skills that describe your expertise
                </p>

                {/* Skill Input */}
                <div className="flex gap-2 mb-4">
                    <Input
                        name="skillInput"
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="e.g., React, JavaScript, UI/UX Design"
                        className="flex-1 mb-0"
                    />
                    <button
                        type="button"
                        onClick={handleAddSkill}
                        disabled={!skillInput.trim()}
                        className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5" />
                        Add
                    </button>
                </div>

                {/* Skills List */}
                {formData.skills && formData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {formData.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-purple-100 text-primary-700 rounded-full font-semibold text-sm border border-primary-200 transition-all hover:scale-105"
                            >
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="hover:text-primary-900 transition-colors"
                                >
                                    <X className="w-4 h-4" />
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
            />

            {/* Preferred Job Types */}
            <div>
                <label className="label mb-3">
                    Preferred Job Types <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-4">
                    Select all job types you're interested in
                </p>

                <div className="grid grid-cols-2 gap-3">
                    {jobTypes.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => handleJobTypeToggle(value)}
                            className={`
                flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300
                ${preferredJobType.includes(value)
                                    ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 shadow-lg shadow-primary-500/20'
                                    : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/30'
                                }
              `}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-semibold">{label}</span>
                            {preferredJobType.includes(value) && (
                                <div className="ml-auto w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {errors.preferredJobTypes && (
                    <p className="mt-2 text-sm text-red-600">{errors.preferredJobTypes}</p>
                )}
            </div>

            {/* Willing to Relocate */}
            <div>
                <label className="label mb-3">Relocation Preference</label>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => onChange({ ...formData, willingToRelocate: true })}
                        className={`
              flex-1 p-4 rounded-xl border-2 transition-all duration-300 font-semibold
              ${formData.willingToRelocate
                                ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-primary-300'
                            }
            `}
                    >
                        Yes, I'm open to relocating
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange({ ...formData, willingToRelocate: false })}
                        className={`
              flex-1 p-4 rounded-xl border-2 transition-all duration-300 font-semibold
              ${formData.willingToRelocate === false
                                ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-primary-300'
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
