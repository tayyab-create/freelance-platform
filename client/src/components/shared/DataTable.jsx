import React, { useState, useMemo } from 'react';
import { FiSearch, FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DataTable = ({
    columns,
    data,
    searchable = false,
    sortable = true,
    pagination = true,
    pageSize = 10,
    onRowClick,
    loading = false,
    emptyMessage = 'No data available',
    className = ''
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!searchQuery || !searchable) return data;

        return data.filter((row) =>
            columns.some((column) => {
                const value = column.accessor ? row[column.accessor] : '';
                return String(value).toLowerCase().includes(searchQuery.toLowerCase());
            })
        );
    }, [data, searchQuery, columns, searchable]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    // Paginate data
    const paginatedData = useMemo(() => {
        if (!pagination) return sortedData;

        const startIndex = (currentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [sortedData, currentPage, pageSize, pagination]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const handleSort = (key) => {
        if (!sortable) return;

        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    if (loading) {
        return (
            <div className={`card ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`card ${className}`}>
            {/* Search Bar */}
            {searchable && (
                <div className="mb-4">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>
            )}

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`
                    px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider
                    ${sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''}
                  `}
                                    onClick={() => column.sortable !== false && handleSort(column.accessor)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{column.header}</span>
                                        {sortable && column.sortable !== false && sortConfig.key === column.accessor && (
                                            <>
                                                {sortConfig.direction === 'asc' ? (
                                                    <FiChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <FiChevronDown className="w-4 h-4" />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={`
                    ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                    transition-colors
                  `}
                                >
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {column.render ? column.render(row) : row[column.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {paginatedData.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
                ) : (
                    paginatedData.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            onClick={() => onRowClick && onRowClick(row)}
                            className={`
                p-4 border border-gray-200 rounded-lg
                ${onRowClick ? 'cursor-pointer hover:border-primary-500' : ''}
              `}
                        >
                            {columns.map((column) => (
                                <div key={column.key} className="flex justify-between py-2 border-b last:border-b-0">
                                    <span className="font-medium text-gray-700">{column.header}</span>
                                    <span className="text-gray-900">
                                        {column.render ? column.render(row) : row[column.accessor]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="px-4 py-2 text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;