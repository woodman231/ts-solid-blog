import { IPostService } from '../core/interfaces/postService';
import { IPostRepository } from '../core/interfaces/postRepository';
import { IUserRepository } from '../core/interfaces/userRepository';
import { Post, PostWithAuthor } from '@blog/shared/src/models/Post';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';

export class PostService implements IPostService {
  constructor(
    private postRepository: IPostRepository,
    private userRepository: IUserRepository
  ) { }

  async getAllPosts(options?: QueryOptions): Promise<PaginatedResult<PostWithAuthor>> {
    const result = await this.postRepository.findAll(options);
    const enrichedPosts = await this.enrichPostsWithAuthor(result.data);

    return {
      ...result,
      data: enrichedPosts
    };
  }

  async getPostById(id: string): Promise<PostWithAuthor | null> {
    const post = await this.postRepository.findById(id);
    if (!post) return null;

    return await this.enrichPostWithAuthor(post);
  }

  async getPostsByAuthorId(authorId: string): Promise<Post[]> {
    return this.postRepository.findByAuthorId(authorId);
  }

  async createPost(
    authorId: string,
    postData: Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>
  ): Promise<Post> {
    return this.postRepository.create({
      ...postData,
      authorId
    });
  }

  async updatePost(id: string, authorId: string, postData: Partial<Post>): Promise<Post> {
    // Check if the user is the author
    if (!(await this.isAuthorized(id, authorId))) {
      throw new Error('Unauthorized: User is not the author of this post');
    }

    return this.postRepository.update(id, postData);
  }

  async deletePost(id: string, authorId: string): Promise<boolean> {
    // Check if the user is the author
    if (!(await this.isAuthorized(id, authorId))) {
      throw new Error('Unauthorized: User is not the author of this post');
    }

    return this.postRepository.delete(id);
  }

  async isAuthorized(postId: string, userId: string): Promise<boolean> {
    const post = await this.postRepository.findById(postId);
    return post !== null && post.authorId === userId;
  }

  private async enrichPostWithAuthor(post: Post): Promise<PostWithAuthor> {
    const author = await this.userRepository.findById(post.authorId);

    return {
      ...post,
      author: {
        id: author?.id || post.authorId,
        displayName: author?.displayName || 'Unknown Author'
      }
    };
  }

  private async enrichPostsWithAuthor(posts: Post[]): Promise<PostWithAuthor[]> {
    // Get unique author IDs
    const authorIds = [...new Set(posts.map(post => post.authorId))];

    // Fetch all authors at once
    const authorsPromises = authorIds.map(id => this.userRepository.findById(id));
    const authors = await Promise.all(authorsPromises);

    // Create a map of author ID to author data for quick lookups
    const authorMap = new Map();
    authors.forEach(author => {
      if (author) {
        authorMap.set(author.id, author);
      }
    });

    // Add author data to each post
    return posts.map(post => ({
      ...post,
      author: {
        id: post.authorId,
        displayName: authorMap.get(post.authorId)?.displayName || 'Unknown Author'
      }
    }));
  }
}