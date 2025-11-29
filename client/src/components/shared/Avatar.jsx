import React from 'react';

const Avatar = ({
    src,
    name,
    size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'custom'
    status, // 'online', 'offline', 'busy', 'away'
    shape = 'circle', // 'circle', 'square', 'rounded-xl'
    type = 'worker', // 'worker', 'company'
    className = '',
    onClick
}) => {
    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-20 h-20 text-2xl',
        custom: ''
    };

    const shapeClasses = {
        circle: 'rounded-full',
        square: 'rounded-lg',
        'rounded-xl': 'rounded-xl'
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
        '2xl': 'w-4 h-4',
        custom: 'w-3 h-3' // Default status size for custom
    };

    const getDefaultAvatar = (name, type) => {
        const encodedName = encodeURIComponent(name || 'User');
        const style = type === 'worker' ? 'miniavs' : 'shapes';
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodedName}`;
    };

    const avatarSrc = src || getDefaultAvatar(name, type);

    return (
        <div className={`relative inline-block ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
            <img
                src={avatarSrc}
                alt={name || 'User avatar'}
                className={`${sizeClasses[size]} ${shapeClasses[shape]} object-cover border-2 border-white shadow-md bg-white ${className}`}
            />

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