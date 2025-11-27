import React from 'react';
import { FiBriefcase, FiFileText, FiTag, FiAward } from 'react-icons/fi';
import Input from '../../../components/common/Input';
import Textarea from '../../../components/common/Textarea';
import { Select } from '../../../components/shared';

const JobBasicInfo = ({ formData, handleChange, handleBlur, touched, errors }) => {
    return (
        <>
            {/* Job Title */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <FiBriefcase className="w-5 h-5 text-primary-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Job Title</h2>
                </div>
                <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title ? errors.title : ''}
                    placeholder="e.g., Full Stack Developer, UI/UX Designer"
                    required
                    maxLength={200}
                    showCharacterCount
                    helperText="Choose a clear, descriptive title that highlights the role"
                    className="mb-0"
                />
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FiFileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
                </div>
                <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description ? errors.description : ''}
                    placeholder="Describe the job, responsibilities, and what you're looking for in detail..."
                    rows={6}
                    required
                    maxLength={5000}
                    showCharacterCount
                    helperText="Provide a detailed overview to attract qualified candidates"
                    className="mb-0"
                />
            </div>

            {/* Category & Experience Level */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <FiTag className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Category</h2>
                    </div>
                    <Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        icon={FiTag}
                        options={[
                            { value: '', label: 'Select Category' },
                            { value: 'Web Development', label: 'Web Development' },
                            { value: 'Mobile Development', label: 'Mobile Development' },
                            { value: 'Design', label: 'Design' },
                            { value: 'Writing', label: 'Writing' },
                            { value: 'Marketing', label: 'Marketing' },
                            { value: 'Data Science', label: 'Data Science' }
                        ]}
                    />
                    {touched.category && errors.category && (
                        <p className="mt-2 text-sm text-red-600">{errors.category}</p>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <FiAward className="w-5 h-5 text-orange-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Experience Level</h2>
                    </div>
                    <Select
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleChange}
                        required
                        icon={FiAward}
                        options={[
                            { value: 'entry', label: 'Entry Level' },
                            { value: 'intermediate', label: 'Intermediate' },
                            { value: 'expert', label: 'Expert' }
                        ]}
                    />
                </div>
            </div>

            {/* Skills/Tags */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <FiTag className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Skills & Tags</h2>
                </div>
                <Input
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="React, Node.js, MongoDB, TypeScript (comma-separated)"
                    helperText="Separate skills with commas to help candidates find your job"
                    className="mb-0"
                />
            </div>
        </>
    );
};

export default JobBasicInfo;
