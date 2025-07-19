import { IUserService } from '../../core/interfaces/userService';
import { IPostService } from '../../core/interfaces/postService';
import { ICategoryService } from '../../core/interfaces/categoryService';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { ENTITY_TYPES, EntityType } from '@blog/shared/src/constants/entityTypes';
import { ServiceContext } from '../../core/BaseService';

/**
 * Service registry interface for entity operations
 */
export interface EntityServiceRegistry {
    userService: IUserService;
    postService: IPostService;
    categoryService: ICategoryService;
}

/**
 * Entity fetcher function type
 */
export type EntityFetcher<T = any> = (
    services: EntityServiceRegistry,
    context: ServiceContext,
    options?: QueryOptions
) => Promise<PaginatedResult<T>>;

/**
 * Registry of entity fetchers mapped by entity type
 */
export const ENTITY_FETCHERS: Record<EntityType, EntityFetcher> = {
    [ENTITY_TYPES.USERS]: async (services, context, options) => {
        return await services.userService.getAll(options);
    },

    [ENTITY_TYPES.POSTS]: async (services, context, options) => {
        return await services.postService.getAllPostsWithContext(context, options);
    },

    [ENTITY_TYPES.CATEGORIES]: async (services, context, options) => {
        return await services.categoryService.getAll(options);
    }
};

/**
 * Get entity fetcher for a specific entity type
 */
export function getEntityFetcher(entityType: EntityType): EntityFetcher {
    return ENTITY_FETCHERS[entityType];
}

/**
 * Check if an entity fetcher exists for the given entity type
 */
export function hasEntityFetcher(entityType: string): entityType is EntityType {
    return entityType in ENTITY_FETCHERS;
}
