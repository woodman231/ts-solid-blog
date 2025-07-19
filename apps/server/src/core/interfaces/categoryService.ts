import { Category } from '@blog/shared/src/models/Category';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { IBaseService, ServiceContext } from '../BaseService';

export interface ICategoryService extends IBaseService<Category> {
    findBySlug(slug: string, context: ServiceContext): Promise<Category | null>;
    findByParentId(parentId: string, context: ServiceContext): Promise<Category[]>;
    findAll(query: QueryOptions, context: ServiceContext): Promise<PaginatedResult<Category>>;
}
