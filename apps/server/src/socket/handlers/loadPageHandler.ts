import { Socket } from 'socket.io';
import { LoadPageRequest } from '@blog/shared/src/socket/Request';
import { EntityDataResponse } from '@blog/shared/src/socket/Response';
import { IUserService } from '../../core/interfaces/userService';
import { IPostService } from '../../core/interfaces/postService';

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
    const page = 0;
    const limit = 10;

    switch (pageName) {
        case 'usersList':
            const users = await services.userService.getAllUsers({
                page,
                limit,
                sort: { createdAt: 'desc' }
            });

            callback({
                responseType: 'setEntityData',
                responseParams: {
                    entities: {
                        data: {
                            users
                        },
                        total: users.length, // In real app, would be actual total count
                        page,
                        limit,
                        filteredTotal: users.length
                    }
                }
            });
            break;

        case 'userDetails':
            const userIdParam = request.requestParams.userId;
            if (!userIdParam) {
                throw new Error('User ID is required for user details page');
            }

            const user = await services.userService.getUserById(userIdParam);
            const userPosts = await services.postService.getPostsByAuthorId(userIdParam);

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
                        filteredTotal: user ? 1 : 0
                    }
                }
            });
            break;

        case 'postsList':
            const posts = await services.postService.getAllPosts({
                page,
                limit,
                sort: { createdAt: 'desc' }
            });

            callback({
                responseType: 'setEntityData',
                responseParams: {
                    entities: {
                        data: {
                            posts
                        },
                        total: posts.length, // In real app, would be actual total count
                        page,
                        limit,
                        filteredTotal: posts.length
                    }
                }
            });
            break;

        case 'postDetails':
            const postIdParam = request.requestParams.postId;
            if (!postIdParam) {
                throw new Error('Post ID is required for post details page');
            }

            const post = await services.postService.getPostById(postIdParam);

            // Also fetch the author information
            let author = null;
            if (post) {
                author = await services.userService.getUserById(post.authorId);
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
                        filteredTotal: post ? 1 : 0
                    }
                }
            });
            break;

        default:
            throw new Error(`Unsupported page: ${pageName}`);
    }
}