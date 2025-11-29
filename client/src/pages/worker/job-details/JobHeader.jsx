import React from 'react';
import { FiBriefcase, FiMapPin } from 'react-icons/fi';
import { Avatar, StatusBadge } from '../../../components/shared';

const JobHeader = ({ job }) => {
    return (
        <div className="p-8 border-b border-gray-100">
            <div className="flex items-start gap-5 mb-6">
                <Avatar
                    src={job.companyInfo?.logo}
                    name={job.companyInfo?.companyName || 'Unknown Company'}
                    size="xl"
                    shape="square"
                    className="border border-gray-200"
                />

                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                        {job.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-gray-600">
                        <span className="font-medium text-gray-900">
                            {job.companyInfo?.companyName || 'Unknown Company'}
                        </span>
                        {job.companyInfo?.location && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1.5 text-sm">
                                    <FiMapPin className="w-4 h-4" />
                                    {job.companyInfo.location}
                                </span>
                            </>
                        )}
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                            Posted {new Date(job.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                <StatusBadge status={job.status} size="md" />
            </div>
        </div>
    );
};

export default JobHeader;
