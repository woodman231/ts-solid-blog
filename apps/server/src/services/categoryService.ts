import { ICategoryService } from '../core/interfaces/categoryService';
import { ICategoryRepository } from '../core/interfaces/categoryRepository';
import { Category } from '@blog/shared/src/models/Category';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { BaseService, ServiceConfig, ServiceContext } from '../core/BaseService';

export class CategoryService extends BaseService<Category> implements ICategoryService {
    constructor(private categoryRepository: ICategoryRepository) {
        const config: ServiceConfig<Category, ICategoryRepository> = {
            repository: categoryRepository,
            checkAuthorization: async (userId: string, operation: string, entityId?: string): Promise<boolean> => {
                return true; // Categories are generally public, adjust as needed
            },
        };
        super(config);
    }

    async findBySlug(slug: string, context: ServiceContext): Promise<Category | null> {
        return this.categoryRepository.findBySlug(slug);
    }

    async findByParentId(parentId: string, context: ServiceContext): Promise<Category[]> {
        return this.categoryRepository.findByParentId(parentId);
    }

    async findAll(query: QueryOptions, context: ServiceContext): Promise<PaginatedResult<Category>> {
        return this.categoryRepository.findAll(query);
    }
}
