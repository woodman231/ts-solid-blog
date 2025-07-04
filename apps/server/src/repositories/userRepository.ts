import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { User } from '@blog/shared/src/models/User';
import { IUserRepository } from '../core/interfaces/userRepository';
import { BaseRepository, RepositoryConfig } from '../core/BaseRepository';

export class UserRepository extends BaseRepository<User, PrismaUser> implements IUserRepository {
  constructor(prisma: PrismaClient) {
    const config: RepositoryConfig<User, PrismaUser> = {
      model: prisma.user,
      mapToShared: (user: PrismaUser): User => ({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }),
      mapToCreateInput: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => ({
        displayName: data.displayName,
        email: data.email
      }),
      mapToUpdateInput: (data: Partial<User>) => ({
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.email !== undefined && { email: data.email })
      }),
      globalSearchConfig: {
        searchFields: [
          { field: 'displayName' },
          { field: 'email' }
        ]
      },
      defaultSort: { createdAt: 'desc' }
    };

    super(prisma, config);
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.config.model.findUnique({
        where: { email }
      });
      return user ? this.config.mapToShared(user) : null;
    } catch (error: any) {
      this.handleError(error, 'findByEmail', { email });
      throw error;
    }
  }

  async findByIdentityId(identityId: string): Promise<User | null> {
    try {
      const user = await this.config.model.findUnique({
        where: { identityId }
      });
      return user ? this.config.mapToShared(user) : null;
    } catch (error: any) {
      this.handleError(error, 'findByIdentityId', { identityId });
      throw error;
    }
  }

  async upsertByIdentityId(identityId: string, data: Partial<User>): Promise<User> {
    try {
      const user = await this.config.model.upsert({
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
      return this.config.mapToShared(user);
    } catch (error: any) {
      this.handleError(error, 'upsertByIdentityId', { identityId, data });
      throw error;
    }
  }
}
