import React from 'react';
import { FiCalendar, FiClock, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const UpcomingDeadlines = ({ deadlines }) => {
    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'high':
                return {
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    border: 'border-red-100',
                    icon: <FiAlertCircle className="w-3.5 h-3.5" />,
                    label: 'Urgent'
                };
            case 'medium':
                return {
                    bg: 'bg-orange-50',
                    text: 'text-orange-700',
                    border: 'border-orange-100',
                    icon: <FiInfo className="w-3.5 h-3.5" />,
                    label: 'Soon'
                };
            default:
                return {
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    border: 'border-green-100',
                    icon: <FiCheckCircle className="w-3.5 h-3.5" />,
                    label: 'Upcoming'
                };
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-primary-600">
                        <FiCalendar className="w-5 h-5" />
                    </div>
                    Upcoming Deadlines
                </h3>
                <span className="text-xs font-semibold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                    {deadlines.length} Active
                </span>
            </div>

            <div className="p-5 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                {deadlines.length > 0 ? (
                    <div className="space-y-3">
                        {deadlines.map((deadline) => {
                            const style = getPriorityStyles(deadline.priority);
                            const dateObj = new Date(deadline.fullDate);

                            return (
                                <div
                                    key={deadline.id}
                                    className="group relative p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 bg-white"
                                >
                                    {/* Left Border Indicator */}
                                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${deadline.priority === 'high' ? 'bg-red-500' :
                                        deadline.priority === 'medium' ? 'bg-orange-400' : 'bg-green-400'
                                        }`}></div>

                                    <div className="flex items-start justify-between gap-3 pl-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 text-sm mb-1 truncate group-hover:text-primary-600 transition-colors">
                                                {deadline.project}
                                            </h4>

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                                    <FiClock className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="font-medium">Due in {deadline.deadline}</span>
                                                </div>
                                                {dateObj && !isNaN(dateObj.getTime()) && (
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <span>•</span>
                                                        <span>{dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                        <span>at</span>
                                                        <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold shadow-sm ${style.bg} ${style.text} ${style.border}`}>
                                            {style.icon}
                                            <span>{style.label}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <FiCalendar className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-900 font-medium">No upcoming deadlines</p>
                        <p className="text-gray-500 text-sm mt-1">You're all caught up! Great job.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingDeadlines;
