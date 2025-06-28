import { IUserService } from '../core/interfaces/userService';
import { IUserRepository } from '../core/interfaces/userRepository';
import { User } from '@blog/shared/src/models/User';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) { }

  async getAllUsers(options?: QueryOptions): Promise<PaginatedResult<User>> {
    return this.userRepository.findAll(options);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}