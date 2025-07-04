import { PrismaClient, Post as PrismaPost, User as PrismaUser } from '@prisma/client';
import { Post } from '@blog/shared/src/models/Post';
import { IPostRepository } from '../core/interfaces/postRepository';
import { BaseRepository, RepositoryConfig } from '../core/BaseRepository';

// Type for Prisma Post with included Author
type PrismaPostWithAuthor = PrismaPost & {
  author: PrismaUser;
};

export class PostRepository extends BaseRepository<Post, PrismaPostWithAuthor> implements IPostRepository {
  constructor(prisma: PrismaClient) {
    const config: RepositoryConfig<Post, PrismaPostWithAuthor> = {
      model: prisma.post,
      mapToShared: (post: PrismaPostWithAuthor): Post => ({
        id: post.id,
        title: post.title,
        description: post.description,
        body: post.body,
        authorId: post.authorId,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString()
      }),
      mapToCreateInput: (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => ({
        title: data.title,
        description: data.description,
        body: data.body,
        authorId: data.authorId
      }),
      mapToUpdateInput: (data: Partial<Post>) => {
        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.body !== undefined) updateData.body = data.body;
        // Note: typically you wouldn't allow updating authorId, but keeping for flexibility
        if (data.authorId !== undefined) updateData.authorId = data.authorId;
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
      include: { author: true }
    };

    super(prisma, config);
  }

  // Additional methods specific to Post
  async findByAuthorId(authorId: string): Promise<Post[]> {
    try {
      const posts = await this.config.model.findMany({
        where: { authorId },
        include: this.config.include
      });
      return posts.map(this.config.mapToShared);
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
        this.config.model.findMany({
          where: { authorId },
          include: this.config.include,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        this.config.model.count({ where: { authorId } })
      ]);

      return {
        posts: posts.map(this.config.mapToShared),
        total
      };
    } catch (error: any) {
      this.handleError(error, 'findByAuthorIdPaginated', { authorId, page, limit });
      throw error;
    }
  }

  // Method to find posts by title (exact or partial match)
  async findByTitle(title: string, exact: boolean = false): Promise<Post[]> {
    try {
      const whereCondition = exact
        ? { title: { equals: title } }
        : { title: { contains: title, mode: 'insensitive' as const } };

      const posts = await this.config.model.findMany({
        where: whereCondition,
        include: this.config.include,
        orderBy: { createdAt: 'desc' }
      });

      return posts.map(this.config.mapToShared);
    } catch (error: any) {
      this.handleError(error, 'findByTitle', { title, exact });
      throw error;
    }
  }

  // Method to get recent posts
  async findRecent(limit: number = 10): Promise<Post[]> {
    try {
      const posts = await this.config.model.findMany({
        include: this.config.include,
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return posts.map(this.config.mapToShared);
    } catch (error: any) {
      this.handleError(error, 'findRecent', { limit });
      throw error;
    }
  }
}