/**
 * Entity type constants to eliminate magic strings
 */
export const ENTITY_TYPES = {
    USERS: 'users',
    POSTS: 'posts'
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

/**
 * Type guard to check if a string is a valid entity type
 */
export function isValidEntityType(entityType: string): entityType is EntityType {
    return Object.values(ENTITY_TYPES).includes(entityType as EntityType);
}

/**
 * Get all supported entity types
 */
export function getSupportedEntityTypes(): EntityType[] {
    return Object.values(ENTITY_TYPES);
}
