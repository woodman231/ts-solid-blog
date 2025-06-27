import { User } from '@blog/shared/src/models/User';

export interface IUserService {
  getAllUsers(options?: any): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
}