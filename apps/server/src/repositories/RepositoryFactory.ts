import { PrismaClient } from '@prisma/client';
import { BaseRepository, RepositoryConfig, createRepository, PrismaModelDelegate } from '../core/BaseRepository';

/**
 * Example of how to create repositories for future entities using the factory
 */

// Example: Comment entity (hypothetical future entity)
export interface Comment {
    id: string;
    content: string;
    postId: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
}

// Example: Tag entity
export interface Tag {
    id: string;
    name: string;
    description?: string;
    color: string;
    createdAt: string;
    updatedAt: string;
}

// Example: Category entity
export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Factory functions for creating different repository types
 */
export class RepositoryFactory {
    constructor(private prisma: PrismaClient) { }

    /**
     * Creates a Comment repository (example for future use)
     */
    createCommentRepository() {
        const config: RepositoryConfig<Comment, any, PrismaModelDelegate> = {
            delegate: (this.prisma as any).comment, // Assuming this exists in future            
            mapToShared: (comment: any): Comment => ({
                id: comment.id,
                content: comment.content,
                postId: comment.postId,
                authorId: comment.authorId,
                createdAt: comment.createdAt.toISOString(),
                updatedAt: comment.updatedAt.toISOString()
            }),
            globalSearchConfig: {
                searchFields: [
                    { field: 'content' },
                    { field: 'author.displayName', isNested: true }
                ]
            },
            include: { author: true, post: true },
            defaultSort: { createdAt: 'desc' }
        };

        return createRepository<Comment, any, PrismaModelDelegate>(this.prisma, config);
    }

    /**
     * Creates a Tag repository (example for future use)
     */
    createTagRepository() {
        const config: RepositoryConfig<Tag, any, PrismaModelDelegate> = {
            delegate: (this.prisma as any).tag, // Assuming this exists in future            
            mapToShared: (tag: any): Tag => ({
                id: tag.id,
                name: tag.name,
                description: tag.description,
                color: tag.color,
                createdAt: tag.createdAt.toISOString(),
                updatedAt: tag.updatedAt.toISOString()
            }),
            globalSearchConfig: {
                searchFields: [
                    { field: 'name' },
                    { field: 'description' }
                ]
            },
            defaultSort: { name: 'asc' }
        };

        return createRepository<Tag, any, PrismaModelDelegate>(this.prisma, config);
    }

    /**
     * Creates a Category repository with hierarchical support
     */
    createCategoryRepository() {
        const config: RepositoryConfig<Category, any, PrismaModelDelegate> = {
            delegate: (this.prisma as any).category, // Assuming this exists in future            
            mapToShared: (category: any): Category => ({
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                parentId: category.parentId,
                isActive: category.isActive,
                createdAt: category.createdAt.toISOString(),
                updatedAt: category.updatedAt.toISOString()
            }),
            globalSearchConfig: {
                searchFields: [
                    { field: 'name' },
                    { field: 'description' },
                    { field: 'slug' }
                ]
            },
            include: {
                parent: true,
                children: true
            },
            defaultSort: { name: 'asc' }
        };

        // Return an extended repository with category-specific methods
        class CategoryRepository extends BaseRepository<Category, any, PrismaModelDelegate> {
            async findRootCategories(): Promise<Category[]> {
                const categories = await this.config.delegate.findMany({
                    where: { parentId: null },
                    include: this.config.include,
                    orderBy: { name: 'asc' }
                });
                return categories.map((cat: any) => this.config.mapToShared(cat));
            }

            async findByParentId(parentId: string): Promise<Category[]> {
                const categories = await this.config.delegate.findMany({
                    where: { parentId },
                    include: this.config.include,
                    orderBy: { name: 'asc' }
                });
                return categories.map((cat: any) => this.config.mapToShared(cat));
            }

            async findActiveCategories(): Promise<Category[]> {
                const categories = await this.config.delegate.findMany({
                    where: { isActive: true },
                    include: this.config.include,
                    orderBy: { name: 'asc' }
                });
                return categories.map((cat: any) => this.config.mapToShared(cat));
            }
        }

        return new CategoryRepository(this.prisma, config);
    }

    /**
     * Creates a generic repository for any entity with minimal configuration
     */
    createGenericRepository<TShared, TPrisma, TDelegate extends PrismaModelDelegate>(
        modelDelegate: TDelegate,
        mapToShared: (entity: TPrisma) => TShared,
        searchFields?: string[],
        include?: any
    ) {
        const config: RepositoryConfig<TShared, TPrisma, TDelegate> = {
            delegate: modelDelegate,
            mapToShared,
            globalSearchConfig: searchFields ? {
                searchFields: searchFields.map(field => ({ field }))
            } : undefined,
            include,
            defaultSort: { createdAt: 'desc' }
        };

        return createRepository<TShared, TPrisma, TDelegate>(this.prisma, config);
    }
}

/**
 * Usage examples:
 * 
 * const factory = new RepositoryFactory(prisma);
 * 
 * // Create specialized repositories
 * const commentRepo = factory.createCommentRepository();
 * const tagRepo = factory.createTagRepository();
 * const categoryRepo = factory.createCategoryRepository();
 * 
 * // Create generic repository for any entity
 * const customRepo = factory.createGenericRepository(
 *   prisma.someEntity,
 *   (entity) => ({ ...entity, createdAt: entity.createdAt.toISOString() }),
 *   ['name', 'description'],
 *   { relatedEntity: true }
 * );
 */
