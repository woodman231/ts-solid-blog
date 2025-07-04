import { Socket } from 'socket.io';
import { DeleteEntityRequest } from '@blog/shared/src/socket/Request';
import { SuccessResponse, ErrorResponse } from '@blog/shared/src/socket/Response';
import { IUserService } from '../../core/interfaces/userService';
import { IPostService } from '../../core/interfaces/postService';

export async function handleDeleteEntity(
    socket: Socket,
    request: DeleteEntityRequest,
    callback: (response: SuccessResponse | ErrorResponse) => void,
    services: {
        userService: IUserService;
        postService: IPostService;
    }
): Promise<void> {
    const { entityType, entityId } = request.requestParams;
    const userId = socket.data.userId;

    try {
        switch (entityType) {
            case 'posts':
                // Check if user is authorized to delete this post
                const isAuthorized = await services.postService.isAuthorized(entityId, userId);

                if (!isAuthorized) {
                    throw new Error('You are not authorized to delete this post');
                }

                // Delete the post                
                const deleted = await services.postService.delete(entityId);

                if (deleted) {
                    callback({
                        responseType: 'success',
                        responseParams: {
                            message: 'Post deleted successfully',
                            data: { postId: entityId }
                        }
                    });
                } else {
                    throw new Error('Failed to delete post');
                }
                break;

            default:
                throw new Error(`Deleting ${entityType} is not supported`);
        }
    } catch (error: any) {
        callback({
            responseType: 'error',
            responseParams: {
                error: {
                    code: 'DELETE_FAILED',
                    message: error.message || `Failed to delete ${entityType}`
                }
            }
        });
    }
}