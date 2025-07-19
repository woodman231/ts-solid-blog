import { Category } from '@blog/shared/src/models/Category';
import { IRepository } from './repository';

export interface ICategoryRepository extends IRepository<Category> {
    findBySlug(slug: string): Promise<Category | null>;
    findByParentId(parentId: string): Promise<Category[]>;
}
