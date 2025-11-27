import React, { useState, useRef, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

const TimePicker = ({
    value,
    onChange,
    label,
    placeholder = 'Select time',
    disabled = false,
    error,
    required = false,
    use24Hour = false,
    minuteStep = 15,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const [selectedHour, setSelectedHour] = useState(value ? new Date(value).getHours() : 12);
    const [selectedMinute, setSelectedMinute] = useState(value ? new Date(value).getMinutes() : 0);
    const [selectedPeriod, setSelectedPeriod] = useState(value ? (new Date(value).getHours() >= 12 ? 'PM' : 'AM') : 'AM');

    const hourScrollRef = useRef(null);
    const minuteScrollRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        if (value) {
            const date = new Date(value);
            const hours = date.getHours();
            setSelectedHour(use24Hour ? hours : (hours % 12 || 12));
            setSelectedMinute(date.getMinutes());
            setSelectedPeriod(hours >= 12 ? 'PM' : 'AM');
        }
    }, [value, use24Hour]);

    const hours = use24Hour
        ? Array.from({ length: 24 }, (_, i) => i)
        : Array.from({ length: 12 }, (_, i) => i + 1);

    const minutes = Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep);

    const handleTimeChange = (hour, minute, period) => {
        let finalHour = hour;

        if (!use24Hour) {
            if (period === 'PM' && hour !== 12) {
                finalHour = hour + 12;
            } else if (period === 'AM' && hour === 12) {
                finalHour = 0;
            }
        }

        const newDate = value ? new Date(value) : new Date();
        newDate.setHours(finalHour, minute, 0, 0);
        onChange(newDate);
    };

    const handleHourSelect = (hour) => {
        setSelectedHour(hour);
        handleTimeChange(hour, selectedMinute, selectedPeriod);
    };

    const handleMinuteSelect = (minute) => {
        setSelectedMinute(minute);
        handleTimeChange(selectedHour, minute, selectedPeriod);
    };

    const handlePeriodToggle = (period) => {
        setSelectedPeriod(period);
        handleTimeChange(selectedHour, selectedMinute, period);
    };

    const formatDisplayTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: !use24Hour
        });
    };

    const formatNumber = (num) => num.toString().padStart(2, '0');

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Trigger */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                    error
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : isOpen
                        ? 'border-primary-500 bg-white ring-2 ring-primary-200'
                        : 'border-gray-200 bg-white hover:border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
            >
                <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                    {value ? formatDisplayTime(value) : placeholder}
                </span>
                <FiClock className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400'}`} />
            </button>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}

            {/* Time Picker Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-full min-w-[280px] animate-fadeIn">
                    <div className="flex gap-2">
                        {/* Hours Column */}
                        <div className="flex-1">
                            <div className="text-xs font-bold text-gray-500 text-center mb-2">
                                {use24Hour ? 'Hour' : 'Hour'}
                            </div>
                            <div
                                ref={hourScrollRef}
                                className="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-lg"
                            >
                                {hours.map((hour) => (
                                    <button
                                        key={hour}
                                        type="button"
                                        onClick={() => handleHourSelect(hour)}
                                        className={`w-full py-2.5 text-center font-bold transition-all rounded-lg ${
                                            selectedHour === hour
                                                ? 'bg-primary-600 text-white shadow-md'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {formatNumber(hour)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Minutes Column */}
                        <div className="flex-1">
                            <div className="text-xs font-bold text-gray-500 text-center mb-2">
                                Minute
                            </div>
                            <div
                                ref={minuteScrollRef}
                                className="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-lg"
                            >
                                {minutes.map((minute) => (
                                    <button
                                        key={minute}
                                        type="button"
                                        onClick={() => handleMinuteSelect(minute)}
                                        className={`w-full py-2.5 text-center font-bold transition-all rounded-lg ${
                                            selectedMinute === minute
                                                ? 'bg-primary-600 text-white shadow-md'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {formatNumber(minute)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AM/PM Column */}
                        {!use24Hour && (
                            <div className="w-16">
                                <div className="text-xs font-bold text-gray-500 text-center mb-2">
                                    Period
                                </div>
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => handlePeriodToggle('AM')}
                                        className={`w-full py-3 text-center font-bold transition-all rounded-lg ${
                                            selectedPeriod === 'AM'
                                                ? 'bg-primary-600 text-white shadow-md'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        AM
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handlePeriodToggle('PM')}
                                        className={`w-full py-3 text-center font-bold transition-all rounded-lg ${
                                            selectedPeriod === 'PM'
                                                ? 'bg-primary-600 text-white shadow-md'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        PM
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const now = new Date();
                                handleTimeChange(
                                    use24Hour ? now.getHours() : (now.getHours() % 12 || 12),
                                    Math.floor(now.getMinutes() / minuteStep) * minuteStep,
                                    now.getHours() >= 12 ? 'PM' : 'AM'
                                );
                            }}
                            className="flex-1 px-3 py-2 text-sm font-bold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                            Now
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onChange(null);
                                setIsOpen(false);
                            }}
                            className="flex-1 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePicker;
