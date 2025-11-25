import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1, className = '' }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className={`card animate-pulse ${className}`}>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                    </div>
                );

            case 'list':
                return (
                    <div className={`flex items-center gap-4 p-4 bg-white rounded-xl animate-pulse ${className}`}>
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                );

            case 'table':
                return (
                    <div className={`animate-pulse ${className}`}>
                        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-t-xl">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="bg-white p-4 space-y-4 rounded-b-xl">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="grid grid-cols-4 gap-4">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className={`card animate-pulse ${className}`}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                        </div>
                    </div>
                );

            case 'stat':
                return (
                    <div className={`card animate-pulse ${className}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                );

            case 'text':
                return (
                    <div className={`animate-pulse space-y-2 ${className}`}>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                );

            default:
                return (
                    <div className={`h-32 bg-gray-200 rounded-xl animate-pulse ${className}`}></div>
                );
        }
    };

    return (
        <>
            {[...Array(count)].map((_, index) => (
                <div key={index}>
                    {renderSkeleton()}
                </div>
            ))}
        </>
    );
};

export default SkeletonLoader;