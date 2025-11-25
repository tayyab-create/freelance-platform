import React from 'react';

const Avatar = ({
    src,
    name,
    size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl', '2xl'
    status, // 'online', 'offline', 'busy', 'away'
    shape = 'circle', // 'circle', 'square'
    className = '',
    onClick
}) => {
    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-20 h-20 text-2xl'
    };

    const shapeClasses = {
        circle: 'rounded-full',
        square: 'rounded-lg'
    };

    const statusColors = {
        online: 'bg-green-500',
        offline: 'bg-gray-400',
        busy: 'bg-red-500',
        away: 'bg-yellow-500'
    };

    const statusSizes = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-3.5 h-3.5',
        '2xl': 'w-4 h-4'
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const gradients = [
        'from-blue-500 to-cyan-500',
        'from-purple-500 to-pink-500',
        'from-green-500 to-emerald-500',
        'from-orange-500 to-red-500',
        'from-indigo-500 to-purple-500',
        'from-pink-500 to-rose-500'
    ];

    const getGradient = (name) => {
        if (!name) return gradients[0];
        const index = name.charCodeAt(0) % gradients.length;
        return gradients[index];
    };

    return (
        <div className={`relative inline-block ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
            {src ? (
                <img
                    src={src}
                    alt={name || 'User avatar'}
                    className={`${sizeClasses[size]} ${shapeClasses[shape]} object-cover border-2 border-white shadow-md ${className}`}
                />
            ) : (
                <div
                    className={`${sizeClasses[size]} ${shapeClasses[shape]} bg-gradient-to-br ${getGradient(name)} flex items-center justify-center text-white font-bold border-2 border-white shadow-md ${className}`}
                >
                    {getInitials(name)}
                </div>
            )}

            {status && (
                <span
                    className={`absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[status]} rounded-full border-2 border-white`}
                    aria-label={`Status: ${status}`}
                />
            )}
        </div>
    );
};

export default Avatar;