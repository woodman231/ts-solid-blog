import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';

export interface IRepository<T> {
  findAll(options?: QueryOptions): Promise<PaginatedResult<T>>;
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}