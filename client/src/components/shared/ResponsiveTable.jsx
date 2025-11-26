import React from 'react';
import { FiMoreVertical } from 'react-icons/fi';

/**
 * Responsive Table Component
 * Automatically converts to card layout on mobile devices
 *
 * Features:
 * - Table view on desktop (md and up)
 * - Card view on mobile (below md)
 * - Touch-friendly 44x44px minimum targets
 * - Swipe gesture support
 * - Accessible and semantic HTML
 *
 * @example
 * <ResponsiveTable
 *   columns={[
 *     { key: 'name', label: 'Name', primary: true },
 *     { key: 'email', label: 'Email' },
 *     { key: 'status', label: 'Status', render: (value) => <Badge>{value}</Badge> }
 *   ]}
 *   data={[
 *     { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' }
 *   ]}
 *   onRowClick={(row) => console.log(row)}
 *   actions={(row) => [
 *     { label: 'Edit', onClick: () => {}, icon: FiEdit },
 *     { label: 'Delete', onClick: () => {}, icon: FiTrash, variant: 'danger' }
 *   ]}
 * />
 */
const ResponsiveTable = ({
    columns = [],
    data = [],
    onRowClick,
    actions,
    loading = false,
    emptyMessage = 'No data available',
    emptyComponent,
    keyField = 'id',
    className = '',
    showHeader = true,
    striped = false,
    hoverable = true,
    bordered = false,
    compact = false
}) => {
    const [expandedRows, setExpandedRows] = React.useState(new Set());
    const [swipedRow, setSwipedRow] = React.useState(null);
    const touchStartX = React.useRef(null);
    const touchStartY = React.useRef(null);

    // Handle swipe gestures on mobile
    const handleTouchStart = (e, rowId) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e, rowId) => {
        if (!touchStartX.current || !touchStartY.current) return;

        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        const deltaX = touchStartX.current - touchEndX;
        const deltaY = touchStartY.current - touchEndY;

        // Only trigger horizontal swipe if movement is more horizontal than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                // Swipe left - show actions
                setSwipedRow(rowId);
            } else {
                // Swipe right - hide actions
                setSwipedRow(null);
            }
        }
    };

    const handleTouchEnd = () => {
        touchStartX.current = null;
        touchStartY.current = null;
    };

    const toggleRowExpansion = (rowId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(rowId)) {
            newExpanded.delete(rowId);
        } else {
            newExpanded.add(rowId);
        }
        setExpandedRows(newExpanded);
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className={`space-y-4 ${className}`}>
                {/* Desktop skeleton */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {showHeader && (
                            <thead className="bg-gray-50">
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th key={idx} className="px-6 py-3">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                        )}
                        <tbody>
                            {[1, 2, 3].map((i) => (
                                <tr key={i}>
                                    {columns.map((col, idx) => (
                                        <td key={idx} className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Mobile skeleton */}
                <div className="md:hidden space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                                <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (!data || data.length === 0) {
        if (emptyComponent) {
            return emptyComponent;
        }
        return (
            <div className={`text-center py-12 ${className}`}>
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className={`min-w-full divide-y divide-gray-200 ${bordered ? 'border border-gray-200' : ''}`}>
                    {showHeader && (
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map((column, idx) => (
                                    <th
                                        key={idx}
                                        className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                                            column.className || ''
                                        }`}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                                {actions && (
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                    )}
                    <tbody className={`bg-white divide-y divide-gray-200 ${striped ? 'divide-y-0' : ''}`}>
                        {data.map((row, rowIdx) => (
                            <tr
                                key={row[keyField] || rowIdx}
                                className={`
                                    ${striped && rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                                    ${hoverable ? 'hover:bg-gray-100 transition-colors' : ''}
                                    ${onRowClick ? 'cursor-pointer' : ''}
                                `}
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map((column, colIdx) => (
                                    <td
                                        key={colIdx}
                                        className={`px-6 ${compact ? 'py-3' : 'py-4'} whitespace-nowrap text-sm text-gray-900 ${
                                            column.cellClassName || ''
                                        }`}
                                    >
                                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            {actions(row).map((action, actionIdx) => (
                                                <button
                                                    key={actionIdx}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        action.onClick(row);
                                                    }}
                                                    className={`
                                                        min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg font-medium transition-all
                                                        inline-flex items-center justify-center gap-2
                                                        ${action.variant === 'danger'
                                                            ? 'text-red-600 hover:bg-red-50'
                                                            : 'text-primary-600 hover:bg-primary-50'
                                                        }
                                                    `}
                                                    title={action.label}
                                                >
                                                    {action.icon && <action.icon className="w-4 h-4" />}
                                                    <span className="hidden lg:inline">{action.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {data.map((row, rowIdx) => {
                    const primaryColumn = columns.find(col => col.primary) || columns[0];
                    const isExpanded = expandedRows.has(row[keyField] || rowIdx);
                    const isSwiped = swipedRow === (row[keyField] || rowIdx);
                    const rowActions = actions?.(row) || [];

                    return (
                        <div
                            key={row[keyField] || rowIdx}
                            className="relative bg-white rounded-xl border-2 border-gray-200 overflow-hidden touch-manipulation"
                            onTouchStart={(e) => handleTouchStart(e, row[keyField] || rowIdx)}
                            onTouchMove={(e) => handleTouchMove(e, row[keyField] || rowIdx)}
                            onTouchEnd={handleTouchEnd}
                        >
                            {/* Swipe Actions Background */}
                            {rowActions.length > 0 && (
                                <div className={`
                                    absolute inset-y-0 right-0 flex items-center gap-1 px-2 bg-gradient-to-l from-gray-100
                                    transition-all duration-300
                                    ${isSwiped ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                                `}>
                                    {rowActions.map((action, actionIdx) => (
                                        <button
                                            key={actionIdx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                action.onClick(row);
                                                setSwipedRow(null);
                                            }}
                                            className={`
                                                min-w-[44px] min-h-[44px] px-3 rounded-lg
                                                inline-flex items-center justify-center
                                                transition-all touch-manipulation
                                                ${action.variant === 'danger'
                                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                                    : 'bg-primary-500 text-white hover:bg-primary-600'
                                                }
                                            `}
                                            title={action.label}
                                        >
                                            {action.icon && <action.icon className="w-5 h-5" />}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Card Content */}
                            <div
                                className={`
                                    relative bg-white p-4 cursor-pointer transition-transform duration-300
                                    ${isSwiped ? '-translate-x-24' : 'translate-x-0'}
                                `}
                                onClick={() => onRowClick?.(row)}
                            >
                                {/* Primary Info */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1">
                                            {primaryColumn.render
                                                ? primaryColumn.render(row[primaryColumn.key], row)
                                                : row[primaryColumn.key]
                                            }
                                        </h3>
                                    </div>

                                    {/* Desktop Actions */}
                                    {rowActions.length > 0 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleRowExpansion(row[keyField] || rowIdx);
                                            }}
                                            className="min-w-[44px] min-h-[44px] -mr-2 px-2 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                                            aria-label="More options"
                                        >
                                            <FiMoreVertical className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                {/* Secondary Info */}
                                <div className="space-y-2">
                                    {columns
                                        .filter(col => !col.primary && !col.hideOnMobile)
                                        .slice(0, isExpanded ? undefined : 2)
                                        .map((column, colIdx) => (
                                            <div key={colIdx} className="flex items-start gap-2 text-sm">
                                                <span className="font-medium text-gray-500 min-w-[80px]">
                                                    {column.label}:
                                                </span>
                                                <span className="text-gray-900 flex-1">
                                                    {column.render
                                                        ? column.render(row[column.key], row)
                                                        : row[column.key] || '-'
                                                    }
                                                </span>
                                            </div>
                                        ))
                                    }
                                </div>

                                {/* Show More Button */}
                                {columns.filter(col => !col.primary && !col.hideOnMobile).length > 2 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleRowExpansion(row[keyField] || rowIdx);
                                        }}
                                        className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-700 min-h-[44px] touch-manipulation"
                                    >
                                        {isExpanded ? 'Show less' : 'Show more'}
                                    </button>
                                )}

                                {/* Expanded Actions */}
                                {isExpanded && rowActions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                                        {rowActions.map((action, actionIdx) => (
                                            <button
                                                key={actionIdx}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    action.onClick(row);
                                                }}
                                                className={`
                                                    min-h-[44px] px-4 py-2 rounded-lg font-medium
                                                    inline-flex items-center gap-2 transition-all touch-manipulation
                                                    ${action.variant === 'danger'
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                                    }
                                                `}
                                            >
                                                {action.icon && <action.icon className="w-4 h-4" />}
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResponsiveTable;
