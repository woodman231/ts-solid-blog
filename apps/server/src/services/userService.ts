import { IUserService } from '../core/interfaces/userService';
import { IUserRepository } from '../core/interfaces/userRepository';
import { User } from '@blog/shared/src/models/User';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { BaseService, ServiceConfig } from '../core/BaseService';

export class UserService extends BaseService<User, IUserRepository> implements IUserService {
  constructor(userRepository: IUserRepository) {
    const config: ServiceConfig<User, IUserRepository> = {
      repository: userRepository,
    };
    super(config);
  }

  async getAllUsers(options?: QueryOptions): Promise<PaginatedResult<User>> {
    return this.repository.findAll(options);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.repository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email);
  }
}
