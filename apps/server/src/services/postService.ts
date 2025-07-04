import { IPostService } from '../core/interfaces/postService';
import { IPostRepository } from '../core/interfaces/postRepository';
import { Post, PostWithAuthor } from '@blog/shared/src/models/Post';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { BaseService, ServiceConfig } from '../core/BaseService';

export class PostService extends BaseService<Post> implements IPostService {
  private postRepository: IPostRepository;

  constructor(postRepository: IPostRepository) {
    const config: ServiceConfig<Post> = {
      repository: postRepository,
      checkAuthorization: async (postId: string, userId: string): Promise<boolean> => {
        const post = await postRepository.findById(postId);
        return post !== null && post.authorId === userId;
      },
    };
    super(config);
    this.postRepository = postRepository;
  }

  getAllPosts(options?: QueryOptions): Promise<PaginatedResult<PostWithAuthor>> {
    return this.getAll(options) as Promise<PaginatedResult<PostWithAuthor>>;
  }

  getPostById(id: string): Promise<PostWithAuthor | null> {
    return this.getById(id) as Promise<PostWithAuthor | null>;
  }

  getPostsByAuthorId(authorId: string): Promise<Post[]> {
    return this.postRepository.findByAuthorId(authorId);
  }

  createPost(authorId: string, postData: Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    return this.postRepository.create({
      ...postData,
      authorId
    });
  }

  updatePost(id: string, authorId: string, postData: Partial<Post>): Promise<Post> {
    return this.postRepository.update(id, postData);
  }

  deletePost(id: string, authorId: string): Promise<boolean> {
    return this.postRepository.delete(id);
  }

  isAuthorized(postId: string, userId: string): Promise<boolean> {
    return this.postRepository.findById(postId).then(post => post !== null && post.authorId === userId);
  }
}
