import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSocketStore } from '../../lib/socket';
import { FetchEntitiesRequest, EntityDataResponse } from '@blog/shared/src/index';
import { EntityType } from '@blog/shared/src/index';
import type { FilterValue } from "@blog/shared/types/filters";
import { TileView, TileActionConfig, TileRenderer, TileSortConfig } from './TileView';
import { ColumnFilterConfig } from './ColumnFilter';

interface EntityTileViewProps<T> {
    entityType: EntityType;
    tileRenderer: TileRenderer<T>;
    initialSorting?: Record<string, 'asc' | 'desc'>;
    enableGlobalFilter?: boolean;
    globalFilterPlaceholder?: string;
    enableFilters?: boolean;
    filterConfigs?: Record<string, ColumnFilterConfig>;
    enableSorting?: boolean;
    sortConfigs?: TileSortConfig[];
    title: string;
    createButton?: React.ReactNode;
    actions?: TileActionConfig[];
    defaultPageSize?: number;
    staleTime?: number;
    refetchOnMount?: boolean | 'always';
    onDataChange?: (data: any) => void;
    emptyStateMessage?: string;
    tileContainerClassName?: string;
    loadingRows?: number;
}

export function EntityTileView<T>({
    entityType,
    tileRenderer,
    initialSorting = { createdAt: 'desc' },
    enableGlobalFilter = true,
    globalFilterPlaceholder = 'Search...',
    enableFilters = false,
    filterConfigs = {},
    enableSorting = true,
    sortConfigs = [],
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
}: EntityTileViewProps<T>) {
    const { sendRequest } = useSocketStore();

    const [globalFilter, setGlobalFilter] = useState('');
    const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<Record<string, FilterValue>>({});
    const [sorting, setSorting] = useState<Record<string, 'asc' | 'desc'>>(initialSorting);
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
    const handleClearAllFilters = useCallback(() => {
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

    // Handle sorting changes
    const handleSortingChange = useCallback((columnId: string) => {
        setSorting(prev => {
            const currentDirection = prev[columnId];
            const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
            return { [columnId]: newDirection };
        });
        setCurrentPage(0); // Reset to first page when sorting changes
    }, []);

    // Handle pagination changes
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(0);
    }, []);

    const handleShowFiltersToggle = useCallback(() => {
        setShowFilters(prev => !prev);
    }, []);

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

    // Convert sorting to server format with field mapping
    const serverSort = Object.entries(sorting).reduce((acc, [key, direction]) => {
        const sortConfig = sortConfigs.find(config => config.key === key);
        const serverField = sortConfig?.serverField || key;
        acc[serverField] = direction;
        return acc;
    }, {} as Record<string, 'asc' | 'desc'>);

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

    // Calculate active filters count excluding immutable filters
    const activeFiltersCount = Object.keys(columnFilters).filter(columnId => {
        const config = filterConfigs[columnId];
        return !config?.immutable;
    }).length + (debouncedGlobalFilter ? 1 : 0);

    return (
        <TileView
            data={tileData}
            tileRenderer={tileRenderer}
            globalFilter={globalFilter}
            onGlobalFilterChange={handleGlobalFilterChange}
            debouncedGlobalFilter={debouncedGlobalFilter}
            columnFilters={columnFilters}
            onColumnFilterChange={handleColumnFilterChange}
            onClearAllFilters={handleClearAllFilters}
            sorting={sorting}
            onSortingChange={handleSortingChange}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            totalPages={totalPages}
            total={total}
            filteredTotal={filteredTotal}
            isLoading={isLoading}
            error={error}
            onRefetch={refetch}
            showFilters={showFilters}
            onShowFiltersToggle={handleShowFiltersToggle}
            activeFiltersCount={activeFiltersCount}
            enableGlobalFilter={enableGlobalFilter}
            globalFilterPlaceholder={globalFilterPlaceholder}
            enableFilters={enableFilters}
            filterConfigs={filterConfigs}
            enableSorting={enableSorting}
            sortConfigs={sortConfigs}
            title={title}
            createButton={createButton}
            actions={actions}
            emptyStateMessage={emptyStateMessage}
            tileContainerClassName={tileContainerClassName}
            loadingRows={loadingRows}
            entityType={entityType}
        />
    );
}

// Export types for external use
export type { EntityTileViewProps, TileActionConfig, TileRenderer, TileSortConfig };
