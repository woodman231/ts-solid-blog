import { Socket } from 'socket.io';
import { FetchEntitiesRequest } from '@blog/shared/src/socket/Request';
import { EntityDataResponse } from '@blog/shared/src/socket/Response';
import { IUserService } from '../../core/interfaces/userService';
import { IPostService } from '../../core/interfaces/postService';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';

export async function handleFetchEntities(
  socket: Socket,
  request: FetchEntitiesRequest,
  callback: (response: EntityDataResponse) => void,
  services: {
    userService: IUserService;
    postService: IPostService;
  }
): Promise<void> {
  const { entityType, filterOptions, sort, page = 0, limit = 10 } = request.requestParams;
  const userId = socket.data.userId;

  const queryOptions: QueryOptions = {
    pagination: { page, limit },
    sort,
    filter: filterOptions,
  };

  let result: PaginatedResult<any>;

  switch (entityType) {
    case 'users':
      result = await services.userService.getAllUsers(queryOptions);
      break;

    case 'posts':
      result = await services.postService.getAllPosts(queryOptions);
      break;

    default:
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
}