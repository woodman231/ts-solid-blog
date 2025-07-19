import { IPostService } from '../core/interfaces/postService';
import { IPostRepository } from '../core/interfaces/postRepository';
import { Post, PostWithAuthor, CreatePost } from '@blog/shared/src/models/Post';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { BaseService, ServiceConfig, ServiceContext } from '../core/BaseService';

export class PostService extends BaseService<Post, IPostRepository> implements IPostService {
  constructor(postRepository: IPostRepository) {
    const config: ServiceConfig<Post, IPostRepository> = {
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
    };
    super(config);
  }

  // Context-aware methods with authorization
  getAllPostsWithContext(context: ServiceContext, options?: QueryOptions): Promise<PaginatedResult<PostWithAuthor>> {
    return this.getAllWithContext(context, options) as Promise<PaginatedResult<PostWithAuthor>>;
  }

  getPostByIdWithContext(context: ServiceContext, id: string): Promise<PostWithAuthor | null> {
    return this.getByIdWithContext(context, id) as Promise<PostWithAuthor | null>;
  }

  createPostWithContext(context: ServiceContext, postData: Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    return this.createWithContext(context, {
      ...postData,
      authorId: context.userId
    });
  }

  updatePostWithContext(context: ServiceContext, id: string, postData: Partial<Post>): Promise<Post> {
    return this.updateWithContext(context, id, postData);
  }

  deletePostWithContext(context: ServiceContext, id: string): Promise<boolean> {
    return this.deleteWithContext(context, id);
  }

  // Legacy methods (keeping for backward compatibility)
  getAllPosts(options?: QueryOptions): Promise<PaginatedResult<PostWithAuthor>> {
    return this.getAll(options) as Promise<PaginatedResult<PostWithAuthor>>;
  }

  getPostById(id: string): Promise<PostWithAuthor | null> {
    return this.getById(id) as Promise<PostWithAuthor | null>;
  }

  getPostsByAuthorId(authorId: string): Promise<Post[]> {
    return this.repository.findByAuthorId(authorId);
  }

  createPost(authorId: string, postData: Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    return this.repository.create({
      ...postData,
      authorId
    });
  }

  updatePost(id: string, authorId: string, postData: Partial<Post>): Promise<Post> {
    return this.update(id, postData);
  }

  deletePost(id: string, authorId: string): Promise<boolean> {
    return this.delete(id);
  }

  isAuthorized(postId: string, userId: string): Promise<boolean> {
    return this.repository.findById(postId).then(post => post !== null && post.authorId === userId);
  }
}
