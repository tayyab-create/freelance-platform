import React from 'react';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';

const DateTimePicker = ({
    value,
    onChange,
    label,
    datePlaceholder = 'Select date',
    timePlaceholder = 'Select time',
    minDate,
    maxDate,
    disabled = false,
    error,
    required = false,
    use24Hour = false,
    minuteStep = 15,
    className = ''
}) => {
    const handleDateChange = (newDate) => {
        if (!newDate) {
            onChange(null);
            return;
        }

        if (value) {
            // Preserve time from existing value
            const existingDate = new Date(value);
            newDate.setHours(existingDate.getHours(), existingDate.getMinutes(), 0, 0);
        } else {
            // Set to current time
            const now = new Date();
            newDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
        }

        onChange(newDate);
    };

    const handleTimeChange = (newTime) => {
        if (!newTime) {
            onChange(null);
            return;
        }

        if (!value) {
            // If no date selected, use today's date
            const today = new Date();
            newTime.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
        }

        onChange(newTime);
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DatePicker
                    value={value}
                    onChange={handleDateChange}
                    placeholder={datePlaceholder}
                    minDate={minDate}
                    maxDate={maxDate}
                    disabled={disabled}
                />

                <TimePicker
                    value={value}
                    onChange={handleTimeChange}
                    placeholder={timePlaceholder}
                    disabled={disabled}
                    use24Hour={use24Hour}
                    minuteStep={minuteStep}
                />
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default DateTimePicker;
