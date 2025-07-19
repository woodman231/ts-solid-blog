import { Socket } from 'socket.io';
import { CreateEntityRequest } from '@blog/shared/src/socket/Request';
import { SuccessResponse, ErrorResponse } from '@blog/shared/src/socket/Response';
import { IUserService } from '../../core/interfaces/userService';
import { IPostService } from '../../core/interfaces/postService';
import { ICategoryService } from '../../core/interfaces/categoryService';
import { CreatePost } from '@blog/shared/src/models/Post';
import { CreateCategory } from '@blog/shared/models/Category';
import { createServiceContext } from '../../core/BaseService';
import { slugify } from '../../utils/slugify';

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
                const postData = entityData as CreatePost;

                if (!postData.title || !postData.title.trim()) {
                    throw new Error('Post title is required');
                }

                services.postService.setContext(context);
                const newPost = await services.postService.create(postData);

                callback({
                    responseType: 'success',
                    responseParams: {
                        message: 'Post created successfully',
                        data: { post: newPost }
                    }
                });
                break;

            case 'category':
                const categoryData = entityData as CreateCategory;

                if (!categoryData.name || !categoryData.name.trim()) {
                    throw new Error('Category Name is required');
                }

                const categoryDataWithSlug: CreateCategory & { slug: string } = {
                    ...categoryData,
                    slug: slugify(categoryData.name),
                    parentId: !!categoryData.parentId ? categoryData.parentId : undefined // empty string = undefined
                };

                services.categoryService.setContext(context);
                const newCategory = await services.categoryService.create(categoryDataWithSlug);

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