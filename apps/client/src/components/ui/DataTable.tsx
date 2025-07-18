import {
    flexRender,
    getCoreRowModel,
    SortingState,
    useReactTable,
    ColumnDef,
} from '@tanstack/react-table';
import { LoadingSpinner } from './LoadingSpinner';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ColumnFilter, ColumnFilterConfig } from './ColumnFilter';
import type { FilterValue } from "@blog/shared/types/filters";

interface ColumnFilters {
    [columnId: string]: FilterValue;
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    sorting: SortingState;
    onSortingChange: (updater: any) => void;
    globalFilter: string;
    onGlobalFilterChange: (value: string) => void;
    debouncedGlobalFilter: string;
    columnFilters: ColumnFilters;
    onColumnFilterChange: (columnId: string, filter: FilterValue | null) => void;
    currentPage: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    totalPages: number;
    total: number;
    filteredTotal: number;
    isLoading: boolean;
    error: any;
    onRefetch: () => void;
    enableGlobalFilter?: boolean;
    globalFilterPlaceholder?: string;
    enableColumnFilters?: boolean;
    columnFilterConfigs?: Record<string, ColumnFilterConfig>;
    title: string;
    createButton?: React.ReactNode;
    entityType?: string; // For display purposes (e.g., "No {entityType} found")
    activeFiltersCount: number;
    userChangedFiltersCount: number;
    onClearAllFilters: () => void;
}

export function DataTable<T>({
    data,
    columns,
    sorting,
    onSortingChange,
    globalFilter,
    onGlobalFilterChange,
    debouncedGlobalFilter,
    columnFilters,
    onColumnFilterChange,
    currentPage,
    onPageChange,
    pageSize,
    onPageSizeChange,
    totalPages,
    total,
    filteredTotal,
    isLoading,
    error,
    onRefetch,
    enableGlobalFilter = false,
    globalFilterPlaceholder = 'Search...',
    enableColumnFilters = false,
    columnFilterConfigs = {},
    title,
    createButton,
    entityType = 'items',
    activeFiltersCount,
    userChangedFiltersCount,
    onClearAllFilters,
}: DataTableProps<T>) {
    // Configure table
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        manualFiltering: true,
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        // Parse error message for user-friendly display
        let errorMessage = 'Unknown error occurred';

        if (error instanceof Error) {
            try {
                // Try to parse as socket error response
                const socketError = JSON.parse(error.message);
                if (socketError.responseParams?.error?.message) {
                    errorMessage = socketError.responseParams.error.message;
                } else {
                    errorMessage = error.message;
                }
            } catch {
                // If not JSON, use the error message directly
                errorMessage = error.message;
            }
        }

        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-red-800 font-medium">Unable to Load {title}</h3>
                </div>
                <p className="text-red-700 mt-2">{errorMessage}</p>
                <button
                    onClick={() => onRefetch()}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{title}</h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Showing {data.length} of {filteredTotal} {entityType}
                        {enableGlobalFilter && debouncedGlobalFilter && filteredTotal !== total && (
                            <span className="text-primary-600"> (filtered from {total} total)</span>
                        )}
                        {(!enableGlobalFilter || !debouncedGlobalFilter) && activeFiltersCount === 0 && (
                            <span> ({total} total)</span>
                        )}
                        {activeFiltersCount > 0 && (
                            <span className="text-primary-600"> ({activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active)</span>
                        )}
                    </div>
                    {createButton}
                </div>
            </div>

            {/* Global Search Filter */}
            {enableGlobalFilter && (
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            placeholder={globalFilterPlaceholder}
                            value={globalFilter}
                            onChange={(e) => onGlobalFilterChange(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    {globalFilter && (
                        <button
                            onClick={() => onGlobalFilterChange('')}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            Clear
                        </button>
                    )}
                </div>
            )}

            {/* Clear All Filters */}
            {(enableColumnFilters && userChangedFiltersCount > 0) && (
                <div className="flex justify-end">
                    <button
                        onClick={onClearAllFilters}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                    >
                        Clear all column filters
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => {
                                        const columnId = header.column.id;
                                        const filterConfig = columnFilterConfigs[columnId];
                                        const filterValue = columnFilters[columnId];

                                        return (
                                            <th
                                                key={header.id}
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                                            >
                                                <div className="space-y-2">
                                                    {/* Column Header with Sorting */}
                                                    <div
                                                        className={`flex items-center gap-2 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-gray-100 p-1 -m-1 rounded' : ''
                                                            }`}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        <span>
                                                            {typeof header.column.columnDef.header === 'string'
                                                                ? header.column.columnDef.header
                                                                : flexRender(header.column.columnDef.header, header.getContext())
                                                            }
                                                        </span>
                                                        {header.column.getCanSort() && (
                                                            <span>
                                                                {header.column.getIsSorted() === 'asc' ? ' 🔼' : header.column.getIsSorted() === 'desc' ? ' 🔽' : ''}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Column Filter */}
                                                    {enableColumnFilters && filterConfig && (
                                                        <ColumnFilter
                                                            config={filterConfig}
                                                            value={filterValue}
                                                            onChange={(filter) => onColumnFilterChange(columnId, filter)}
                                                            header={typeof header.column.columnDef.header === 'string'
                                                                ? header.column.columnDef.header
                                                                : columnId
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.length > 0 ? (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No {entityType} found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0 || isLoading}
                        >
                            Previous
                        </button>
                        <button
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage >= totalPages - 1 || isLoading}
                        >
                            Next
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                onPageSizeChange(Number(e.target.value));
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-700">
                    <span>
                        Page {currentPage + 1} of {Math.max(1, totalPages)}
                    </span>
                    <span>
                        ({currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, filteredTotal)} of {filteredTotal})
                    </span>
                </div>
            </div>
        </div>
    );
}

// Export types for external use
export type { DataTableProps, ColumnFilterConfig, FilterValue };
