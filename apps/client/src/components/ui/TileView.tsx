import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useSocketStore } from '../../lib/socket';
import { FetchEntitiesRequest, EntityDataResponse } from '@blog/shared/src/index';
import { EntityType } from '@blog/shared/src/index';
import { ColumnFilter, ColumnFilterConfig } from './ColumnFilter';
import type { FilterValue } from "@blog/shared/types/filters";

// Action button configuration
export interface TileActionConfig {
    label: string;
    variant: 'primary' | 'secondary' | 'danger';
    onClick: (item: any) => void;
    show?: (item: any) => boolean; // Optional condition to show/hide action
    icon?: React.ComponentType<{ className?: string }>; // Optional icon component
}

// Tile renderer function type
export type TileRenderer<T> = (item: T, actions?: React.ReactNode) => React.ReactNode;

interface TileViewProps<T> {
    entityType: EntityType;
    tileRenderer: TileRenderer<T>;
    initialSorting?: Record<string, 'asc' | 'desc'>;
    enableGlobalFilter?: boolean;
    globalFilterPlaceholder?: string;
    enableFilters?: boolean;
    filterConfigs?: Record<string, ColumnFilterConfig>; // Changed from TileFilterConfig[] to Record<string, ColumnFilterConfig>
    title: string;
    createButton?: React.ReactNode;
    actions?: TileActionConfig[];
    defaultPageSize?: number;
    staleTime?: number;
    refetchOnMount?: boolean | 'always';
    onDataChange?: (data: any) => void;
    emptyStateMessage?: string;
    tileContainerClassName?: string; // Custom CSS classes for tile container
    loadingRows?: number; // Number of skeleton tiles to show while loading
}

