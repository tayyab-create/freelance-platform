import React from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import DatePicker from '../../shared/DatePicker';

const CertificationModal = ({
    showCertModal,
    setShowCertModal,
    editingCertId,
    certificationForm,
    setCertificationForm,
    handleSaveCertification
}) => {
    if (!showCertModal) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <h3 className="text-xl font-bold mb-4">{editingCertId ? 'Edit Certification' : 'Add Certification'}</h3>
                <form onSubmit={handleSaveCertification} className="space-y-4">
                    <Input label="Certification Title" value={certificationForm.title} onChange={e => setCertificationForm({ ...certificationForm, title: e.target.value })} required />
                    <Input label="Issued By" value={certificationForm.issuedBy} onChange={e => setCertificationForm({ ...certificationForm, issuedBy: e.target.value })} required />
                    <DatePicker label="Issued Date" value={certificationForm.issuedDate} onChange={date => setCertificationForm({ ...certificationForm, issuedDate: date })} required />
                    <Input label="Credential URL" value={certificationForm.certificateUrl} onChange={e => setCertificationForm({ ...certificationForm, certificateUrl: e.target.value })} placeholder="https://" />
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setShowCertModal(false)} className="flex-1">Cancel</Button>
                        <Button type="submit" variant="primary" className="flex-1">Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CertificationModal;
