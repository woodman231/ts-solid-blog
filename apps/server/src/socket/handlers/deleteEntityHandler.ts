import { Socket } from 'socket.io';
import { DeleteEntityRequest } from '@blog/shared/src/socket/Request';
import { SuccessResponse, ErrorResponse } from '@blog/shared/src/socket/Response';
import { IUserService } from '../../core/interfaces/userService';
import { IPostService } from '../../core/interfaces/postService';
import { createServiceContext } from '../../core/BaseService';

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

    // Create service context
    const context = createServiceContext(userId);

    try {
        switch (entityType) {
            case 'posts':
                // Use context-aware method that includes authorization
                services.postService.setContext(context);
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