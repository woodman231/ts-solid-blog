import { PrismaClient, Prisma } from '@prisma/client';
import { Category } from '@blog/shared/src/models/Category';
import { ICategoryRepository } from '../core/interfaces/categoryRepository';
import { BaseRepository, RepositoryConfig } from '../core/BaseRepository';

// Define the selector for type-safe queries
export const categorySelector = {
    id: true,
    name: true,
    slug: true,
    description: true,
    parentId: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.CategorySelect;

// Define the payload type based on the selector
export type CategoryPayload = Prisma.CategoryGetPayload<{ select: typeof categorySelector }>;

export class CategoryRepository extends BaseRepository<Category, CategoryPayload, PrismaClient['category']> implements ICategoryRepository {
    constructor(prisma: PrismaClient) {
        const config: RepositoryConfig<Category, CategoryPayload, PrismaClient['category']> = {
            delegate: prisma.category,
            selector: categorySelector,
            columnFieldMapping: {
                id: 'id',
                name: 'name',
                slug: 'slug',
                description: 'description',
                parentId: 'parentId',
                createdAt: 'createdAt',
                updatedAt: 'updatedAt',
            },
            mapToShared: (category: CategoryPayload): Category => ({
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description ?? '',
                parentId: category.parentId ?? undefined,
                createdAt: category.createdAt.toISOString(),
                updatedAt: category.updatedAt.toISOString(),
            }),
            mapToCreateInput: (data: Partial<Category>) => ({
                name: data.name,
                slug: data.slug,
                description: data.description,
                parentId: data.parentId,
            }),
            mapToUpdateInput: (data: Partial<Category>) => {
                const updateData: any = {};
                if (data.name !== undefined) updateData.name = data.name;
                if (data.slug !== undefined) updateData.slug = data.slug;
                if (data.description !== undefined) updateData.description = data.description;
                if (data.parentId !== undefined) updateData.parentId = data.parentId;
                return updateData;
            },
        };
        super(prisma, config);
    }

    async findBySlug(slug: string): Promise<Category | null> {
        const category = await this.config.delegate.findUnique({
            where: { slug },
            select: this.config.selector,
        }) as CategoryPayload | null;
        return category ? this.config.mapToShared(category) : null;
    }

    async findByParentId(parentId: string): Promise<Category[]> {
        const categories = await this.config.delegate.findMany({
            where: { parentId },
            select: this.config.selector,
        }) as unknown as CategoryPayload[];
        return categories.map(this.config.mapToShared);
    }
}
