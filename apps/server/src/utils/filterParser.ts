// Helper functions for parsing column filters
export function parseColumnFilters(filters: Record<string, any>): { where: any; globalSearch?: string } {
    const where: any = {};
    let globalSearch: string | undefined;

    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        // Handle global search
        if (key === 'globalSearch') {
            globalSearch = value as string;
            return;
        }

        // Parse column filter format: columnId_operator or columnId_operator_2
        const parts = key.split('_');
        if (parts.length < 2) return;

        const columnId = parts[0];
        const operator = parts[1];
        const isSecondValue = parts[2] === '2';

        // Map column IDs to Prisma field paths
        const fieldPath = mapColumnToField(columnId);
        if (!fieldPath) return;

        try {
            // Build the where condition based on operator
            const condition = buildWhereCondition(fieldPath, operator, value, isSecondValue);
            if (condition) {
                // Merge conditions for the same field (e.g., between operations)
                const existingCondition = getNestedValue(where, fieldPath);
                if (existingCondition && typeof existingCondition === 'object') {
                    setNestedValue(where, fieldPath, { ...existingCondition, ...condition });
                } else {
                    setNestedValue(where, fieldPath, condition);
                }
            }
        } catch (error: any) {
            // Log the error but don't fail the entire query
            console.warn(`Invalid filter value for ${columnId} with operator ${operator}:`, error.message);
            // Skip this filter and continue with others
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
        'displayName': 'displayName',
        'email': 'email',
    };

    return mapping[columnId] || null;
}

function buildWhereCondition(fieldPath: string, operator: string, value: any, isSecondValue: boolean): any {
    switch (operator) {
        case 'contains':
            return { contains: value, mode: 'insensitive' };

        case 'startsWith':
            return { startsWith: value, mode: 'insensitive' };

        case 'endsWith':
            return { endsWith: value, mode: 'insensitive' };

        case 'equals':
            // Handle date fields specially - for dates, "equals" means the entire day
            if (fieldPath === 'createdAt' || fieldPath === 'updatedAt') {
                const startOfDay = parseDate(value, false);
                const endOfDay = parseDate(value, true);
                return {
                    gte: startOfDay,
                    lte: endOfDay
                };
            }
            return { equals: value };

        case 'notEquals':
            if (fieldPath === 'createdAt' || fieldPath === 'updatedAt') {
                const startOfDay = parseDate(value, false);
                const endOfDay = parseDate(value, true);
                return {
                    NOT: {
                        AND: [
                            { gte: startOfDay },
                            { lte: endOfDay }
                        ]
                    }
                };
            }
            return { not: value };

        case 'gt':
            if (fieldPath === 'createdAt' || fieldPath === 'updatedAt') {
                // Greater than date means after the end of that day
                return { gt: parseDate(value, true) };
            }
            return { gt: value };

        case 'lt':
            if (fieldPath === 'createdAt' || fieldPath === 'updatedAt') {
                // Less than date means before the start of that day
                return { lt: parseDate(value, false) };
            }
            return { lt: value };

        case 'gte':
            if (fieldPath === 'createdAt' || fieldPath === 'updatedAt') {
                // Greater than or equal to date means from start of that day
                return { gte: parseDate(value, false) };
            }
            return { gte: value };

        case 'lte':
            if (fieldPath === 'createdAt' || fieldPath === 'updatedAt') {
                // Less than or equal to date means until end of that day
                return { lte: parseDate(value, true) };
            }
            return { lte: value };

        case 'between':
            if (fieldPath === 'createdAt' || fieldPath === 'updatedAt') {
                if (isSecondValue) {
                    // End date - use end of day
                    return { lte: parseDate(value, true) };
                } else {
                    // Start date - use start of day
                    return { gte: parseDate(value, false) };
                }
            }
            if (isSecondValue) {
                return { lte: value }; // This will be merged with gte from first value
            } else {
                return { gte: value };
            }

        case 'before':
            // Before date means before the start of that day
            return { lt: parseDate(value, false) };

        case 'after':
            // After date means after the end of that day
            return { gt: parseDate(value, true) };

        case 'in':
            return { in: Array.isArray(value) ? value : [value] };

        case 'notIn':
            return { notIn: Array.isArray(value) ? value : [value] };

        default:
            return null;
    }
}

function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
        if (!current[key]) current[key] = {};
        return current[key];
    }, obj);
    target[lastKey] = value;
}
