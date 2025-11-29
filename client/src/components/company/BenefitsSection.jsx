import React from 'react';

const BenefitsSection = ({ benefits = [], editing = false, onChange }) => {
    if (editing) {
        return (
            <textarea
                name="benefits"
                value={benefits.join(', ')}
                onChange={(e) => onChange(e.target.value.split(',').map(b => b.trim()).filter(Boolean))}
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                placeholder="Remote First Culture, Health Insurance, Annual Retreats..."
            />
        );
    }

    if (!benefits || benefits.length === 0) {
        return <p className="text-sm text-slate-400">No benefits added yet.</p>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {benefits.map((benefit, idx) => (
                <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
                >
                    {benefit}
                </span>
            ))}
        </div>
    );
};

export default BenefitsSection;
