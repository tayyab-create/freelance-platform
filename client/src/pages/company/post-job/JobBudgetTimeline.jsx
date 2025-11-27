import React from 'react';
import { FiDollarSign, FiClock, FiCalendar } from 'react-icons/fi';
import Input from '../../../components/common/Input';
import { Select, DateTimePicker } from '../../../components/shared';

const JobBudgetTimeline = ({ formData, handleChange, handleBlur, touched, errors, setFieldValue }) => {
    return (
        <>
            {/* Budget & Salary Type */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <FiDollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Budget</h2>
                    </div>
                    <Input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.salary ? errors.salary : ''}
                        placeholder="5000"
                        required
                        icon={FiDollarSign}
                        helperText={formData.salaryType === 'hourly' ? 'Per hour rate' : 'Total project budget'}
                        className="mb-0"
                    />
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FiDollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Payment Type</h2>
                    </div>
                    <Select
                        name="salaryType"
                        value={formData.salaryType}
                        onChange={handleChange}
                        icon={FiDollarSign}
                        options={[
                            { value: 'fixed', label: 'Fixed Price' },
                            { value: 'hourly', label: 'Hourly Rate' }
                        ]}
                    />
                </div>
            </div>

            {/* Duration & Deadline */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <FiClock className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Duration</h2>
                    </div>
                    <Input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.duration ? errors.duration : ''}
                        placeholder="Auto-calculated from deadline"
                        readOnly
                        disabled
                        helperText="Duration is automatically calculated based on the deadline"
                        className="mb-0 bg-gray-50"
                    />
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <FiCalendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Deadline</h2>
                    </div>
                    <DateTimePicker
                        label="Deadline"
                        value={formData.deadline}
                        onChange={(date) => {
                            setFieldValue('deadline', date);

                            // Auto-calculate duration
                            if (date) {
                                const now = new Date();
                                const deadlineDate = new Date(date);
                                const diffTime = deadlineDate - now;

                                if (diffTime > 0) {
                                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                    const months = Math.floor(diffDays / 30);
                                    const days = diffDays % 30;

                                    let durationStr = '';
                                    if (months > 0) {
                                        durationStr += `${months} month${months > 1 ? 's' : ''}`;
                                    }
                                    if (days > 0) {
                                        if (durationStr) durationStr += ', ';
                                        durationStr += `${days} day${days > 1 ? 's' : ''}`;
                                    }
                                    if (!durationStr) {
                                        durationStr = 'Less than a day';
                                    }

                                    setFieldValue('duration', durationStr);
                                } else {
                                    setFieldValue('duration', 'Expired');
                                }
                            }
                        }}
                        minDate={new Date()}
                        error={touched.deadline ? errors.deadline : ''}
                        placeholder="Select application deadline"
                        className="mb-0"
                    />
                    <p className="mt-1 text-sm text-gray-500">Application deadline (optional)</p>
                </div>
            </div>
        </>
    );
};

export default JobBudgetTimeline;
