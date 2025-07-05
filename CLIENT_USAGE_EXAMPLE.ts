// Example: Using the new constants in client-side code
import {
    ENTITY_TYPES,
    RESPONSE_TYPES,
    ERROR_CODES,
    EntityType
} from '@blog/shared';

// Example 1: Type-safe entity fetching
function fetchUsers() {
    const request = {
        requestType: 'fetchEntities',
        requestParams: {
            entityType: ENTITY_TYPES.USERS, // Type-safe, no magic strings
            page: 0,
            limit: 10
        }
    };

    socket.emit('request', request, (response) => {
        if (response.responseType === RESPONSE_TYPES.SET_ENTITY_DATA) {
            console.log('Users loaded:', response.responseParams.entities);
        } else if (response.responseType === RESPONSE_TYPES.ERROR) {
            handleError(response.responseParams.error);
        }
    });
}

// Example 2: Type-safe entity type validation
function isValidEntity(entityType: string): entityType is EntityType {
    return Object.values(ENTITY_TYPES).includes(entityType as EntityType);
}

// Example 3: Error handling with constants
function handleError(error: { code: string, message: string }) {
    switch (error.code) {
        case ERROR_CODES.INVALID_ENTITY_TYPE:
            console.error('Invalid entity type requested');
            break;
        case ERROR_CODES.UNAUTHORIZED:
            console.error('User not authorized');
            break;
        case ERROR_CODES.NOT_FOUND:
            console.error('Resource not found');
            break;
        default:
            console.error('Unknown error:', error.message);
    }
}

// Example 4: Generic fetch function with type safety
function fetchEntities<T>(entityType: EntityType, options?: {
    page?: number;
    limit?: number;
    sort?: Record<string, 'asc' | 'desc'>;
    filter?: Record<string, any>;
}): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const request = {
            requestType: 'fetchEntities',
            requestParams: {
                entityType,
                page: options?.page || 0,
                limit: options?.limit || 10,
                sort: options?.sort,
                filterOptions: options?.filter
            }
        };

        socket.emit('request', request, (response) => {
            if (response.responseType === RESPONSE_TYPES.SET_ENTITY_DATA) {
                resolve(response.responseParams.entities.data[entityType]);
            } else if (response.responseType === RESPONSE_TYPES.ERROR) {
                reject(new Error(response.responseParams.error.message));
            }
        });
    });
}

// Usage examples:
// const users = await fetchEntities(ENTITY_TYPES.USERS);
// const posts = await fetchEntities(ENTITY_TYPES.POSTS, { page: 1, limit: 20 });
