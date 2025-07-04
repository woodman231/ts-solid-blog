import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { IBaseRepository, PrismaModelDelegate } from './BaseRepository';

/**
 * Base service interface that all services should implement
 */
export interface IBaseService<T> {
    getAll(options?: QueryOptions): Promise<PaginatedResult<T>>;
    getById(id: string): Promise<T | null>;
    create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<boolean>;
}

/**
 * Configuration for the service factory
 */
export interface ServiceConfig<T, R extends IBaseRepository<T, any, PrismaModelDelegate> = IBaseRepository<T, any, PrismaModelDelegate>> {
    /** The repository instance to use for data operations */
    repository: R;

    /** Optional validation function for create operations */
    validateCreate?: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void> | void;

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
export abstract class BaseService<T, R extends IBaseRepository<T, any, PrismaModelDelegate> = IBaseRepository<T, any, PrismaModelDelegate>> implements IBaseService<T> {
    protected config: ServiceConfig<T, R>;

    constructor(config: ServiceConfig<T, R>) {
        this.config = config;
    }

    /**
     * Get the typed repository instance
     */
    protected get repository(): R {
        return this.config.repository;
    }

    async getAll(options?: QueryOptions): Promise<PaginatedResult<T>> {
        try {
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
            this.handleError(error, 'getAll', { options });
            throw error;
        }
    }

    async getById(id: string): Promise<T | null> {
        try {
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
            this.handleError(error, 'getById', { id });
            throw error;
        }
    }

    async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
        try {
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
            this.handleError(error, 'create', { data });
            throw error;
        }
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        try {
            // Validate if validation function is provided
            if (this.config.validateUpdate) {
                await this.config.validateUpdate(id, data);
            }

            // Transform before save if function is provided
            let transformedData = data;
            if (this.config.transformBeforeSave) {
                transformedData = this.config.transformBeforeSave(data);
            }

            let entity = await this.config.repository.update(id, transformedData);

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
            this.handleError(error, 'update', { id, data });
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            return await this.config.repository.delete(id);
        } catch (error: any) {
            this.handleError(error, 'delete', { id });
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

/**
 * Factory function to create service instances
 */
export function createService<T, R extends IBaseRepository<T, any, PrismaModelDelegate> = IBaseRepository<T, any, PrismaModelDelegate>>(config: ServiceConfig<T, R>): BaseService<T, R> {
    return new (class extends BaseService<T, R> { })(config);
}

/**
 * Service factory class for more complex service creation
 */
export class ServiceFactory {
    /**
     * Create a basic service with minimal configuration
     */
    createBasicService<T, R extends IBaseRepository<T, any, PrismaModelDelegate> = IBaseRepository<T, any, PrismaModelDelegate>>(repository: R): BaseService<T, R> {
        return createService<T, R>({
            repository
        });
    }

    /**
     * Create a service with validation
     */
    createValidatedService<T, R extends IBaseRepository<T, any, PrismaModelDelegate> = IBaseRepository<T, any, PrismaModelDelegate>>(
        repository: R,
        validateCreate?: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void> | void,
        validateUpdate?: (id: string, data: Partial<T>) => Promise<void> | void
    ): BaseService<T, R> {
        return createService<T, R>({
            repository,
            validateCreate,
            validateUpdate
        });
    }

    /**
     * Create a service with entity enrichment
     */
    createEnrichedService<T, R extends IBaseRepository<T, any, PrismaModelDelegate> = IBaseRepository<T, any, PrismaModelDelegate>>(
        repository: R,
        enrichEntity: (entity: T) => Promise<T> | T
    ): BaseService<T, R> {
        return createService<T, R>({
            repository,
            enrichEntity
        });
    }

    /**
     * Create a service with authorization
     */
    createAuthorizedService<T, R extends IBaseRepository<T, any, PrismaModelDelegate> = IBaseRepository<T, any, PrismaModelDelegate>>(
        repository: R,
        checkAuthorization: (userId: string, operation: string, entityId?: string) => Promise<boolean> | boolean
    ): BaseService<T, R> {
        return createService<T, R>({
            repository,
            checkAuthorization
        });
    }

    /**
     * Create a fully configured service
     */
    createFullService<T, R extends IBaseRepository<T, any, PrismaModelDelegate> = IBaseRepository<T, any, PrismaModelDelegate>>(config: ServiceConfig<T, R>): BaseService<T, R> {
        return createService<T, R>(config);
    }
}

/**
 * Example usage:
 * 
 * const serviceFactory = new ServiceFactory();
 * 
 * // Basic service
 * const basicUserService = serviceFactory.createBasicService(userRepository);
 * 
 * // Service with validation
 * const validatedPostService = serviceFactory.createValidatedService(
 *   postRepository,
 *   async (data) => {
 *     if (!data.title || data.title.length < 3) {
 *       throw new Error('Title must be at least 3 characters');
 *     }
 *   },
 *   async (id, data) => {
 *     if (data.title && data.title.length < 3) {
 *       throw new Error('Title must be at least 3 characters');
 *     }
 *   }
 * );
 * 
 * // Service with enrichment (for example, adding author info to posts)
 * const enrichedPostService = serviceFactory.createEnrichedService(
 *   postRepository,
 *   async (post) => {
 *     const author = await userRepository.findById(post.authorId);
 *     return {
 *       ...post,
 *       author: {
 *         id: author?.id || post.authorId,
 *         displayName: author?.displayName || 'Unknown Author'
 *       }
 *     };
 *   }
 * );
 */
