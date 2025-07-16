import { FilterValue } from 'packages/shared/src/types/filters';
import { FilterOptions } from 'packages/shared/src/types/pagination';

type WhereCondition = { [key: string]: any };

// Helper functions for parsing column filters
export function parseColumnFilters(filters: FilterOptions): { where: WhereCondition; globalSearch?: string } {
    const where: WhereCondition = {};
    let globalSearch: string | undefined;

    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        // Handle global search
        if (key === 'globalSearch' && typeof value === 'string') {
            globalSearch = value;
            return;
        }

        // Handle structured FilterValue objects
        if (typeof value === 'object' && 'operator' in value && 'value' in value) {
            const filterValue = value as FilterValue;
            const fieldPath = mapColumnToField(key);
            if (!fieldPath) return;

            try {
                const condition = buildWhereCondition(fieldPath, filterValue);
                if (condition) {
                    setNestedValue(where, fieldPath, condition[fieldPath]);
                }
            } catch (error: any) {
                console.error(`Error building where condition for ${key}:`, error.message);
            }
        }
    });

    return { where, globalSearch };
}

function parseDate(value: any, isEndOfDay: boolean = false): Date {
    if (value instanceof Date) {
        return value;
    }

    if (typeof value === 'string') {
        // Handle date string - if it's just YYYY-MM-DD, convert to full ISO string
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            if (isEndOfDay) {
                // For end of day, use 23:59:59.999
                return new Date(`${value}T23:59:59.999Z`);
            } else {
                // For start of day, use midnight
                return new Date(`${value}T00:00:00.000Z`);
            }
        }

        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${value}`);
        }
        return date;
    }

    throw new Error(`Cannot parse date from value: ${value}`);
}

function mapColumnToField(columnId: string): string | null {
    // Map client column IDs to database field paths
    const mapping: Record<string, string> = {
        'title': 'title',
        'description': 'description',
        'body': 'body',
        'createdAt': 'createdAt',
        'updatedAt': 'updatedAt',
        'author.displayName': 'author.displayName',
        'author.email': 'author.email',
        'authorId': 'authorId', // For filtering by author IDs
        'displayName': 'displayName',
        'email': 'email',
    };

    return mapping[columnId] || null;
}

function buildWhereCondition(fieldPath: string, filter: FilterValue): WhereCondition | null {
    const { operator, value, value2 } = filter;

    if (value === '' || value === null || value === undefined) {
        return null;
    }

    let condition: any;

    switch (operator) {
        case 'contains':
            condition = { contains: value, mode: 'insensitive' };
            break;
        case 'startsWith':
            condition = { startsWith: value, mode: 'insensitive' };
            break;
        case 'endsWith':
            condition = { endsWith: value, mode: 'insensitive' };
            break;
        case 'equals':
            if (filter.operator === 'equals' && ['date', 'datetime'].includes(getFieldType(fieldPath))) {
                const startDate = parseDate(value);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 1);
                condition = { gte: startDate, lt: endDate };
            } else {
                condition = { equals: value };
            }
            break;
        case 'notEquals':
            condition = { not: value };
            break;
        case 'gt':
            condition = { gt: value };
            break;
        case 'lt':
            condition = { lt: value };
            break;
        case 'gte':
            condition = { gte: parseDate(value) };
            break;
        case 'lte':
            condition = { lte: parseDate(value, true) };
            break;
        case 'between':
            if (value2 !== undefined) {
                condition = { gte: parseDate(value), lte: parseDate(value2, true) };
            }
            break;
        case 'before':
            condition = { lt: parseDate(value) };
            break;
        case 'after':
            condition = { gt: parseDate(value, true) };
            break;
        case 'in':
            condition = { in: Array.isArray(value) ? value : [value] };
            break;
        case 'notIn':
            condition = { notIn: Array.isArray(value) ? value : [value] };
            break;
        default:
            return null;
    }

    const result: WhereCondition = {};
    setNestedValue(result, fieldPath, condition);
    return result;
}

function getFieldType(fieldPath: string): 'date' | 'datetime' | 'string' | 'number' | 'boolean' {
    if (fieldPath.toLowerCase().includes('at')) return 'datetime'; // createdAt, updatedAt
    return 'string';
}

function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
        if (!current[key]) {
            current[key] = {};
        }
        return current[key];
    }, obj);

    // Merge conditions for the same field path
    if (target[lastKey] && typeof target[lastKey] === 'object' && !Array.isArray(target[lastKey])) {
        target[lastKey] = { ...target[lastKey], ...value };
    } else {
        target[lastKey] = value;
    }
}
