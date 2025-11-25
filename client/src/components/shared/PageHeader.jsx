import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

const PageHeader = ({
    title,
    subtitle,
    breadcrumbs = [],
    actions,
    backButton,
    className = ''
}) => {
    return (
        <div className={`mb-8 ${className}`}>
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 text-sm mb-4">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            {crumb.href ? (
                                <Link
                                    to={crumb.href}
                                    className="text-gray-600 hover:text-primary-600 transition-colors"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-gray-900 font-medium">{crumb.label}</span>
                            )}
                            {index < breadcrumbs.length - 1 && (
                                <FiChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            {/* Header Content */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    {backButton && (
                        <button
                            onClick={backButton.onClick}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Go back"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-gray-600 mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;