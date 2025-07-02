import { PrismaClient } from '@prisma/client';
import { Post } from '@blog/shared/src/models/Post';
import { IPostRepository } from '../core/interfaces/postRepository';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { parseColumnFilters } from '../utils/filterParser';

export class PostRepository implements IPostRepository {
  constructor(private prisma: PrismaClient) { }

  async findAll(options?: QueryOptions): Promise<PaginatedResult<Post>> {
    const page = options?.pagination?.page ?? 0;
    const limit = options?.pagination?.limit ?? 10;
    const skip = page * limit;

    // Build where clause for filtering
    let where: any = {};
    let globalSearch: string | undefined;

    if (options?.filter) {
      const parsedFilters = parseColumnFilters(options.filter);
      where = parsedFilters.where;
      globalSearch = parsedFilters.globalSearch;

      // Handle global search filter (legacy support)
      if (globalSearch) {
        const globalConditions = [
          {
            title: {
              contains: globalSearch,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: globalSearch,
              mode: 'insensitive'
            }
          },
          {
            body: {
              contains: globalSearch,
              mode: 'insensitive'
            }
          },
          {
            author: {
              displayName: {
                contains: globalSearch,
                mode: 'insensitive'
              }
            }
          }
        ];

        // If there are other filters, combine with AND
        if (Object.keys(where).length > 0) {
          where = {
            AND: [
              where,
              { OR: globalConditions }
            ]
          };
        } else {
          where.OR = globalConditions;
        }
      }
    }

    // Build orderBy clause for sorting
    const orderBy: any = {};
    if (options?.sort) {
      Object.keys(options.sort).forEach(key => {
        // Handle nested sorting for author fields
        if (key === 'author.displayName' || key === 'author_displayName') {
          orderBy.author = {
            displayName: options.sort![key]
          };
        } else if (key.startsWith('author.')) {
          // Generic handler for other author fields
          const authorField = key.replace('author.', '');
          orderBy.author = {
            [authorField]: options.sort![key]
          };
        } else {
          // Direct field sorting
          orderBy[key] = options.sort![key];
        }
      });
    } else {
      orderBy.createdAt = 'desc'; // Default sort
    }

    // Execute queries in parallel
    const [posts, total, filteredTotal] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { author: true }
      }),
      this.prisma.post.count(), // Total count without filters
      this.prisma.post.count({ where }), // Total count with filters
    ]);

    return {
      data: posts.map(this.mapToPost),
      total,
      filteredTotal,
      page,
      limit,
      totalPages: Math.ceil(filteredTotal / limit),
    };
  }

  async findById(id: string): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });
    return post ? this.mapToPost(post) : null;
  }

  async findByAuthorId(authorId: string): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({
      where: { authorId },
      include: { author: true }
    });
    return posts.map(this.mapToPost);
  }

  async create(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const post = await this.prisma.post.create({
      data: {
        title: data.title,
        description: data.description,
        body: data.body,
        authorId: data.authorId
      },
      include: { author: true }
    });
    return this.mapToPost(post);
  }

  async update(id: string, data: Partial<Post>): Promise<Post> {
    const post = await this.prisma.post.update({
      where: { id },
      data,
      include: { author: true }
    });
    return this.mapToPost(post);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.post.delete({
      where: { id }
    });
    return true;
  }

  private mapToPost(post: any): Post {
    return {
      id: post.id,
      title: post.title,
      description: post.description,
      body: post.body,
      authorId: post.authorId,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  }
}