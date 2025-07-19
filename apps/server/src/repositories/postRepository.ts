import { PrismaClient, Prisma } from '@prisma/client';
import { Post, PostWithAuthor } from '@blog/shared/src/models/Post';
import { IPostRepository } from '../core/interfaces/postRepository';
import { BaseRepository, RepositoryConfig } from '../core/BaseRepository';

// Define the selector for type-safe queries with author relation
export const postWithAuthorSelector = {
  id: true,
  title: true,
  description: true,
  body: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      displayName: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    }
  }
} satisfies Prisma.PostSelect;

// Define the payload type based on the selector
export type PostWithAuthorPayload = Prisma.PostGetPayload<{ select: typeof postWithAuthorSelector }>;

export class PostRepository extends BaseRepository<PostWithAuthor, PostWithAuthorPayload, PrismaClient['post']> implements IPostRepository {
  constructor(prisma: PrismaClient) {
    const config: RepositoryConfig<PostWithAuthor, PostWithAuthorPayload, PrismaClient['post']> = {
      delegate: prisma.post,
      selector: postWithAuthorSelector,
      mapToShared: (post: PostWithAuthorPayload): PostWithAuthor => ({
        id: post.id,
        title: post.title,
        description: post.description,
        body: post.body,
        authorId: post.authorId,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        author: {
          id: post.author.id,
          displayName: post.author.displayName,
        }
      }),
      mapToCreateInput: (data: Partial<PostWithAuthor>) => ({
        title: data.title,
        description: data.description,
        body: data.body,
        authorId: data.authorId,
      }),
      mapToUpdateInput: (data: Partial<PostWithAuthor>) => {
        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.body !== undefined) updateData.body = data.body;

        return updateData;
      },
      globalSearchConfig: {
        searchFields: [
          { field: 'title' },
          { field: 'description' },
          { field: 'body' },
          { field: 'author.displayName', isNested: true }
        ]
      },
      defaultSort: { createdAt: 'desc' },
      columnFieldMapping: {
        'title': 'title',
        'description': 'description',
        'body': 'body',
        'createdAt': 'createdAt',
        'updatedAt': 'updatedAt',
        'author.displayName': 'author.displayName',
        'author.email': 'author.email',
        'authorId': 'authorId',
      },
    };

    super(prisma, config);
  }

  // Additional methods specific to Post
  async findByAuthorId(authorId: string): Promise<PostWithAuthor[]> {
    try {
      const posts = await this.config.delegate.findMany({
        select: this.config.selector,
        where: { authorId },
      });
      return posts.map((post: any) => this.config.mapToShared(post));
    } catch (error: any) {
      this.handleError(error, 'findByAuthorId', { authorId });
      throw error;
    }
  }

  // Method to get posts with pagination by author
  async findByAuthorIdPaginated(
    authorId: string,
    page: number = 0,
    limit: number = 10
  ): Promise<{ posts: Post[]; total: number }> {
    try {
      const skip = page * limit;

      const [posts, total] = await Promise.all([
        this.config.delegate.findMany({
          where: { authorId },
          select: this.config.selector,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        this.config.delegate.count({ where: { authorId } })
      ]);

      return {
        posts: posts.map((post: any) => this.config.mapToShared(post)),
        total
      };
    } catch (error: any) {
      this.handleError(error, 'findByAuthorIdPaginated', { authorId, page, limit });
      throw error;
    }
  }

  // Method to find posts by title (exact or partial match)
  async findByTitle(title: string, exact: boolean = false): Promise<PostWithAuthor[]> {
    try {
      const whereCondition = exact
        ? { title: { equals: title } }
        : { title: { contains: title, mode: 'insensitive' as const } };

      const posts = await this.config.delegate.findMany({
        where: whereCondition,
        select: this.config.selector,
        orderBy: { createdAt: 'desc' }
      });

      return posts.map((post: any) => this.config.mapToShared(post));
    } catch (error: any) {
      this.handleError(error, 'findByTitle', { title, exact });
      throw error;
    }
  }

  // Method to get recent posts
  async findRecent(limit: number = 10): Promise<PostWithAuthor[]> {
    try {
      const posts = await this.config.delegate.findMany({
        select: this.config.selector,
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return posts.map((post: any) => this.config.mapToShared(post));
    } catch (error: any) {
      this.handleError(error, 'findRecent', { limit });
      throw error;
    }
  }
}