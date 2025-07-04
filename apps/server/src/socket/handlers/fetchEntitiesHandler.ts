import { Socket } from 'socket.io';
import { FetchEntitiesRequest } from '@blog/shared/src/socket/Request';
import { EntityDataResponse, ErrorResponse } from '@blog/shared/src/socket/Response';
import { IUserService } from '../../core/interfaces/userService';
import { IPostService } from '../../core/interfaces/postService';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { logger } from '../../utils/logger';

export async function handleFetchEntities(
  socket: Socket,
  request: FetchEntitiesRequest,
  callback: (response: EntityDataResponse | ErrorResponse) => void,
  services: {
    userService: IUserService;
    postService: IPostService;
  }
): Promise<void> {
  try {
    const { entityType, filterOptions, sort, page = 0, limit = 10 } = request.requestParams;
    const userId = socket.data.userId;

    // Validate entity type
    if (!['users', 'posts'].includes(entityType)) {
      logger.warn(`Invalid entity type requested: ${entityType}`, { userId, requestParams: request.requestParams });
      callback({
        responseType: 'error',
        responseParams: {
          error: {
            code: 'INVALID_ENTITY_TYPE',
            message: 'The requested resource type is not supported.'
          }
        }
      });
      return;
    }

    // Validate pagination parameters
    if (page < 0 || limit < 1 || limit > 100) {
      logger.warn(`Invalid pagination parameters`, { userId, page, limit });
      callback({
        responseType: 'error',
        responseParams: {
          error: {
            code: 'INVALID_PAGINATION',
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

    switch (entityType) {
      case 'users':
        result = await services.userService.getAll(queryOptions);
        break;

      case 'posts':
        result = await services.postService.getAll(queryOptions);
        break;

      default:
        // This should never happen due to validation above, but just in case
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    callback({
      responseType: 'setEntityData',
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
    let errorCode = 'FETCH_ERROR';

    if (error.message?.includes('Invalid date format')) {
      userMessage = 'Invalid date filter provided. Please check your date format.';
      errorCode = 'INVALID_FILTER_VALUE';
    } else if (error.message?.includes('Invalid filter')) {
      userMessage = 'Invalid filter criteria provided. Please adjust your filters.';
      errorCode = 'INVALID_FILTER';
    } else if (error.message?.includes('Database')) {
      userMessage = 'Database is temporarily unavailable. Please try again later.';
      errorCode = 'DATABASE_ERROR';
    } else if (error.code === 'P2025') {
      // Prisma record not found
      userMessage = 'The requested data could not be found.';
      errorCode = 'NOT_FOUND';
    }

    callback({
      responseType: 'error',
      responseParams: {
        error: {
          code: errorCode,
          message: userMessage
        }
      }
    });
  }
}