export function TileView<T>({
    entityType,
    tileRenderer,
    initialSorting = { createdAt: 'desc' },
    enableGlobalFilter = true,
    globalFilterPlaceholder = 'Search...',
    enableFilters = false,
    filterConfigs = {},
    title,
    createButton,
    actions = [],
    defaultPageSize = 20,
    staleTime = 1000 * 30,
    refetchOnMount = 'always',
    onDataChange,
    emptyStateMessage,
    tileContainerClassName = 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
    loadingRows = 6,
}: TileViewProps<T>) {
    const { sendRequest } = useSocketStore();

    const [globalFilter, setGlobalFilter] = useState('');
    const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<Record<string, FilterValue>>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [showFilters, setShowFilters] = useState(false);

    // Initialize default filters
    useEffect(() => {
        const defaultFilters: Record<string, FilterValue> = {};
        Object.entries(filterConfigs).forEach(([columnId, config]) => {
            if (config.defaultValue) {
                defaultFilters[columnId] = config.defaultValue;
            }
        });
        if (Object.keys(defaultFilters).length > 0) {
            setColumnFilters(defaultFilters);
        }
    }, [filterConfigs]);

    // Debounce global filter to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedGlobalFilter(globalFilter);
        }, 300);
        return () => clearTimeout(timer);
    }, [globalFilter]);

    // Build server filters
    const serverFilters: Record<string, any> = {};

    // Add global search if enabled
    if (debouncedGlobalFilter && enableGlobalFilter) {
        serverFilters.globalSearch = debouncedGlobalFilter;
    }

    // Add column filters
    Object.entries(columnFilters).forEach(([columnId, filter]) => {
        if (filter && filter.value !== '') {
            serverFilters[columnId] = filter;
        }
    });

    // Fetch data with server-side pagination, sorting, and filtering
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [entityType, currentPage, pageSize, initialSorting, serverFilters],
        queryFn: async () => {
            const request: FetchEntitiesRequest = {
                requestType: 'fetchEntities',
                requestParams: {
                    entityType,
                    sort: initialSorting,
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

    // Handle global filter changes
    const handleGlobalFilterChange = useCallback((value: string) => {
        setGlobalFilter(value);
        setCurrentPage(0);
    }, []);

    // Handle column filter changes
    const handleColumnFilterChange = useCallback((columnId: string, filter: FilterValue | null) => {
        // Prevent changes to immutable filters
        const config = filterConfigs[columnId];
        if (config?.immutable) {
            return;
        }

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
    }, [filterConfigs]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        setGlobalFilter('');

        // Preserve immutable filters when clearing
        const preservedFilters: Record<string, FilterValue> = {};
        Object.entries(filterConfigs).forEach(([columnId, config]) => {
            if (config.immutable && config.defaultValue) {
                preservedFilters[columnId] = config.defaultValue;
            }
        });
        setColumnFilters(preservedFilters);

        setCurrentPage(0);
    }, [filterConfigs]);

    // Extract data
    const tileData = (data?.data?.[entityType] || []) as T[];
    const totalPages = data?.totalPages || 0;
    const total = data?.total || 0;
    const filteredTotal = data?.filteredTotal || 0;

    // Expose data and refetch to parent component
    useEffect(() => {
        if (onDataChange) {
            onDataChange({ data, refetch, isLoading, error });
        }
    }, [data, refetch, isLoading, error, onDataChange]);

    // Generate action buttons for a tile
    const generateActionButtons = useCallback((item: any) => {
        if (actions.length === 0) return null;

        const visibleActions = actions.filter(action => !action.show || action.show(item));
        if (visibleActions.length === 0) return null;

        return (
            <div className="flex items-center gap-2 mt-4">
                {visibleActions.map((action, index) => {
                    const buttonClass = `px-3 py-1 text-sm font-medium rounded-md transition-colors ${action.variant === 'primary'
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : action.variant === 'danger'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`;

                    return (
                        <button
                            key={index}
                            onClick={() => action.onClick(item)}
                            className={buttonClass}
                        >
                            {action.icon && <action.icon className="w-4 h-4 mr-1 inline" />}
                            {action.label}
                        </button>
                    );
                })}
            </div>
        );
    }, [actions]);

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className={tileContainerClassName}>
            {Array.from({ length: loadingRows }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="space-y-2 mb-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
            ))}
        </div>
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    {createButton}
                </div>

                {/* Search and filters */}
                {enableGlobalFilter && (
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder={globalFilterPlaceholder}
                                disabled
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-gray-50"
                            />
                        </div>
                    </div>
                )}

                <LoadingSkeleton />
            </div>
        );
    }

    if (error) {
        // Parse error message for user-friendly display
        let errorMessage = 'Unknown error occurred';

        if (error instanceof Error) {
            try {
                const socketError = JSON.parse(error.message);
                if (socketError.responseParams?.error?.message) {
                    errorMessage = socketError.responseParams.error.message;
                } else {
                    errorMessage = error.message;
                }
            } catch {
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

    const activeFiltersCount = Object.keys(columnFilters).filter(columnId => {
        const config = filterConfigs[columnId];
        return !config?.immutable;
    }).length + (debouncedGlobalFilter ? 1 : 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{title}</h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Showing {tileData.length} of {filteredTotal} {entityType}
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

            {/* Global Search and Filters */}
            <div className="space-y-4">
                {/* Global Search */}
                {enableGlobalFilter && (
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder={globalFilterPlaceholder}
                                value={globalFilter}
                                onChange={(e) => handleGlobalFilterChange(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        {/* Filter toggle button */}
                        {enableFilters && Object.keys(filterConfigs).length > 0 && (
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${showFilters || Object.keys(columnFilters).filter(columnId => {
                                    const config = filterConfigs[columnId];
                                    return !config?.immutable;
                                }).length > 0
                                    ? 'bg-primary-100 border-primary-300 text-primary-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <FunnelIcon className="h-4 w-4" />
                                Filters
                                {Object.keys(columnFilters).filter(columnId => {
                                    const config = filterConfigs[columnId];
                                    return !config?.immutable;
                                }).length > 0 && (
                                        <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-0.5">
                                            {Object.keys(columnFilters).filter(columnId => {
                                                const config = filterConfigs[columnId];
                                                return !config?.immutable;
                                            }).length}
                                        </span>
                                    )}
                                <ChevronDownIcon className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>
                        )}

                        {/* Clear filters button */}
                        {(globalFilter || Object.keys(columnFilters).filter(columnId => {
                            const config = filterConfigs[columnId];
                            return !config?.immutable;
                        }).length > 0) && (
                                <button
                                    onClick={clearAllFilters}
                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Clear All
                                </button>
                            )}
                    </div>
                )}

                {/* Expandable Filters */}
                {enableFilters && Object.keys(filterConfigs).length > 0 && showFilters && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(filterConfigs).map(([columnId, config]) => (
                                <div key={columnId} className="flex flex-col">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {config.label || columnId}
                                    </label>
                                    <div className="flex-1">
                                        <ColumnFilter
                                            config={config}
                                            value={columnFilters[columnId]}
                                            onChange={(filter) => handleColumnFilterChange(columnId, filter)}
                                            header={config.label || columnId}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Tiles */}
            {tileData.length > 0 ? (
                <div className={tileContainerClassName}>
                    {tileData.map((item: any) =>
                        tileRenderer(item, generateActionButtons(item))
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-500 text-lg">
                        {emptyStateMessage || `No ${entityType} found`}
                    </div>
                    {activeFiltersCount > 0 && (
                        <p className="text-sm text-gray-400 mt-2">
                            Try adjusting your filters to see more results
                        </p>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                            >
                                Previous
                            </button>
                            <button
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage >= totalPages - 1}
                            >
                                Next
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Items per page:</span>
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
            )}
        </div>
    );
}

// Export types for external use - already exported above with definitions
