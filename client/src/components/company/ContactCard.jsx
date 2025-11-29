import React from 'react';
import { FiMail, FiPhone } from 'react-icons/fi';
import Avatar from '../shared/Avatar';

const ContactCard = ({ contactPerson, editing = false, onChange, Input }) => {
    if (editing) {
        return (
            <div className="space-y-4">
                <Input
                    label="Full Name"
                    name="name"
                    value={contactPerson.name}
                    onChange={onChange}
                    placeholder="Sarah Jenkins"
                />
                <Input
                    label="Position"
                    name="position"
                    value={contactPerson.position}
                    onChange={onChange}
                    placeholder="HR Director"
                />
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={contactPerson.email}
                    onChange={onChange}
                    placeholder="sarah.j@company.com"
                />
                <Input
                    label="Phone"
                    name="phone"
                    value={contactPerson.phone}
                    onChange={onChange}
                    placeholder="+1 (555) 012-3456"
                />
            </div>
        );
    }

    if (!contactPerson?.name) {
        return <p className="text-sm text-slate-400">No contact person added yet.</p>;
    }

    return (
        <>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold flex-shrink-0">
                    {contactPerson.name.charAt(0).toUpperCase()}
                </div>
                <div className="w-full">
                    <div className="text-sm font-semibold text-slate-900">{contactPerson.name}</div>
                    <div className="text-xs text-slate-500">{contactPerson.position}</div>
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <FiMail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate w-full">{contactPerson.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <FiPhone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="w-full">{contactPerson.phone}</span>
                </div>
            </div>
        </>
    );
};

export default ContactCard;
