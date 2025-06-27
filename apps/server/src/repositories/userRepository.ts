import { PrismaClient } from '@prisma/client';
import { User } from '@blog/shared/src/models/User';
import { IUserRepository } from '../core/interfaces/userRepository';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(this.mapToUser);
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