import { Socket } from 'socket.io';
import { SearchAuthorsRequest } from '@blog/shared/src/socket/Request';
import { SearchAuthorsResponse, ErrorResponse } from '@blog/shared/src/socket/Response';
import { IUserService } from '../../core/interfaces/userService';
import { QueryOptions } from '@blog/shared/src/types/pagination';
import { logger } from '../../utils/logger';

export async function handleSearchAuthors(
    socket: Socket,
    request: SearchAuthorsRequest,
    callback: (response: SearchAuthorsResponse | ErrorResponse) => void,
    services: {
        userService: IUserService;
    }
): Promise<void> {
    try {
        const { query = '', limit = 20 } = request.requestParams;
        const userId = socket.data.userId;

        // Validate limit parameter
        if (limit < 1 || limit > 100) {
            logger.warn(`Invalid limit parameter for author search`, { userId, limit });
            callback({
                responseType: 'error',
                responseParams: {
                    error: {
                        code: 'INVALID_LIMIT',
                        message: 'Limit must be between 1 and 100.'
                    }
                }
            });
            return;
        }

        // Build query options for searching users
        const queryOptions: QueryOptions = {
            pagination: { page: 0, limit },
            sort: { displayName: 'asc' },
        };

        // Add search filter if query is provided
        if (query.trim()) {
            queryOptions.filter = {
                globalSearch: query.trim()
            };
        }

        const result = await services.userService.getAllUsers(queryOptions);

        // Map to the expected response format
        const authors = result.data.map(user => ({
            id: user.id,
            displayName: user.displayName
        }));

        callback({
            responseType: 'searchAuthors',
            responseParams: {
                authors
            }
        });

    } catch (error: any) {
        // Log the full error for debugging
        logger.error(`Error searching authors`, {
            error: error.message,
            stack: error.stack,
            requestParams: request.requestParams,
            userId: socket.data.userId
        });

        // Determine user-friendly error message
        let userMessage = 'Unable to search authors. Please try again.';
        let errorCode = 'SEARCH_ERROR';

        if (error.message?.includes('Database')) {
            userMessage = 'Database is temporarily unavailable. Please try again later.';
            errorCode = 'DATABASE_ERROR';
        }

        callback({
            responseType: 'error',
            responseParams: {
                error: {
                    code: errorCode,
                    message: userMessage
                }
            }
        });
    }
}
