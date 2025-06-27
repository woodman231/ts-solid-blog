import { Socket } from 'socket.io';
import { FetchEntitiesRequest } from '@blog/shared/src/socket/Request';
import { EntityDataResponse } from '@blog/shared/src/socket/Response';
import { IUserService } from '../../core/interfaces/userService';
import { IPostService } from '../../core/interfaces/postService';

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

  let entities: any[] = [];
  let total = 0;

  switch (entityType) {
    case 'users':
      entities = await services.userService.getAllUsers({
        sort,
        page,
        limit,
        filter: filterOptions
      });
      total = entities.length; // In a real app, you'd get the total count from the database
      break;

    case 'posts':
      entities = await services.postService.getAllPosts({
        sort,
        page,
        limit,
        filter: filterOptions
      });
      total = entities.length; // In a real app, you'd get the total count from the database
      break;

    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }

  callback({
    responseType: 'setEntityData',
    responseParams: {
      entities: {
        data: {
          [entityType]: entities
        },
        total,
        page,
        limit,
        filteredTotal: entities.length
      }
    }
  });
}