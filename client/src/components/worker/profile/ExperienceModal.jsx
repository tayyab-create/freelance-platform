import React from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import DatePicker from '../../shared/DatePicker';
import Textarea from '../../common/Textarea';
import Checkbox from '../../common/Checkbox';

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
                        <DatePicker
                            label="Start Date"
                            value={experienceForm.startDate}
                            onChange={date => setExperienceForm({ ...experienceForm, startDate: date })}
                            required
                        />
                        <div className="space-y-1">
                            <DatePicker
                                label="End Date"
                                value={experienceForm.endDate}
                                onChange={date => setExperienceForm({ ...experienceForm, endDate: date })}
                                disabled={experienceForm.current}
                            />
                            <div className="pt-2">
                                <Checkbox
                                    label="I currently work here"
                                    checked={experienceForm.current}
                                    onChange={e => setExperienceForm({ ...experienceForm, current: e.target.checked })}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <Textarea
                            label="Description"
                            value={experienceForm.description}
                            onChange={e => setExperienceForm({ ...experienceForm, description: e.target.value })}
                            rows={3}
                        />
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
