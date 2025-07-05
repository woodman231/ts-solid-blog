import { Socket } from 'socket.io';
import { FetchEntitiesRequest } from '@blog/shared/src/socket/Request';
import { EntityDataResponse, ErrorResponse } from '@blog/shared/src/socket/Response';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { logger } from '../../utils/logger';
import { createServiceContext } from '../../core/BaseService';
import {
  isValidEntityType,
  getSupportedEntityTypes
} from '@blog/shared/src/constants/entityTypes';
import {
  RESPONSE_TYPES,
  ERROR_CODES,
  ErrorCode
} from '@blog/shared/src/constants/responseTypes';
import {
  EntityServiceRegistry,
  getEntityFetcher,
  hasEntityFetcher
} from '../registry/entityRegistry';

export async function handleFetchEntities(
  socket: Socket,
  request: FetchEntitiesRequest,
  callback: (response: EntityDataResponse | ErrorResponse) => void,
  services: EntityServiceRegistry
): Promise<void> {
  try {
    const { entityType, filterOptions, sort, page = 0, limit = 10 } = request.requestParams;
    const userId = socket.data.userId;

    // Create service context
    const context = createServiceContext(userId);

    // Validate entity type
    if (!isValidEntityType(entityType)) {
      logger.warn(`Invalid entity type requested: ${entityType}`, {
        userId,
        requestParams: request.requestParams,
        supportedTypes: getSupportedEntityTypes()
      });
      callback({
        responseType: RESPONSE_TYPES.ERROR,
        responseParams: {
          error: {
            code: ERROR_CODES.INVALID_ENTITY_TYPE,
            message: `The requested resource type '${entityType}' is not supported. Supported types: ${getSupportedEntityTypes().join(', ')}`
          }
        }
      });
      return;
    }

    // Validate pagination parameters
    if (page < 0 || limit < 1 || limit > 100) {
      logger.warn(`Invalid pagination parameters`, { userId, page, limit });
      callback({
        responseType: RESPONSE_TYPES.ERROR,
        responseParams: {
          error: {
            code: ERROR_CODES.INVALID_PAGINATION,
            message: 'Invalid pagination parameters provided.'
          }
        }
      });
      return;
    }

    const queryOptions: QueryOptions = {
      pagination: { page, limit },
      sort,
      filter: filterOptions,
    };

    let result: PaginatedResult<any>;

    // Use key-based approach with entity fetcher registry
    if (hasEntityFetcher(entityType)) {
      const entityFetcher = getEntityFetcher(entityType);
      result = await entityFetcher(services, context, queryOptions);
    } else {
      // This should never happen due to validation above, but just in case
      throw new Error(`No fetcher found for entity type: ${entityType}`);
    }

    callback({
      responseType: RESPONSE_TYPES.SET_ENTITY_DATA,
      responseParams: {
        entities: {
          data: {
            [entityType]: result.data
          },
          total: result.total,
          filteredTotal: result.filteredTotal,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          // Include current user ID in all responses
          currentUserId: userId,
        }
      }
    });

  } catch (error: any) {
    // Log the full error for debugging
    logger.error(`Error fetching entities`, {
      error: error.message,
      stack: error.stack,
      requestParams: request.requestParams,
      userId: socket.data.userId
    });

    // Determine user-friendly error message based on error type
    let userMessage = 'Unable to load data. Please try again.';
    let errorCode: ErrorCode = ERROR_CODES.FETCH_ERROR;

    if (error.message?.includes('Invalid date format')) {
      userMessage = 'Invalid date filter provided. Please check your date format.';
      errorCode = ERROR_CODES.INVALID_FILTER_VALUE;
    } else if (error.message?.includes('Invalid filter')) {
      userMessage = 'Invalid filter criteria provided. Please adjust your filters.';
      errorCode = ERROR_CODES.INVALID_FILTER;
    } else if (error.message?.includes('Database')) {
      userMessage = 'Database is temporarily unavailable. Please try again later.';
      errorCode = ERROR_CODES.DATABASE_ERROR;
    } else if (error.code === 'P2025') {
      // Prisma record not found
      userMessage = 'The requested data could not be found.';
      errorCode = ERROR_CODES.NOT_FOUND;
    }

    callback({
      responseType: RESPONSE_TYPES.ERROR,
      responseParams: {
        error: {
          code: errorCode,
          message: userMessage
        }
      }
    });
  }
}