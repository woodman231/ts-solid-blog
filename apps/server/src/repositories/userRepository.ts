import { PrismaClient } from '@prisma/client';
import { User } from '@blog/shared/src/models/User';
import { IUserRepository } from '../core/interfaces/userRepository';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) { }

  async findAll(options?: QueryOptions): Promise<PaginatedResult<User>> {
    const page = options?.pagination?.page ?? 0;
    const limit = options?.pagination?.limit ?? 10;
    const skip = page * limit;

    // Build where clause for filtering
    const where: any = {};
    if (options?.filter) {
      Object.keys(options.filter).forEach(key => {
        if (options.filter![key] !== undefined && options.filter![key] !== null) {
          // Handle different filter types
          if (typeof options.filter![key] === 'string') {
            where[key] = {
              contains: options.filter![key],
              mode: 'insensitive'
            };
          } else {
            where[key] = options.filter![key];
          }
        }
      });
    }

    // Build orderBy clause for sorting
    const orderBy: any = {};
    if (options?.sort) {
      Object.keys(options.sort).forEach(key => {
        orderBy[key] = options.sort![key];
      });
    } else {
      orderBy.createdAt = 'desc'; // Default sort
    }

    // Execute queries in parallel
    const [users, total, filteredTotal] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.user.count(), // Total count without filters
      this.prisma.user.count({ where }), // Total count with filters
    ]);

    return {
      data: users.map(this.mapToUser),
      total,
      filteredTotal,
      page,
      limit,
      totalPages: Math.ceil(filteredTotal / limit),
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });
    return user ? this.mapToUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });
    return user ? this.mapToUser(user) : null;
  }

  async findByIdentityId(identityId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { identityId }
    });
    return user ? this.mapToUser(user) : null;
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { identityId: string }): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        identityId: data.identityId,
        email: data.email,
        displayName: data.displayName
      }
    });
    return this.mapToUser(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data
    });
    return this.mapToUser(user);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.user.delete({
      where: { id }
    });
    return true;
  }

  async upsertByIdentityId(identityId: string, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.upsert({
      where: { identityId },
      update: {
        displayName: data.displayName,
        email: data.email
      },
      create: {
        identityId,
        email: data.email!,
        displayName: data.displayName!
      }
    });
    return this.mapToUser(user);
  }

  private mapToUser(user: any): User {
    return {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }
}