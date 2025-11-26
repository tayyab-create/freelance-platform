import React from 'react';
import { FiAward } from 'react-icons/fi';

const Achievements = ({ achievements }) => {
    return (
        <div className="card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FiAward className="text-primary-600" />
                Achievements
            </h3>
            <div className="space-y-4">
                {achievements.slice(0, 2).map((achievement) => (
                    <div
                        key={achievement.id}
                        className={`p-4 rounded-xl flex items-center gap-4 transition-all duration-300 ${achievement.unlocked
                            ? 'bg-gradient-to-br from-primary-50 to-white border border-primary-200'
                            : 'bg-gray-50 border border-gray-200 opacity-60'
                            }`}
                    >
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                            <h4 className="font-bold text-sm text-gray-900">{achievement.title}</h4>
                            <p className="text-xs text-gray-600">{achievement.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Achievements;
