import React from 'react';
import PropTypes from 'prop-types';
import Input from '../../../common/Input';
import { User, Mail, Phone, MapPin, Linkedin, Facebook, Twitter, Instagram } from 'lucide-react';

const CompanyDetailsStep = ({ formData, onChange, errors = {} }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('contactPerson.')) {
            const field = name.split('.')[1];
            onChange({
                ...formData,
                contactPerson: {
                    ...formData.contactPerson,
                    [field]: value
                }
            });
        } else if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            onChange({
                ...formData,
                address: {
                    ...formData.address,
                    [field]: value
                }
            });
        } else if (name.startsWith('socialMedia.')) {
            const field = name.split('.')[1];
            onChange({
                ...formData,
                socialMedia: {
                    ...formData.socialMedia,
                    [field]: value
                }
            });
        } else {
            onChange({ ...formData, [name]: value });
        }
    };

    return (
        <div className="space-y-8">
            {/* Contact Person Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-600" />
                    Primary Contact Person
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Full Name"
                        name="contactPerson.name"
                        value={formData.contactPerson?.name || ''}
                        onChange={handleChange}
                        placeholder="Jane Smith"
                        required
                        error={errors['contactPerson.name']}
                    />
                    <Input
                        label="Position / Title"
                        name="contactPerson.position"
                        value={formData.contactPerson?.position || ''}
                        onChange={handleChange}
                        placeholder="HR Manager"
                        required
                        error={errors['contactPerson.position']}
                    />
                    <Input
                        label="Email"
                        name="contactPerson.email"
                        type="email"
                        value={formData.contactPerson?.email || ''}
                        onChange={handleChange}
                        placeholder="jane@acme.com"
                        required
                        icon={Mail}
                        error={errors['contactPerson.email']}
                    />
                    <Input
                        label="Phone"
                        name="contactPerson.phone"
                        type="tel"
                        value={formData.contactPerson?.phone || ''}
                        onChange={handleChange}
                        placeholder="+1 (555) 987-6543"
                        icon={Phone}
                    />
                </div>
            </div>

            <div className="divider"></div>

            {/* Address Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    Company Address
                </h3>
                <Input
                    label="Street Address"
                    name="address.street"
                    value={formData.address?.street || ''}
                    onChange={handleChange}
                    placeholder="123 Business Blvd"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="City"
                        name="address.city"
                        value={formData.address?.city || ''}
                        onChange={handleChange}
                        placeholder="New York"
                        required
                        error={errors['address.city']}
                    />
                    <Input
                        label="State / Province"
                        name="address.state"
                        value={formData.address?.state || ''}
                        onChange={handleChange}
                        placeholder="NY"
                    />
                    <Input
                        label="Country"
                        name="address.country"
                        value={formData.address?.country || ''}
                        onChange={handleChange}
                        placeholder="USA"
                        required
                        error={errors['address.country']}
                    />
                    <Input
                        label="Zip / Postal Code"
                        name="address.zipCode"
                        value={formData.address?.zipCode || ''}
                        onChange={handleChange}
                        placeholder="10001"
                    />
                </div>
            </div>

            <div className="divider"></div>

            {/* Social Media Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Social Media Presence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="LinkedIn"
                        name="linkedinProfile"
                        value={formData.linkedinProfile || ''}
                        onChange={handleChange}
                        placeholder="linkedin.com/company/acme"
                        icon={Linkedin}
                    />
                    <Input
                        label="Twitter"
                        name="socialMedia.twitter"
                        value={formData.socialMedia?.twitter || ''}
                        onChange={handleChange}
                        placeholder="twitter.com/acme"
                        icon={Twitter}
                    />
                    <Input
                        label="Facebook"
                        name="socialMedia.facebook"
                        value={formData.socialMedia?.facebook || ''}
                        onChange={handleChange}
                        placeholder="facebook.com/acme"
                        icon={Facebook}
                    />
                    <Input
                        label="Instagram"
                        name="socialMedia.instagram"
                        value={formData.socialMedia?.instagram || ''}
                        onChange={handleChange}
                        placeholder="instagram.com/acme"
                        icon={Instagram}
                    />
                </div>
            </div>
        </div>
    );
};

CompanyDetailsStep.propTypes = {
    formData: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object
};

export default CompanyDetailsStep;
