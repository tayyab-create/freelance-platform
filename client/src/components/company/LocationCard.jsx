import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import { MapView } from '../shared';

const LocationCard = ({ address, editing = false, onChange, Input }) => {
    if (editing) {
        return (
            <div className="space-y-4">
                <Input
                    label="Street Address"
                    name="street"
                    value={address.street}
                    onChange={onChange}
                    placeholder="123 Innovation Drive, Tech Park"
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="City"
                        name="city"
                        value={address.city}
                        onChange={onChange}
                        placeholder="San Francisco"
                    />
                    <Input
                        label="State"
                        name="state"
                        value={address.state}
                        onChange={onChange}
                        placeholder="CA"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Zip Code"
                        name="zipCode"
                        value={address.zipCode}
                        onChange={onChange}
                        placeholder="94105"
                    />
                    <Input
                        label="Country"
                        name="country"
                        value={address.country}
                        onChange={onChange}
                        placeholder="USA"
                    />
                </div>
            </div>
        );
    }

    const hasAddress = address?.street || address?.city || address?.state || address?.country;

    if (!hasAddress) {
        return <p className="text-sm text-slate-400">No office location added yet.</p>;
    }

    return (
        <>
            <div className="space-y-1 mb-4">
                {address.street && <p className="text-sm text-slate-600">{address.street}</p>}
                {address.city && <p className="text-sm text-slate-600">{address.city}{address.state ? `, ${address.state}` : ''} {address.zipCode}</p>}
                {address.country && <p className="text-sm text-slate-600">{address.country}</p>}
            </div>
            {/* Map View */}
            <div className="mt-4">
                <MapView address={address} className="h-40" />
            </div>
        </>
    );
};

export default LocationCard;
