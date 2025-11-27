import React, { useState, useRef, useEffect } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DatePicker = ({
    value,
    onChange,
    label,
    placeholder = 'Select date',
    minDate,
    maxDate,
    disabled = false,
    error,
    required = false,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
    const containerRef = useRef(null);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days = [];

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: daysInPrevMonth - i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, daysInPrevMonth - i)
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(year, month, i)
            });
        }

        // Next month days
        const remainingDays = 42 - days.length; // 6 rows x 7 days
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }

        return days;
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleDateSelect = (date) => {
        if (isDateDisabled(date)) return;
        onChange(date);
        setIsOpen(false);
    };

    const isDateDisabled = (date) => {
        if (minDate && date < new Date(minDate).setHours(0, 0, 0, 0)) return true;
        if (maxDate && date > new Date(maxDate).setHours(23, 59, 59, 999)) return true;
        return false;
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date) => {
        if (!value) return false;
        const selectedDate = new Date(value);
        return date.toDateString() === selectedDate.toDateString();
    };

    const formatDisplayDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const days = getDaysInMonth(currentMonth);

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
                    {value ? formatDisplayDate(value) : placeholder}
                </span>
                <FiCalendar className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400'}`} />
            </button>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-full min-w-[320px] animate-fadeIn">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FiChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <h3 className="text-base font-bold text-gray-900">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FiChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs font-bold text-gray-500 py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((dayObj, index) => {
                            const isDisabled = isDateDisabled(dayObj.date);
                            const isTodayDate = isToday(dayObj.date);
                            const isSelectedDate = isSelected(dayObj.date);

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleDateSelect(dayObj.date)}
                                    disabled={isDisabled}
                                    className={`
                                        aspect-square rounded-lg text-sm font-medium transition-all
                                        ${!dayObj.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                                        ${isSelectedDate
                                            ? 'bg-primary-600 text-white font-bold shadow-md scale-105'
                                            : isTodayDate
                                            ? 'bg-primary-50 text-primary-700 font-bold border-2 border-primary-300'
                                            : 'hover:bg-gray-100'
                                        }
                                        ${isDisabled
                                            ? 'opacity-30 cursor-not-allowed hover:bg-transparent'
                                            : 'cursor-pointer'
                                        }
                                    `}
                                >
                                    {dayObj.day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                        <button
                            type="button"
                            onClick={() => handleDateSelect(new Date())}
                            className="flex-1 px-3 py-2 text-sm font-bold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                            Today
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

export default DatePicker;
