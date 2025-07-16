import { FilterValue } from './filters';

export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface SortOptions {
    [key: string]: 'asc' | 'desc';
}

export interface FilterOptions {
    globalSearch?: string;
    [columnId: string]: FilterValue | string | undefined;
}

export interface QueryOptions {
    pagination?: PaginationOptions;
    sort?: SortOptions;
    filter?: FilterOptions;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    filteredTotal: number;
    page: number;
    limit: number;
    totalPages: number;
}