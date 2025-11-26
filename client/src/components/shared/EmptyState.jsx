import React from 'react';
import { FiBriefcase, FiSearch, FiFilter, FiAlertCircle, FiInbox } from 'react-icons/fi';

const EmptyState = ({
    type = 'no-results', // 'no-results', 'no-data', 'error', 'search'
    title,
    description,
    icon: CustomIcon,
    suggestions = [],
    primaryAction,
    secondaryAction,
    hasActiveFilters = false,
    onClearFilters,
    className = ''
}) => {
    // Default icons based on type
    const iconMap = {
        'no-results': FiSearch,
        'no-data': FiInbox,
        'error': FiAlertCircle,
        'search': FiBriefcase
    };

    const Icon = CustomIcon || iconMap[type] || FiBriefcase;

    // Default content based on type
    const defaultContent = {
        'no-results': {
            title: 'No results found',
            description: hasActiveFilters
                ? "We couldn't find any matches for your search criteria. Try adjusting your filters."
                : 'No items available at the moment.'
        },
        'no-data': {
            title: 'Nothing here yet',
            description: 'Start by adding your first item.'
        },
        'error': {
            title: 'Something went wrong',
            description: 'We encountered an error loading the data. Please try again.'
        },
        'search': {
            title: 'Start searching',
            description: 'Enter keywords to find what you\'re looking for.'
        }
    };

    const content = {
        title: title || defaultContent[type]?.title,
        description: description || defaultContent[type]?.description
    };

    return (
        <div className={`bg-white rounded-2xl border-2 border-gray-200 p-8 md:p-12 text-center ${className}`}>
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6 shadow-inner">
                <Icon className="w-10 h-10 text-gray-400" />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {content.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                {content.description}
            </p>

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Try these suggestions:</p>
                    <ul className="space-y-2 max-w-md mx-auto text-left">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="text-primary-500 mt-0.5">"</span>
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {hasActiveFilters && onClearFilters && (
                    <button
                        onClick={onClearFilters}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
                    >
                        <FiFilter className="w-4 h-4" />
                        Clear All Filters
                    </button>
                )}

                {primaryAction && (
                    <button
                        onClick={primaryAction.onClick}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${primaryAction.variant === 'secondary'
                            ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/30 hover:shadow-primary-500/40'
                            }`}
                    >
                        {primaryAction.icon && <primaryAction.icon className="w-4 h-4" />}
                        {primaryAction.label}
                    </button>
                )}

                {secondaryAction && (
                    <button
                        onClick={secondaryAction.onClick}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
                    >
                        {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4" />}
                        {secondaryAction.label}
                    </button>
                )}
            </div>
        </div>
    );
};

// Preset Empty States for common scenarios
export const NoJobsFound = ({ hasActiveFilters, onClearFilters }) => (
    <EmptyState
        type="no-results"
        icon={FiBriefcase}
        title="No jobs found"
        description={hasActiveFilters
            ? "We couldn't find any jobs matching your criteria."
            : "There are no jobs available at the moment."}
        suggestions={[
            'Try using different keywords',
            'Remove some filters to see more results',
            'Check your spelling',
            'Try more general search terms'
        ]}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
    />
);

export const NoApplicationsFound = () => (
    <EmptyState
        type="no-data"
        icon={FiInbox}
        title="No applications yet"
        description="You haven't applied to any jobs yet. Start browsing to find your next opportunity."
        primaryAction={{
            label: 'Browse Jobs',
            onClick: () => window.location.href = '/worker/browse-jobs',
            icon: FiBriefcase
        }}
    />
);

export const NoSearchResults = ({ searchQuery, onClearSearch }) => (
    <EmptyState
        type="search"
        title={`No results for "${searchQuery}"`}
        description="We couldn't find any matches for your search."
        suggestions={[
            'Check your spelling',
            'Try different keywords',
            'Use more general terms',
            'Remove filters'
        ]}
        primaryAction={{
            label: 'Clear Search',
            onClick: onClearSearch,
            variant: 'primary'
        }}
    />
);

export default EmptyState;
