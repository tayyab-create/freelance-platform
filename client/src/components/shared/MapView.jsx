import React from 'react';
import { FiMapPin, FiNavigation } from 'react-icons/fi';

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
        <div className={`w-full h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group shadow-sm ${className}`}>
            <iframe
                title="Office Location"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full filter grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
            />

            {/* Inner Shadow Overlay */}
            <div className="absolute inset-0 pointer-events-none border border-slate-200/50 rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]"></div>

            {/* Floating Info Card (Visible on Hover) */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-lg flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="flex items-center gap-3 truncate mr-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
                        <FiMapPin className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Office Location</span>
                        <span className="text-xs font-medium text-slate-600 truncate">
                            {addressString}
                        </span>
                    </div>
                </div>
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all hover:shadow-md flex-shrink-0"
                >
                    Directions
                </a>
            </div>
        </div>
    );
};

export default MapView;
