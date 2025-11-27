import React from 'react';
import { FiBriefcase, FiTrendingUp, FiUsers, FiMapPin, FiGlobe, FiExternalLink, FiCalendar } from 'react-icons/fi';

const CompanyInfo = ({ companyInfo, companyCreatedAt }) => {
    if (!companyInfo) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FiBriefcase className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">About Company</h3>
            </div>

            <div className="space-y-5">
                <div>
                    <p className="text-base font-bold text-gray-900 mb-1">
                        {companyInfo.companyName}
                    </p>
                    {companyInfo.tagline && (
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {companyInfo.tagline}
                        </p>
                    )}
                </div>

                <div className="space-y-3 pt-2">
                    {companyInfo.industry && (
                        <div className="flex items-center gap-3 text-sm group">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                <FiTrendingUp className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-medium">Industry</p>
                                <p className="text-gray-900 font-semibold">{companyInfo.industry}</p>
                            </div>
                        </div>
                    )}

                    {companyInfo.size && (
                        <div className="flex items-center gap-3 text-sm group">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                <FiUsers className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-medium">Company Size</p>
                                <p className="text-gray-900 font-semibold">{companyInfo.size} employees</p>
                            </div>
                        </div>
                    )}

                    {companyInfo.location && (
                        <div className="flex items-center gap-3 text-sm group">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                <FiMapPin className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-medium">Location</p>
                                <p className="text-gray-900 font-semibold">{companyInfo.location}</p>
                            </div>
                        </div>
                    )}

                    {companyInfo.website && (
                        <div className="flex items-center gap-3 text-sm group">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                <FiGlobe className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-500 text-xs font-medium">Website</p>
                                <a
                                    href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-600 font-semibold hover:underline flex items-center gap-1"
                                >
                                    Visit Website <FiExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    )}

                    {companyCreatedAt && (
                        <div className="flex items-center gap-3 text-sm group">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                <FiCalendar className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-medium">Member Since</p>
                                <p className="text-gray-900 font-semibold">
                                    {new Date(companyCreatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <button className="w-full mt-2 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border border-gray-200">
                    View Company Profile
                </button>
            </div>
        </div>
    );
};

export default CompanyInfo;
