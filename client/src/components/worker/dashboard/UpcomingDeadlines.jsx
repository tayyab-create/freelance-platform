import React from 'react';
import { FiCalendar } from 'react-icons/fi';

const UpcomingDeadlines = ({ deadlines }) => {
    return (
        <div className="card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiCalendar className="text-primary-600" />
                Upcoming Deadlines
            </h3>
            <div className="space-y-3">
                {deadlines.length > 0 ? (
                    deadlines.map((deadline) => (
                        <div key={deadline.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{deadline.project}</p>
                                <p className="text-xs text-gray-600 mt-1">Due in {deadline.deadline}</p>
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full ${deadline.priority === 'high' ? 'bg-red-100 text-red-700' :
                                deadline.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                {deadline.priority}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm text-center py-2">No upcoming deadlines</p>
                )}
            </div>
        </div>
    );
};

export default UpcomingDeadlines;
