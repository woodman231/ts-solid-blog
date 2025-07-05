import { Post, PostWithAuthor } from '@blog/shared/src/models/Post';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { IBaseService, ServiceContext } from '../BaseService';

export interface IPostService extends IBaseService<Post> {
  getAllPosts(options?: QueryOptions): Promise<PaginatedResult<PostWithAuthor>>;
  getPostById(id: string): Promise<PostWithAuthor | null>;
  getPostsByAuthorId(authorId: string): Promise<Post[]>;
  createPost(authorId: string, postData: Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>): Promise<Post>;
  updatePost(id: string, authorId: string, postData: Partial<Post>): Promise<Post>;
  deletePost(id: string, authorId: string): Promise<boolean>;
  isAuthorized(postId: string, userId: string): Promise<boolean>;

  // Context-aware methods with authorization
  getAllPostsWithContext(context: ServiceContext, options?: QueryOptions): Promise<PaginatedResult<PostWithAuthor>>;
  getPostByIdWithContext(context: ServiceContext, id: string): Promise<PostWithAuthor | null>;
  createPostWithContext(context: ServiceContext, postData: Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>): Promise<Post>;
  updatePostWithContext(context: ServiceContext, id: string, postData: Partial<Post>): Promise<Post>;
  deletePostWithContext(context: ServiceContext, id: string): Promise<boolean>;
}