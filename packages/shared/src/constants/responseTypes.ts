/**
 * Response type constants to eliminate magic strings
 */
export const RESPONSE_TYPES = {
    SET_ENTITY_DATA: 'setEntityData',
    ERROR: 'error',
    SUCCESS: 'success',
    SEARCH_AUTHORS: 'searchAuthors'
} as const;

export type ResponseType = typeof RESPONSE_TYPES[keyof typeof RESPONSE_TYPES];

/**
 * Error code constants
 */
export const ERROR_CODES = {
    INVALID_ENTITY_TYPE: 'INVALID_ENTITY_TYPE',
    INVALID_PAGINATION: 'INVALID_PAGINATION',
    INVALID_REQUEST: 'INVALID_REQUEST',
    INVALID_REQUEST_TYPE: 'INVALID_REQUEST_TYPE',
    SERVER_ERROR: 'SERVER_ERROR',
    FETCH_ERROR: 'FETCH_ERROR',
    INVALID_FILTER_VALUE: 'INVALID_FILTER_VALUE',
    INVALID_FILTER: 'INVALID_FILTER',
    DATABASE_ERROR: 'DATABASE_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
