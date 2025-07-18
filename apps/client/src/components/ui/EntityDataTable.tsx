import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SortingState, ColumnDef } from '@tanstack/react-table';
import { useSocketStore } from '../../lib/socket';
import { FetchEntitiesRequest, EntityDataResponse } from '@blog/shared/src/index';
import { EntityType } from '@blog/shared/src/index';
import type { FilterValue } from "@blog/shared/types/filters";
import { DataTable, ColumnFilterConfig } from './DataTable';

interface ColumnFilters {
    [columnId: string]: FilterValue;
}

interface EntityDataTableProps<T> {
    entityType: EntityType;
    columns: ColumnDef<T>[];
    initialSorting?: SortingState;
    enableGlobalFilter?: boolean;
    globalFilterPlaceholder?: string;
    enableColumnFilters?: boolean;
    columnFilterConfigs?: Record<string, ColumnFilterConfig>;
    columnSortMapping?: Record<string, string>;
    title: string;
    createButton?: React.ReactNode;
    defaultPageSize?: number;
    staleTime?: number;
    refetchOnMount?: boolean | 'always';
    onDataChange?: (data: any) => void;
}

export function EntityDataTable<T>({
    entityType,
    columns,
    initialSorting = [{ id: 'createdAt', desc: true }],
    enableGlobalFilter = false,
    globalFilterPlaceholder = 'Search...',
    enableColumnFilters = false,
    columnFilterConfigs = {},
    columnSortMapping = {},
    title,
    createButton,
    defaultPageSize = 20,
    staleTime = 1000 * 30,
    refetchOnMount = 'always',
    onDataChange,
}: EntityDataTableProps<T>) {
    const { sendRequest } = useSocketStore();
    const [sorting, setSorting] = useState<SortingState>(initialSorting);
    const [globalFilter, setGlobalFilter] = useState('');
    const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    // Initialize default filters
    useEffect(() => {
        const defaultFilters: ColumnFilters = {};
        Object.entries(columnFilterConfigs).forEach(([columnId, config]) => {
            if (config.defaultValue) {
                defaultFilters[columnId] = config.defaultValue;
            }
        });
        if (Object.keys(defaultFilters).length > 0) {
            setColumnFilters(defaultFilters);
        }
    }, [columnFilterConfigs]);

    // Debounce global filter to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedGlobalFilter(globalFilter);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [globalFilter]);

    // Convert sorting state to server format with column mapping
    const serverSort = sorting.reduce((acc, sort) => {
        // Map client column IDs to server field names using provided mapping
        const serverFieldName = columnSortMapping[sort.id] || sort.id;

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
            serverFilters[columnId] = filter;
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
        // Prevent changes to immutable filters
        const config = columnFilterConfigs[columnId];
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
    }, [columnFilterConfigs]);

    // Handle pagination changes
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(0);
    }, []);

    // Calculate active filters count excluding immutable filters
    const userChangedFiltersCount = Object.keys(columnFilters).filter(columnId => {
        const config = columnFilterConfigs[columnId];
        return !config?.immutable;
    }).length;
    const activeFiltersCount = userChangedFiltersCount + (debouncedGlobalFilter ? 1 : 0);

    // Handle clear all filters
    const handleClearAllFilters = useCallback(() => {
        // Preserve immutable filters when clearing
        const preservedFilters: ColumnFilters = {};
        Object.entries(columnFilterConfigs).forEach(([columnId, config]) => {
            if (config.immutable && columnFilters[columnId]) {
                preservedFilters[columnId] = columnFilters[columnId];
            }
        });
        setColumnFilters(preservedFilters);
    }, [columnFilterConfigs, columnFilters]);

    return (
        <DataTable
            data={tableData}
            columns={columns}
            sorting={sorting}
            onSortingChange={handleSortingChange}
            globalFilter={globalFilter}
            onGlobalFilterChange={handleGlobalFilterChange}
            debouncedGlobalFilter={debouncedGlobalFilter}
            columnFilters={columnFilters}
            onColumnFilterChange={handleColumnFilterChange}
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
            enableGlobalFilter={enableGlobalFilter}
            globalFilterPlaceholder={globalFilterPlaceholder}
            enableColumnFilters={enableColumnFilters}
            columnFilterConfigs={columnFilterConfigs}
            title={title}
            createButton={createButton}
            entityType={entityType}
            activeFiltersCount={activeFiltersCount}
            userChangedFiltersCount={userChangedFiltersCount}
            onClearAllFilters={handleClearAllFilters}
        />
    );
}

// Export types for external use
export type { EntityDataTableProps, ColumnFilterConfig, FilterValue };
