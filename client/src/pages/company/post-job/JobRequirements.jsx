import React from 'react';
import { FiFileText } from 'react-icons/fi';
import Textarea from '../../../components/common/Textarea';

const JobRequirements = ({ formData, handleChange, handleBlur }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <FiFileText className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Requirements</h2>
            </div>
            <Textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="3+ years of experience&#10;Strong knowledge of React&#10;Portfolio required&#10;(one requirement per line)"
                rows={6}
                helperText="Enter one requirement per line for clarity"
                showCharacterCount
                className="mb-0"
            />
        </div>
    );
};

export default JobRequirements;
