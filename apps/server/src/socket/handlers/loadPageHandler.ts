import { Socket } from 'socket.io';
import { LoadPageRequest } from '@blog/shared/src/socket/Request';
import { EntityDataResponse } from '@blog/shared/src/socket/Response';
import { IUserService } from '../../core/interfaces/userService';
import { IPostService } from '../../core/interfaces/postService';
import { QueryOptions } from '@blog/shared/src/types/pagination';

export async function handleLoadPage(
    socket: Socket,
    request: LoadPageRequest,
    callback: (response: EntityDataResponse) => void,
    services: {
        userService: IUserService;
        postService: IPostService;
    }
): Promise<void> {
    const { pageName } = request.requestParams;
    const userId = socket.data.userId;

    // Default pagination settings
    const queryOptions: QueryOptions = {
        pagination: { page: 0, limit: 10 },
        sort: { createdAt: 'desc' }
    };

    switch (pageName) {
        case 'usersList':
            const usersResult = await services.userService.getAll(queryOptions);

            callback({
                responseType: 'setEntityData',
                responseParams: {
                    entities: {
                        data: {
                            users: usersResult.data
                        },
                        total: usersResult.total,
                        page: usersResult.page,
                        limit: usersResult.limit,
                        filteredTotal: usersResult.filteredTotal,
                        totalPages: usersResult.totalPages
                    }
                }
            });
            break;

        case 'userDetails':
            const userIdParam = request.requestParams.userId;
            if (!userIdParam) {
                throw new Error('User ID is required for user details page');
            }

            const [user, userPosts] = await Promise.all([
                services.userService.getUserById(userIdParam),
                services.postService.getPostsByAuthorId(userIdParam)
            ]);

            callback({
                responseType: 'setEntityData',
                responseParams: {
                    entities: {
                        data: {
                            user: user ? [user] : [],
                            posts: userPosts
                        },
                        total: 1,
                        page: 0,
                        limit: 1,
                        filteredTotal: user ? 1 : 0,
                        totalPages: 1
                    }
                }
            });
            break;

        case 'postsList':
            const postsResult = await services.postService.getAllPosts(queryOptions);

            callback({
                responseType: 'setEntityData',
                responseParams: {
                    entities: {
                        data: {
                            posts: postsResult.data
                        },
                        total: postsResult.total,
                        page: postsResult.page,
                        limit: postsResult.limit,
                        filteredTotal: postsResult.filteredTotal,
                        totalPages: postsResult.totalPages
                    }
                }
            });
            break;

        case 'currentUser':
            if (!userId) {
                throw new Error('User must be authenticated to get current user info');
            }

            const currentUser = await services.userService.getById(userId);

            callback({
                responseType: 'setEntityData',
                responseParams: {
                    entities: {
                        data: {
                            user: currentUser ? [currentUser] : []
                        },
                        total: 1,
                        page: 0,
                        limit: 1,
                        filteredTotal: currentUser ? 1 : 0,
                        totalPages: 1
                    }
                }
            });
            break;

        case 'postDetails':
            const postIdParam = request.requestParams.postId;
            if (!postIdParam) {
                throw new Error('Post ID is required for post details page');
            }

            const post = await services.postService.getById(postIdParam);

            // Also fetch the author information
            let author = null;
            if (post) {
                author = await services.userService.getById(post.authorId);
            }

            callback({
                responseType: 'setEntityData',
                responseParams: {
                    entities: {
                        data: {
                            post: post ? [post] : [],
                            author: author ? [author] : []
                        },
                        total: 1,
                        page: 0,
                        limit: 1,
                        filteredTotal: post ? 1 : 0,
                        totalPages: 1
                    }
                }
            });
            break;

        default:
            throw new Error(`Unsupported page: ${pageName}`);
    }
}