import { Socket } from 'socket.io';
import { CreateEntityRequest } from '@blog/shared/src/socket/Request';
import { SuccessResponse, ErrorResponse } from '@blog/shared/src/socket/Response';
import { IUserService } from '../../core/interfaces/userService';
import { IPostService } from '../../core/interfaces/postService';
import { Post } from '@blog/shared/src/models/Post';

export async function handleCreateEntity(
    socket: Socket,
    request: CreateEntityRequest,
    callback: (response: SuccessResponse | ErrorResponse) => void,
    services: {
        userService: IUserService;
        postService: IPostService;
    }
): Promise<void> {
    const { entityType, entityData } = request.requestParams;
    const userId = socket.data.userId;

    try {
        switch (entityType) {
            case 'posts':
                // Validate required fields
                const postData = entityData as Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>;

                if (!postData.title || !postData.title.trim()) {
                    throw new Error('Post title is required');
                }

                // Create the post using the current user as author
                const newPost = await services.postService.createPost(
                    userId,
                    postData
                );

                callback({
                    responseType: 'success',
                    responseParams: {
                        message: 'Post created successfully',
                        data: { post: newPost }
                    }
                });
                break;

            default:
                throw new Error(`Creating ${entityType} is not supported`);
        }
    } catch (error: any) {
        callback({
            responseType: 'error',
            responseParams: {
                error: {
                    code: 'CREATION_FAILED',
                    message: error.message || `Failed to create ${entityType}`
                }
            }
        });
    }
}