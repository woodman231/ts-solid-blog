import { User } from '@blog/shared/src/models/User';
import { IRepository } from './repository';

export interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByIdentityId(identityId: string): Promise<User | null>;
  upsertByIdentityId(identityId: string, data: Partial<User>): Promise<User>;
}