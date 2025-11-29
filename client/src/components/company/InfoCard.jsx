import React from 'react';

const InfoCard = ({ icon: Icon, label, value }) => {
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Icon className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="w-full">
                <p className="text-xs text-slate-500 font-medium mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-slate-900">{value}</p>
            </div>
        </div>
    );
};

export default InfoCard;
