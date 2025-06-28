import { Post, PostWithAuthor } from '@blog/shared/src/models/Post';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';

export interface IPostService {
  getAllPosts(options?: QueryOptions): Promise<PaginatedResult<PostWithAuthor>>;
  getPostById(id: string): Promise<PostWithAuthor | null>;
  getPostsByAuthorId(authorId: string): Promise<Post[]>;
  createPost(authorId: string, postData: Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>): Promise<Post>;
  updatePost(id: string, authorId: string, postData: Partial<Post>): Promise<Post>;
  deletePost(id: string, authorId: string): Promise<boolean>;
  isAuthorized(postId: string, userId: string): Promise<boolean>;
}