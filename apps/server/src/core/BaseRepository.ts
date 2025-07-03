import { PrismaClient } from '@prisma/client';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { parseColumnFilters } from '../utils/filterParser';

/**
 * Configuration for the repository factory
 */
export interface RepositoryConfig<TShared, TPrisma> {
    /** The Prisma model delegate (e.g., prisma.user, prisma.post) */
    model: any;

    /** Function to map Prisma entity to shared model */
    mapToShared: (prismaEntity: TPrisma) => TShared;

    /** Function to map shared model to Prisma create input */
    mapToCreateInput?: (sharedEntity: Omit<TShared, 'id' | 'createdAt' | 'updatedAt'>) => any;

    /** Function to map shared model to Prisma update input */
    mapToUpdateInput?: (sharedEntity: Partial<TShared>) => any;

    /** Global search configuration */
    globalSearchConfig?: {
        /** Fields to search in for global search */
        searchFields: Array<{
            /** Field path (e.g., 'title', 'author.displayName') */
            field: string;
            /** Whether this is a nested field requiring include */
            isNested?: boolean;
        }>;
    };

    /** Default sorting configuration */
    defaultSort?: Record<string, 'asc' | 'desc'>;

    /** Prisma include configuration for relations */
    include?: any;

    /** Custom column to field mapping for filtering */
    columnFieldMapping?: Record<string, string>;
}

/**
 * Abstract base repository that provides common CRUD operations
 */
export abstract class BaseRepository<TShared, TPrisma> {
    protected config: RepositoryConfig<TShared, TPrisma>;

    constructor(
        protected prisma: PrismaClient,
        config: RepositoryConfig<TShared, TPrisma>
    ) {
        this.config = config;
    }

    async findAll(options?: QueryOptions): Promise<PaginatedResult<TShared>> {
        try {
            const page = options?.pagination?.page ?? 0;
            const limit = options?.pagination?.limit ?? 10;
            const skip = page * limit;

            // Build where clause for filtering
            const { where, orderBy } = await this.buildQueryConditions(options);

            // Execute queries in parallel
            const [entities, total, filteredTotal] = await Promise.all([
                this.config.model.findMany({
                    where,
                    orderBy,
                    skip,
                    take: limit,
                    include: this.config.include
                }),
                this.config.model.count(), // Total count without filters
                this.config.model.count({ where }), // Total count with filters
            ]);

            return {
                data: entities.map(this.config.mapToShared),
                total,
                filteredTotal,
                page,
                limit,
                totalPages: Math.ceil(filteredTotal / limit),
            };
        } catch (error: any) {
            this.handleError(error, 'findAll', { options });
            throw error; // Re-throw after logging
        }
    }

    async findById(id: string): Promise<TShared | null> {
        try {
            const entity = await this.config.model.findUnique({
                where: { id },
                include: this.config.include
            });
            return entity ? this.config.mapToShared(entity) : null;
        } catch (error: any) {
            this.handleError(error, 'findById', { id });
            throw error;
        }
    }

    async create(data: Omit<TShared, 'id' | 'createdAt' | 'updatedAt'>): Promise<TShared> {
        try {
            const createInput = this.config.mapToCreateInput
                ? this.config.mapToCreateInput(data)
                : data;

            const entity = await this.config.model.create({
                data: createInput,
                include: this.config.include
            });

            return this.config.mapToShared(entity);
        } catch (error: any) {
            this.handleError(error, 'create', { data });
            throw error;
        }
    }

    async update(id: string, data: Partial<TShared>): Promise<TShared> {
        try {
            const updateInput = this.config.mapToUpdateInput
                ? this.config.mapToUpdateInput(data)
                : data;

            const entity = await this.config.model.update({
                where: { id },
                data: updateInput,
                include: this.config.include
            });

            return this.config.mapToShared(entity);
        } catch (error: any) {
            this.handleError(error, 'update', { id, data });
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.config.model.delete({
                where: { id }
            });
            return true;
        } catch (error: any) {
            this.handleError(error, 'delete', { id });
            throw error;
        }
    }

    /**
     * Build where and orderBy conditions from query options
     */
    protected async buildQueryConditions(options?: QueryOptions): Promise<{
        where: any;
        orderBy: any;
    }> {
        let where: any = {};
        let globalSearch: string | undefined;

        // Handle filtering
        if (options?.filter) {
            const parsedFilters = parseColumnFilters(options.filter);
            where = parsedFilters.where;
            globalSearch = parsedFilters.globalSearch;

            // Handle global search
            if (globalSearch && this.config.globalSearchConfig) {
                const globalConditions = this.config.globalSearchConfig.searchFields.map(({ field }) => {
                    const condition: any = {};
                    this.setNestedValue(condition, field, {
                        contains: globalSearch,
                        mode: 'insensitive'
                    });
                    return condition;
                });

                // Combine with existing filters
                if (Object.keys(where).length > 0) {
                    where = {
                        AND: [
                            where,
                            { OR: globalConditions }
                        ]
                    };
                } else {
                    where.OR = globalConditions;
                }
            }
        }

        // Handle sorting
        const orderBy: any = {};
        if (options?.sort) {
            Object.keys(options.sort).forEach(key => {
                // Handle nested sorting
                if (key.includes('.')) {
                    this.setNestedValue(orderBy, key, options.sort![key]);
                } else {
                    orderBy[key] = options.sort![key];
                }
            });
        } else if (this.config.defaultSort) {
            Object.assign(orderBy, this.config.defaultSort);
        } else {
            orderBy.createdAt = 'desc'; // Default fallback
        }

        return { where, orderBy };
    }

    /**
     * Set nested value in object using dot notation
     */
    protected setNestedValue(obj: any, path: string, value: any): void {
        const keys = path.split('.');
        const lastKey = keys.pop()!;
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    /**
     * Handle errors with consistent logging and user-friendly messages
     */
    protected handleError(error: any, operation: string, context?: any): void {
        console.error(`Error in ${this.constructor.name}.${operation}:`, {
            error: error.message,
            stack: error.stack,
            context
        });

        // Transform database errors to user-friendly messages
        if (error.code === 'P2025') {
            throw new Error(`${operation === 'findById' ? 'Record' : 'Data'} not found`);
        } else if (error.message?.includes('Invalid')) {
            throw new Error(`Invalid filter or search criteria: ${error.message}`);
        } else if (error.message?.includes('unique constraint')) {
            throw new Error('A record with this information already exists');
        } else {
            throw new Error(`Database error occurred during ${operation}`);
        }
    }
}

/**
 * Factory function to create repository instances
 */
export function createRepository<TShared, TPrisma>(
    prisma: PrismaClient,
    config: RepositoryConfig<TShared, TPrisma>
): BaseRepository<TShared, TPrisma> {
    return new (class extends BaseRepository<TShared, TPrisma> { })(prisma, config);
}
