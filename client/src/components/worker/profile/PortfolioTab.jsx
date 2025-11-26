import React from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiAward } from 'react-icons/fi';
import Button from '../../common/Button';

const PortfolioTab = ({
    profile,
    setEditingExpId,
    setExperienceForm,
    setShowExpModal,
    handleEditExperience,
    handleDeleteExperience,
    setEditingCertId,
    setCertificationForm,
    setShowCertModal,
    handleEditCertification,
    handleDeleteCertification
}) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Experience */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Work Experience</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        icon={FiPlus}
                        onClick={() => {
                            setEditingExpId(null);
                            setExperienceForm({
                                title: '',
                                company: '',
                                startDate: '',
                                endDate: '',
                                current: false,
                                description: '',
                            });
                            setShowExpModal(true);
                        }}
                    >
                        Add
                    </Button>
                </div>
                {profile?.experience && profile.experience.length > 0 ? (
                    <div className="space-y-8">
                        {profile.experience.map((exp, index) => (
                            <div key={index} className="relative pl-8 border-l-2 border-gray-100 last:border-0 group">
                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-gray-200 border-2 border-white group-hover:bg-primary-500 transition-colors"></div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">{exp.title}</h4>
                                        <p className="text-primary-600 font-medium">{exp.company}</p>
                                        <p className="text-sm text-gray-500 mt-1 mb-2">
                                            {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                                            {exp.current ? <span className="text-green-600 font-semibold">Present</span> : new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                        {exp.description && <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditExperience(exp)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><FiEdit2 className="h-4 w-4" /></button>
                                        <button onClick={() => handleDeleteExperience(exp._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><FiTrash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">No experience added yet.</div>
                )}
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Certifications</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        icon={FiPlus}
                        onClick={() => {
                            setEditingCertId(null);
                            setCertificationForm({
                                title: '',
                                issuedBy: '',
                                issuedDate: '',
                                certificateUrl: '',
                            });
                            setShowCertModal(true);
                        }}
                    >
                        Add
                    </Button>
                </div>
                {profile?.certifications && profile.certifications.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        {profile.certifications.map((cert, index) => (
                            <div key={index} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group relative">
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditCertification(cert)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"><FiEdit2 className="h-3.5 w-3.5" /></button>
                                    <button onClick={() => handleDeleteCertification(cert._id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"><FiTrash2 className="h-3.5 w-3.5" /></button>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-yellow-500">
                                        <FiAward className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{cert.title}</h4>
                                        <p className="text-xs text-gray-500">{cert.issuedBy}</p>
                                        <p className="text-xs text-gray-400 mt-1">Issued: {new Date(cert.issuedDate).toLocaleDateString()}</p>
                                        {cert.certificateUrl && (
                                            <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 font-semibold mt-2 inline-block hover:underline">View Certificate</a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">No certifications added yet.</div>
                )}
            </div>
        </div>
    );
};

export default PortfolioTab;
