import { Socket } from 'socket.io';
import { IUserService } from '../../core/interfaces/userService';
import { IPostService } from '../../core/interfaces/postService';
import { ICategoryService } from '../../core/interfaces/categoryService';
import {
  BaseRequest,
  isLoadPageRequest,
  isFetchEntitiesRequest,
  isCreateEntityRequest,
  isUpdateEntityRequest,
  isDeleteEntityRequest,
  isSearchAuthorsRequest
} from '@blog/shared';
import { RESPONSE_TYPES, ERROR_CODES } from '@blog/shared/src/constants/responseTypes';
import { EntityServiceRegistry } from '../registry/entityRegistry';
import { handleLoadPage } from './loadPageHandler';
import { handleFetchEntities } from './fetchEntitiesHandler';
import { handleCreateEntity } from './createEntityHandler';
import { handleUpdateEntity } from './updateEntityHandler';
import { handleDeleteEntity } from './deleteEntityHandler';
import { handleSearchAuthors } from './searchAuthorsHandler';
import { logger } from '../../utils/logger';

interface Services {
  userService: IUserService;
  postService: IPostService;
  categoryService: ICategoryService;
}

export function setupEventHandlers(socket: Socket, services: Services): void {
  // Create entity service registry
  const entityServices: EntityServiceRegistry = {
    userService: services.userService,
    postService: services.postService,
    categoryService: services.categoryService
  };
  // Main request handler
  socket.on('request', async (request: BaseRequest, callback) => {
    try {
      logger.info(`Received request: ${request.requestType}`, {
        requestParams: request.requestParams,
        userId: socket.data.userId
      });

      // Validate request structure
      if (!request || !request.requestType || !request.requestParams) {
        logger.warn('Invalid request structure received', { request });
        callback({
          responseType: RESPONSE_TYPES.ERROR,
          responseParams: {
            error: {
              code: ERROR_CODES.INVALID_REQUEST,
              message: 'Invalid request format'
            }
          }
        });
        return;
      }

      // Route request to appropriate handler based on request type
      if (isLoadPageRequest(request)) {
        await handleLoadPage(socket, request, callback, services);
      }
      else if (isFetchEntitiesRequest(request)) {
        await handleFetchEntities(socket, request, callback, entityServices);
      }
      else if (isCreateEntityRequest(request)) {
        await handleCreateEntity(socket, request, callback, services);
      }
      else if (isUpdateEntityRequest(request)) {
        await handleUpdateEntity(socket, request, callback, services);
      }
      else if (isDeleteEntityRequest(request)) {
        await handleDeleteEntity(socket, request, callback, services);
      }
      else if (isSearchAuthorsRequest(request)) {
        await handleSearchAuthors(socket, request, callback, { userService: services.userService });
      }
      else {
        logger.warn(`Unsupported request type: ${request.requestType}`, {
          requestParams: request.requestParams,
          userId: socket.data.userId
        });
        callback({
          responseType: RESPONSE_TYPES.ERROR,
          responseParams: {
            error: {
              code: ERROR_CODES.INVALID_REQUEST_TYPE,
              message: `The requested operation is not supported.`
            }
          }
        });
      }
    } catch (error: any) {
      logger.error(`Error handling request: ${request?.requestType || 'unknown'}`, {
        error: error.message,
        stack: error.stack,
        requestParams: request?.requestParams,
        userId: socket.data.userId
      });

      callback({
        responseType: RESPONSE_TYPES.ERROR,
        responseParams: {
          error: {
            code: ERROR_CODES.SERVER_ERROR,
            message: 'An unexpected error occurred. Please try again.'
          }
        }
      });
    }
  });
}