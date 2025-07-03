import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    flexRender,
    getCoreRowModel,
    SortingState,
    useReactTable,
    ColumnDef,
} from '@tanstack/react-table';
import { useSocketStore } from '../../lib/socket';
import { FetchEntitiesRequest, EntityDataResponse } from '@blog/shared/src/index';
import { LoadingSpinner } from './LoadingSpinner';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ColumnFilter, ColumnFilterConfig, FilterValue } from './ColumnFilter';

interface ColumnFilters {
    [columnId: string]: FilterValue;
}

interface DataTableProps<T> {
    entityType: 'posts' | 'users';
    columns: ColumnDef<T>[];
    initialSorting?: SortingState;
    enableGlobalFilter?: boolean;
    globalFilterPlaceholder?: string;
    enableColumnFilters?: boolean;
    columnFilterConfigs?: Record<string, ColumnFilterConfig>; // Config for each filterable column
    title: string;
    createButton?: React.ReactNode;
    defaultPageSize?: number;
    staleTime?: number;
    refetchOnMount?: boolean | 'always';
    onDataChange?: (data: any) => void; // Callback for external access to data/refetch
}

export function DataTable<T>({
    entityType,
    columns,
    initialSorting = [{ id: 'createdAt', desc: true }],
    enableGlobalFilter = false,
    globalFilterPlaceholder = 'Search...',
    enableColumnFilters = false,
    columnFilterConfigs = {},
    title,
    createButton,
    defaultPageSize = 20,
    staleTime = 1000 * 30,
    refetchOnMount = 'always',
    onDataChange,
}: DataTableProps<T>) {
    const { sendRequest } = useSocketStore();
    const [sorting, setSorting] = useState<SortingState>(initialSorting);
    const [globalFilter, setGlobalFilter] = useState('');
    const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    // Debounce global filter to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedGlobalFilter(globalFilter);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [globalFilter]);

    // Convert sorting state to server format with column mapping
    const serverSort = sorting.reduce((acc, sort) => {
        // Map client column IDs to server field names
        let serverFieldName = sort.id;

        // Handle nested field mapping (like author.displayName)
        if (sort.id === 'author.displayName') {
            serverFieldName = 'author.displayName';
        }

        acc[serverFieldName] = sort.desc ? 'desc' : 'asc';
        return acc;
    }, {} as Record<string, 'asc' | 'desc'>);

    // Convert column filters to server format
    const serverFilters: Record<string, any> = {};

    // Add global search if enabled
    if (debouncedGlobalFilter && enableGlobalFilter) {
        serverFilters.globalSearch = debouncedGlobalFilter;
    }

    // Add column filters
    Object.entries(columnFilters).forEach(([columnId, filter]) => {
        if (filter && filter.value !== '') {
            serverFilters[`${columnId}_${filter.operator}`] = filter.value;
            if (filter.value2 !== undefined) {
                serverFilters[`${columnId}_${filter.operator}_2`] = filter.value2;
            }
        }
    });

    // Fetch data with server-side pagination, sorting, and filtering
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [entityType, currentPage, pageSize, serverSort, serverFilters],
        queryFn: async () => {
            const request: FetchEntitiesRequest = {
                requestType: 'fetchEntities',
                requestParams: {
                    entityType,
                    sort: serverSort,
                    page: currentPage,
                    limit: pageSize,
                    filterOptions: Object.keys(serverFilters).length > 0 ? serverFilters : undefined,
                },
            };

            const response = await sendRequest<FetchEntitiesRequest, EntityDataResponse>(request);
            return response.responseParams.entities;
        },
        staleTime,
        refetchOnMount,
    });

    // Handle sorting changes
    const handleSortingChange = useCallback((updater: any) => {
        setSorting(updater);
        setCurrentPage(0); // Reset to first page when sorting changes
    }, []);

    // Handle global filter changes
    const handleGlobalFilterChange = useCallback((value: string) => {
        setGlobalFilter(value);
        setCurrentPage(0); // Reset to first page when filter changes
    }, []);

    // Handle column filter changes
    const handleColumnFilterChange = useCallback((columnId: string, filter: FilterValue | null) => {
        setColumnFilters(prev => {
            const newFilters = { ...prev };
            if (filter) {
                newFilters[columnId] = filter;
            } else {
                delete newFilters[columnId];
            }
            return newFilters;
        });
        setCurrentPage(0); // Reset to first page when filter changes
    }, []);

    // Extract data
    const tableData = (data?.data?.[entityType] || []) as T[];
    const totalPages = data?.totalPages || 0;
    const total = data?.total || 0;
    const filteredTotal = data?.filteredTotal || 0;

    // Expose data and refetch to parent component
    useEffect(() => {
        if (onDataChange) {
            onDataChange({ data, refetch, isLoading, error });
        }
    }, [data, refetch, isLoading, error, onDataChange]);

    // Configure table
    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            sorting,
        },
        onSortingChange: handleSortingChange,
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
                    onClick={() => refetch()}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const activeFiltersCount = Object.keys(columnFilters).length + (debouncedGlobalFilter ? 1 : 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{title}</h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Showing {tableData.length} of {filteredTotal} {entityType}
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
                            onChange={(e) => handleGlobalFilterChange(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    {globalFilter && (
                        <button
                            onClick={() => handleGlobalFilterChange('')}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            Clear
                        </button>
                    )}
                </div>
            )}

            {/* Clear All Filters */}
            {(enableColumnFilters && Object.keys(columnFilters).length > 0) && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setColumnFilters({})}
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
                                                            onChange={(filter) => handleColumnFilterChange(columnId, filter)}
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
                            {tableData.length > 0 ? (
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
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0 || isLoading}
                        >
                            Previous
                        </button>
                        <button
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
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
                                setPageSize(Number(e.target.value));
                                setCurrentPage(0);
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
