export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    createdAt: string;
    updatedAt: string;
}

export type CreateCategory = Omit<Category, 'id' | 'createdAt' | 'slug' | 'updatedAt'>; // Server will generate slug
