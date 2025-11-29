import React from 'react';
import { FiMapPin } from 'react-icons/fi';

const MapView = ({ address, className = '' }) => {
    // Construct search query from address object
    const getAddressString = () => {
        if (!address) return '';
        const parts = [
            address.street,
            address.city,
            address.state,
            address.zipCode,
            address.country
        ].filter(Boolean);
        return parts.join(', ');
    };

    const addressString = getAddressString();
    const encodedAddress = encodeURIComponent(addressString);

    if (!addressString) {
        return (
            <div className={`w-full h-64 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 ${className}`}>
                <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FiMapPin className="w-8 h-8" />
                    <span className="text-sm font-medium">No location provided</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-64 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group ${className}`}>
            <iframe
                title="Office Location"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
            />

            {/* Overlay for better integration */}
            <div className="absolute inset-0 pointer-events-none border border-slate-200/50 rounded-xl shadow-inner"></div>
        </div>
    );
};

export default MapView;
