import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../common/Input';
import Textarea from '../../common/Textarea';
import { Plus, X, Briefcase, Calendar, Building } from 'lucide-react';

const ExperienceStep = ({ formData, onChange, errors = {} }) => {
    const [showExperienceForm, setShowExperienceForm] = useState(false);
    const [currentExperience, setCurrentExperience] = useState({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
    });

    const handleAddExperience = () => {
        if (currentExperience.title && currentExperience.company && currentExperience.startDate) {
            const newExperience = [...(formData.experience || []), currentExperience];
            onChange({ ...formData, experience: newExperience });
            setCurrentExperience({
                title: '',
                company: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            });
            setShowExperienceForm(false);
        }
    };

    const handleRemoveExperience = (index) => {
        const newExperience = formData.experience.filter((_, i) => i !== index);
        onChange({ ...formData, experience: newExperience });
    };

    const handlePortfolioLinkChange = (index, value) => {
        const newLinks = [...(formData.portfolioLinks || [])];
        newLinks[index] = value;
        onChange({ ...formData, portfolioLinks: newLinks });
    };

    const handleAddPortfolioLink = () => {
        const newLinks = [...(formData.portfolioLinks || []), ''];
        onChange({ ...formData, portfolioLinks: newLinks });
    };

    const handleRemovePortfolioLink = (index) => {
        const newLinks = formData.portfolioLinks.filter((_, i) => i !== index);
        onChange({ ...formData, portfolioLinks: newLinks });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    return (
        <div className="space-y-6">
            {/* Work Experience Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <label className="label mb-0">Work Experience</label>
                        <p className="text-sm text-gray-500">Add your professional experience</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowExperienceForm(!showExperienceForm)}
                        className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Experience
                    </button>
                </div>

                {/* Experience Form */}
                {showExperienceForm && (
                    <div className="card mb-4 space-y-4">
                        <Input
                            label="Job Title"
                            name="title"
                            value={currentExperience.title}
                            onChange={(e) => setCurrentExperience({ ...currentExperience, title: e.target.value })}
                            placeholder="Senior Software Engineer"
                            required
                            icon={Briefcase}
                        />

                        <Input
                            label="Company"
                            name="company"
                            value={currentExperience.company}
                            onChange={(e) => setCurrentExperience({ ...currentExperience, company: e.target.value })}
                            placeholder="Tech Corp"
                            required
                            icon={Building}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Start Date"
                                name="startDate"
                                type="month"
                                value={currentExperience.startDate}
                                onChange={(e) => setCurrentExperience({ ...currentExperience, startDate: e.target.value })}
                                required
                                icon={Calendar}
                            />

                            {!currentExperience.current && (
                                <Input
                                    label="End Date"
                                    name="endDate"
                                    type="month"
                                    value={currentExperience.endDate}
                                    onChange={(e) => setCurrentExperience({ ...currentExperience, endDate: e.target.value })}
                                    icon={Calendar}
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="current"
                                checked={currentExperience.current}
                                onChange={(e) => setCurrentExperience({ ...currentExperience, current: e.target.checked, endDate: '' })}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="current" className="text-sm font-medium text-gray-700 cursor-pointer">
                                I currently work here
                            </label>
                        </div>

                        <Textarea
                            label="Description"
                            name="description"
                            value={currentExperience.description}
                            onChange={(e) => setCurrentExperience({ ...currentExperience, description: e.target.value })}
                            placeholder="Describe your responsibilities and achievements..."
                            rows={3}
                            maxLength={300}
                            showCharacterCount
                        />

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleAddExperience}
                                className="btn-primary flex-1"
                            >
                                Save Experience
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowExperienceForm(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Experience List */}
                {formData.experience && formData.experience.length > 0 ? (
                    <div className="space-y-3">
                        {formData.experience.map((exp, index) => (
                            <div key={index} className="card-premium relative group">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveExperience(index)}
                                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-start gap-4">
                                    <div className="icon-container">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{exp.title}</h4>
                                        <p className="text-sm text-gray-600 font-medium">{exp.company}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                                        </p>
                                        {exp.description && (
                                            <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic text-center py-8">
                        No experience added yet. Click "Add Experience" to get started.
                    </p>
                )}
            </div>

            {/* Portfolio Links */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <label className="label mb-0">Portfolio Links</label>
                        <p className="text-sm text-gray-500">Showcase your best work (optional)</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddPortfolioLink}
                        className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Link
                    </button>
                </div>

                {formData.portfolioLinks && formData.portfolioLinks.length > 0 ? (
                    <div className="space-y-3">
                        {formData.portfolioLinks.map((link, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    name={`portfolio-${index}`}
                                    type="url"
                                    value={link}
                                    onChange={(e) => handlePortfolioLinkChange(index, e.target.value)}
                                    placeholder="https://your-portfolio.com/project"
                                    className="flex-1 mb-0"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemovePortfolioLink(index)}
                                    className="btn-danger px-4"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic text-center py-4">
                        No portfolio links added
                    </p>
                )}
            </div>
        </div>
    );
};

ExperienceStep.propTypes = {
    formData: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object
};

export default ExperienceStep;
