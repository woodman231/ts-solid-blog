import { Socket } from 'socket.io';
import { CreateEntityRequest } from '@blog/shared/src/socket/Request';
import { SuccessResponse, ErrorResponse } from '@blog/shared/src/socket/Response';
import { IUserService } from '../../core/interfaces/userService';
import { IPostService } from '../../core/interfaces/postService';
import { ICategoryService } from '../../core/interfaces/categoryService';
import { Post } from '@blog/shared/src/models/Post';
import { Category } from '@blog/shared/models/Category';
import { createServiceContext } from '../../core/BaseService';

export async function handleCreateEntity(
    socket: Socket,
    request: CreateEntityRequest,
    callback: (response: SuccessResponse | ErrorResponse) => void,
    services: {
        userService: IUserService;
        postService: IPostService;
        categoryService: ICategoryService;
    }
): Promise<void> {
    const { entityType, entityData } = request.requestParams;
    const userId = socket.data.userId;

    // Create service context
    const context = createServiceContext(userId);

    try {
        switch (entityType) {
            case 'posts':
                // Validate required fields
                const postData = entityData as Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>;

                if (!postData.title || !postData.title.trim()) {
                    throw new Error('Post title is required');
                }

                const newPost = await services.postService.createPostWithContext(context, postData);

                callback({
                    responseType: 'success',
                    responseParams: {
                        message: 'Post created successfully',
                        data: { post: newPost }
                    }
                });
                break;

            case 'category':
                const categoryData = entityData as Omit<Category, "id" | "createdAt" | "updatedAt">

                if (!categoryData.name || !categoryData.name.trim()) {
                    throw new Error('Category Name is required');
                }

                const newCategory = await services.categoryService.createWithContext(context, categoryData);

                callback({
                    responseType: 'success',
                    responseParams: {
                        message: 'Category created successfully',
                        data: { category: newCategory }
                    }
                });

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