import { IPostService } from '../core/interfaces/postService';
import { IPostRepository } from '../core/interfaces/postRepository';
import { PostWithAuthor, CreatePost } from '@blog/shared/src/models/Post';
import { BaseService, ServiceConfig } from '../core/BaseService';

export class PostService extends BaseService<PostWithAuthor, IPostRepository> implements IPostService {
  constructor(postRepository: IPostRepository) {
    const config: ServiceConfig<PostWithAuthor, IPostRepository> = {
      repository: postRepository,
      checkAuthorization: async (userId: string, operation: string, entityId?: string): Promise<boolean> => {
        // For posts, we need to check if the user is the author
        if (operation === 'read') {
          // Anyone can read posts
          return true;
        }

        if (operation === 'create') {
          // Any authenticated user can create posts
          return true;
        }

        if ((operation === 'update' || operation === 'delete') && entityId) {
          // Only the author can update or delete their posts
          const post = await postRepository.findById(entityId);
          return post !== null && post.authorId === userId;
        }

        return false;
      },
      transformBeforeSave: (data: CreatePost) => {
        const context = this.getContext();

        if (!context || !context.userId) {
          throw new Error('User context is required for creating posts');
        }

        return {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: context.userId
        }
      }
    };
    super(config);
  }
}
