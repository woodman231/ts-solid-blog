import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { IBaseRepository, PrismaModelDelegate } from './BaseRepository';

/**
 * Helper function to create a ServiceContext object
 */
export function createServiceContext(userId: string, roles?: string[], metadata?: Record<string, any>): ServiceContext {
    return {
        userId,
        roles,
        metadata
    };
}

/**
 * Context object for service operations that require user authentication or other metadata
 */
export interface ServiceContext {
    /** The ID of the user performing the operation */
    userId: string;

    /** Optional user roles for role-based access control */
    roles?: string[];

    /** Optional additional metadata that might be needed for authorization */
    metadata?: Record<string, any>;
}

/**
 * Base service interface that all services should implement
 */
export interface IBaseService<T extends Record<string, any> = Record<string, any>> {
    getAll(options?: QueryOptions<T>): Promise<PaginatedResult<T>>;
    getById(id: string): Promise<T | null>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<boolean>;

    setContext(context: ServiceContext): void;
    getContext(): ServiceContext | undefined;
}

/**
 * Configuration for the service factory
 */
export interface ServiceConfig<
    T extends Record<string, any> = Record<string, any>,
    R extends IBaseRepository<T, any, PrismaModelDelegate> = IBaseRepository<T, any, PrismaModelDelegate>
> {
    /** The repository instance to use for data operations */
    repository: R;

    /** Optional validation function for create operations */
    validateCreate?: (data: Partial<T>) => Promise<void> | void;

    /** Optional validation function for update operations */
    validateUpdate?: (id: string, data: Partial<T>) => Promise<void> | void;

    /** Optional function to enrich entities after retrieval */
    enrichEntity?: (entity: T) => Promise<T> | T;

    /** Optional authorization check function */
    checkAuthorization?: (userId: string, operation: string, entityId?: string) => Promise<boolean> | boolean;

    /** Optional function to transform data before saving */
    transformBeforeSave?: (data: any) => any;

    /** Optional function to transform data after retrieval */
    transformAfterRetrieval?: (data: any) => any;
}

/**
 * Abstract base service that provides common operations
 */
export abstract class BaseService<T extends Record<string, any>, R extends IBaseRepository<T, any, PrismaModelDelegate> = IBaseRepository<T, any, PrismaModelDelegate>> implements IBaseService<T> {
    protected config: ServiceConfig<T, R>;
    protected context?: ServiceContext;

    constructor(config: ServiceConfig<T, R>) {
        this.config = config;
    }

    /**
     * Get the typed repository instance
     */
    protected get repository(): R {
        return this.config.repository;
    }

    setContext(context: ServiceContext): void {
        this.context = context;
    }

    getContext(): ServiceContext | undefined {
        return this.context;
    }

    async getAll(options?: QueryOptions<T>): Promise<PaginatedResult<T>> {
        const context = this.getContext();

        try {
            if (!context) {
                throw new Error('Service context is not set');
            }

            // Check authorization for read operation
            if (this.config.checkAuthorization) {
                const authorized = await this.config.checkAuthorization(context.userId, 'read');
                if (!authorized) {
                    throw new Error('Unauthorized: You do not have permission to view this resource');
                }
            }

            const result = await this.config.repository.findAll(options);

            // Enrich entities if enrichment function is provided
            if (this.config.enrichEntity) {
                const enrichedData = await Promise.all(
                    result.data.map((entity: T) => this.config.enrichEntity!(entity))
                );
                result.data = enrichedData;
            }

            // Transform after retrieval if function is provided
            if (this.config.transformAfterRetrieval) {
                result.data = result.data.map((entity: T) => this.config.transformAfterRetrieval!(entity));
            }

            return result;
        } catch (error: any) {
            this.handleError(error, 'getAll', { context, options });
            throw error;
        }
    }

    async getById(id: string): Promise<T | null> {
        const context = this.getContext();

        try {
            if (!context) {
                throw new Error('Service context is not set');
            }

            // Check authorization for read operation
            if (this.config.checkAuthorization) {
                const authorized = await this.config.checkAuthorization(context.userId, 'read', id);
                if (!authorized) {
                    throw new Error('Unauthorized: You do not have permission to view this resource');
                }
            }

            let entity = await this.config.repository.findById(id);

            if (!entity) return null;

            // Enrich entity if enrichment function is provided
            if (this.config.enrichEntity) {
                entity = await this.config.enrichEntity(entity);
            }

            // Transform after retrieval if function is provided
            if (this.config.transformAfterRetrieval) {
                entity = this.config.transformAfterRetrieval(entity);
            }

            return entity;
        } catch (error: any) {
            this.handleError(error, 'getById', { context, id });
            throw error;
        }
    }

    async create(data: Partial<T>): Promise<T> {
        const context = this.getContext();
        try {
            if (!context) {
                throw new Error('Service context is not set');
            }
            // Check authorization for create operation
            if (this.config.checkAuthorization) {
                const authorized = await this.config.checkAuthorization(context.userId, 'create');
                if (!authorized) {
                    throw new Error('Unauthorized: You do not have permission to create this resource');
                }
            }

            // Validate if validation function is provided
            if (this.config.validateCreate) {
                await this.config.validateCreate(data);
            }

            // Transform before save if function is provided
            let transformedData = data;
            if (this.config.transformBeforeSave) {
                transformedData = this.config.transformBeforeSave(data);
            }

            let entity = await this.config.repository.create(transformedData);

            // Enrich entity if enrichment function is provided
            if (this.config.enrichEntity) {
                entity = await this.config.enrichEntity(entity);
            }

            // Transform after retrieval if function is provided
            if (this.config.transformAfterRetrieval) {
                entity = this.config.transformAfterRetrieval(entity);
            }

            return entity;
        } catch (error: any) {
            this.handleError(error, 'create', { context, data });
            throw error;
        }
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        const context = this.getContext();
        try {
            if (!context) {
                throw new Error('Service context is not set');
            }
            // Check authorization for update operation
            if (this.config.checkAuthorization) {
                const authorized = await this.config.checkAuthorization(context.userId, 'update', id);
                if (!authorized) {
                    throw new Error('Unauthorized: You do not have permission to update this resource');
                }
            }

            return await this.update(id, data);
        } catch (error: any) {
            this.handleError(error, 'update', { context, id, data });
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        const context = this.getContext();
        try {
            if (!context) {
                throw new Error('Service context is not set');
            }
            // Check authorization for delete operation
            if (this.config.checkAuthorization) {
                const authorized = await this.config.checkAuthorization(context.userId, 'delete', id);
                if (!authorized) {
                    throw new Error('Unauthorized: You do not have permission to delete this resource');
                }
            }

            return await this.delete(id);
        } catch (error: any) {
            this.handleError(error, 'delete', { context, id });
            throw error;
        }
    }

    /**
     * Handle errors with consistent logging
     */
    protected handleError(error: any, operation: string, context?: any): void {
        console.error(`Error in ${this.constructor.name}.${operation}:`, {
            error: error.message,
            stack: error.stack,
            context
        });

        // You can add more sophisticated error handling here
        // For example, transform specific repository errors to service-level errors
    }
}
