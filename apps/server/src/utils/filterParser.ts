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
    });

    return { where, globalSearch };
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
            return { equals: value };

        case 'notEquals':
            return { not: value };

        case 'gt':
            return { gt: value };

        case 'lt':
            return { lt: value };

        case 'gte':
            return { gte: value };

        case 'lte':
            return { lte: value };

        case 'between':
            if (isSecondValue) {
                return { lte: value }; // This will be merged with gte from first value
            } else {
                return { gte: value };
            }

        case 'before':
            return { lt: new Date(value) };

        case 'after':
            return { gt: new Date(value) };

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
