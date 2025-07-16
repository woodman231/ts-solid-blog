export type FilterType = 'text' | 'number' | 'date' | 'lookup' | 'boolean';

export type TextFilterOperator = 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals';
export type NumberFilterOperator = 'equals' | 'notEquals' | 'gt' | 'lt' | 'gte' | 'lte' | 'between';
export type DateFilterOperator = 'equals' | 'before' | 'after' | 'between';
export type LookupFilterOperator = 'in' | 'notIn';

export type FilterOperator = TextFilterOperator | NumberFilterOperator | DateFilterOperator | LookupFilterOperator;

export interface FilterValue {
    operator: FilterOperator;
    value: any;
    value2?: any; // For 'between' operations
}
