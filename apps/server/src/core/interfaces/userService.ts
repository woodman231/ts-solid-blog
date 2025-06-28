import { User } from '@blog/shared/src/models/User';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';

export interface IUserService {
  getAllUsers(options?: QueryOptions): Promise<PaginatedResult<User>>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
}