import React from 'react';
import {
    FiCheckCircle,
    FiClock,
    FiXCircle,
    FiAlertCircle,
    FiLoader,
    FiPause,
    FiPlay
} from 'react-icons/fi';

const StatusBadge = ({
    status,
    size = 'md', // 'sm', 'md', 'lg'
    showIcon = true,
    label,
    pulse = false,
    className = ''
}) => {
    const statusConfig = {
        // Application/Job statuses
        pending: {
            color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            icon: FiClock,
            defaultLabel: 'Pending'
        },
        assigned: {
            color: 'bg-blue-50 text-blue-600 border-blue-200',
            icon: FiCheckCircle,
            defaultLabel: 'Assigned'
        },
        approved: {
            color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            icon: FiCheckCircle,
            defaultLabel: 'Approved'
        },
        accepted: {
            color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            icon: FiCheckCircle,
            defaultLabel: 'Accepted'
        },
        rejected: {
            color: 'bg-red-100 text-red-700 border-red-200',
            icon: FiXCircle,
            defaultLabel: 'Rejected'
        },
        active: {
            color: 'bg-blue-100 text-blue-700 border-blue-200',
            icon: FiPlay,
            defaultLabel: 'Active'
        },
        completed: {
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: FiCheckCircle,
            defaultLabel: 'Completed'
        },
        cancelled: {
            color: 'bg-gray-100 text-gray-700 border-gray-200',
            icon: FiXCircle,
            defaultLabel: 'Cancelled'
        },
        submitted: {
            color: 'bg-teal-100 text-teal-700 border-teal-200',
            icon: FiCheckCircle,
            defaultLabel: 'Submitted'
        },

        // Work statuses
        'in-progress': {
            color: 'bg-purple-100 text-purple-700 border-purple-200',
            icon: FiLoader,
            defaultLabel: 'In Progress'
        },
        reviewing: {
            color: 'bg-blue-100 text-blue-700 border-blue-200',
            icon: FiClock,
            defaultLabel: 'Reviewing'
        },
        'on-hold': {
            color: 'bg-orange-100 text-orange-700 border-orange-200',
            icon: FiPause,
            defaultLabel: 'On Hold'
        },

        // Payment statuses
        paid: {
            color: 'bg-green-100 text-green-700 border-green-200',
            icon: FiCheckCircle,
            defaultLabel: 'Paid'
        },
        unpaid: {
            color: 'bg-red-100 text-red-700 border-red-200',
            icon: FiAlertCircle,
            defaultLabel: 'Unpaid'
        },
        processing: {
            color: 'bg-blue-100 text-blue-700 border-blue-200',
            icon: FiLoader,
            defaultLabel: 'Processing'
        },

        // User statuses
        online: {
            color: 'bg-green-100 text-green-700 border-green-200',
            icon: null,
            defaultLabel: 'Online'
        },
        offline: {
            color: 'bg-gray-100 text-gray-700 border-gray-200',
            icon: null,
            defaultLabel: 'Offline'
        }
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    const displayLabel = label || config.defaultLabel;

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold border
        ${config.color}
        ${sizeClasses[size]}
        ${pulse && status === 'in-progress' ? 'animate-pulse' : ''}
        ${className}
      `}
        >
            {showIcon && Icon && <Icon className={iconSizes[size]} />}
            <span>{displayLabel}</span>
        </span>
    );
};

export default StatusBadge;