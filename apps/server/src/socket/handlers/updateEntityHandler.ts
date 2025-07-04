import { Socket } from 'socket.io';
import { UpdateEntityRequest } from '@blog/shared/src/socket/Request';
import { SuccessResponse, ErrorResponse } from '@blog/shared/src/socket/Response';
import { IUserService } from '../../core/interfaces/userService';
import { IPostService } from '../../core/interfaces/postService';
import { Post } from '@blog/shared/src/models/Post';

export async function handleUpdateEntity(
    socket: Socket,
    request: UpdateEntityRequest,
    callback: (response: SuccessResponse | ErrorResponse) => void,
    services: {
        userService: IUserService;
        postService: IPostService;
    }
): Promise<void> {
    const { entityType, entityId, entityData } = request.requestParams;
    const userId = socket.data.userId;

    try {
        switch (entityType) {
            case 'posts':
                const postData = entityData as Partial<Post>;
                const updatedPost = await services.postService.update(entityId, postData);

                callback({
                    responseType: 'success',
                    responseParams: {
                        message: 'Post updated successfully',
                        data: { post: updatedPost }
                    }
                });
                break;

            default:
                throw new Error(`Updating ${entityType} is not supported`);
        }
    } catch (error: any) {
        callback({
            responseType: 'error',
            responseParams: {
                error: {
                    code: 'UPDATE_FAILED',
                    message: error.message || `Failed to update ${entityType}`
                }
            }
        });
    }
}