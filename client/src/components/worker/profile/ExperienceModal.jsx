import React from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';

const ExperienceModal = ({
    showExpModal,
    setShowExpModal,
    editingExpId,
    experienceForm,
    setExperienceForm,
    handleSaveExperience
}) => {
    if (!showExpModal) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <h3 className="text-xl font-bold mb-4">{editingExpId ? 'Edit Experience' : 'Add Experience'}</h3>
                <form onSubmit={handleSaveExperience} className="space-y-4">
                    <Input label="Job Title" value={experienceForm.title} onChange={e => setExperienceForm({ ...experienceForm, title: e.target.value })} required />
                    <Input label="Company" value={experienceForm.company} onChange={e => setExperienceForm({ ...experienceForm, company: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="date" label="Start Date" value={experienceForm.startDate} onChange={e => setExperienceForm({ ...experienceForm, startDate: e.target.value })} required />
                        <div className="space-y-1">
                            <Input type="date" label="End Date" value={experienceForm.endDate} onChange={e => setExperienceForm({ ...experienceForm, endDate: e.target.value })} disabled={experienceForm.current} />
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" checked={experienceForm.current} onChange={e => setExperienceForm({ ...experienceForm, current: e.target.checked })} className="rounded text-primary-600" />
                                I currently work here
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="label text-sm font-bold text-gray-700 mb-1 block">Description</label>
                        <textarea value={experienceForm.description} onChange={e => setExperienceForm({ ...experienceForm, description: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 outline-none" rows="3" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setShowExpModal(false)} className="flex-1">Cancel</Button>
                        <Button type="submit" variant="primary" className="flex-1">Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExperienceModal;
