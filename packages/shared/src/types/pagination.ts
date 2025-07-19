import type { FilterValue } from './filters';

export interface PaginationOptions {
    page: number;
    limit: number;
}

export type SortOptions<T extends Record<string, any> = Record<string, any>> = {
    [K in keyof T]?: 'asc' | 'desc';
};

export type FilterOptions<T extends Record<string, any> = Record<string, any>> = {
    globalSearch?: string;
} & Partial<Record<keyof T, FilterValue>>;

export interface QueryOptions<T extends Record<string, any> = Record<string, any>> {
    pagination?: PaginationOptions;
    sort?: SortOptions<T>;
    filter?: FilterOptions<T>;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    filteredTotal: number;
    page: number;
    limit: number;
    totalPages: number;
}