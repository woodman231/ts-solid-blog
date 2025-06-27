import { PrismaClient } from '@prisma/client';
import { Post } from '@blog/shared/src/models/Post';
import { IPostRepository } from '../core/interfaces/postRepository';

export class PostRepository implements IPostRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(options?: { 
    page?: number; 
    limit?: number; 
    sort?: Record<string, 'asc' | 'desc'>;
    filter?: Record<string, any>;
  }): Promise<Post[]> {
    const { page = 0, limit = 10, sort = { createdAt: 'desc' }, filter = {} } = options || {};
    
    // Convert sort to Prisma format
    const orderBy = Object.entries(sort).map(([key, value]) => ({
      [key]: value
    }));

    // Convert filter to Prisma format
    const where = filter;

    const posts = await this.prisma.post.findMany({
      where,
      orderBy,
      skip: page * limit,
      take: limit,
      include: { author: true }
    });

    return posts.map(this.mapToPost);
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