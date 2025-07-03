# Repository Factory Pattern Implementation

This document explains the repository factory pattern implementation that provides a standardized way to create repositories with common CRUD operations, filtering, pagination, and sorting capabilities.

## Overview

The repository factory pattern eliminates code duplication by providing a base repository class that handles common operations while allowing for entity-specific customizations. It ensures type safety and consistent patterns across all repositories.

## Key Benefits

1. **Code Reuse**: Common CRUD operations implemented once
2. **Type Safety**: Full TypeScript support with generics
3. **Consistency**: Standardized patterns across repositories
4. **Extensibility**: Easy to add entity-specific methods
5. **Maintainability**: Centralized logic for common operations
6. **Performance**: Optimized queries with proper includes and parallel operations

## Architecture

### BaseRepository Class

The `BaseRepository<TShared, TPrisma>` class provides:

- Generic CRUD operations (findAll, findById, create, update, delete)
- Automatic pagination with total counts
- Built-in filtering and sorting
- Global search capabilities
- Consistent error handling and logging
- Mapping between Prisma entities and shared models

### RepositoryConfig Interface

```typescript
interface RepositoryConfig<TShared, TPrisma> {
  model: any; // Prisma model delegate
  mapToShared: (prismaEntity: TPrisma) => TShared; // Entity mapping function
  mapToCreateInput?: (
    data: Omit<TShared, "id" | "createdAt" | "updatedAt">
  ) => any;
  mapToUpdateInput?: (data: Partial<TShared>) => any;
  globalSearchConfig?: {
    searchFields: Array<{
      field: string;
      isNested?: boolean;
    }>;
  };
  defaultSort?: Record<string, "asc" | "desc">;
  include?: any; // Prisma include config
  columnFieldMapping?: Record<string, string>; // Custom field mappings
}
```

## Usage Examples

### 1. Basic Repository Implementation

```typescript
// UserRepository using the factory pattern
export class UserRepository
  extends BaseRepository<User, PrismaUser>
  implements IUserRepository
{
  constructor(prisma: PrismaClient) {
    const config: RepositoryConfig<User, PrismaUser> = {
      model: prisma.user,
      mapToShared: (user: PrismaUser): User => ({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }),
      globalSearchConfig: {
        searchFields: [{ field: "displayName" }, { field: "email" }],
      },
      defaultSort: { createdAt: "desc" },
    };

    super(prisma, config);
  }

  // Add entity-specific methods
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.config.model.findUnique({
      where: { email },
    });
    return user ? this.config.mapToShared(user) : null;
  }
}
```

### 2. Repository with Relationships

```typescript
// PostRepository with author relationship
export class PostRepository
  extends BaseRepository<Post, PrismaPostWithAuthor>
  implements IPostRepository
{
  constructor(prisma: PrismaClient) {
    const config: RepositoryConfig<Post, PrismaPostWithAuthor> = {
      model: prisma.post,
      mapToShared: (post: PrismaPostWithAuthor): Post => ({
        id: post.id,
        title: post.title,
        description: post.description,
        body: post.body,
        authorId: post.authorId,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }),
      globalSearchConfig: {
        searchFields: [
          { field: "title" },
          { field: "description" },
          { field: "body" },
          { field: "author.displayName", isNested: true },
        ],
      },
      defaultSort: { createdAt: "desc" },
      include: { author: true }, // Include author in all queries
    };

    super(prisma, config);
  }
}
```

### 3. Factory Function for Simple Cases

```typescript
// Create repository using factory function
const commentRepository = createRepository<Comment, PrismaComment>(prisma, {
  model: prisma.comment,
  mapToShared: (comment) => ({
    id: comment.id,
    content: comment.content,
    postId: comment.postId,
    authorId: comment.authorId,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  }),
  globalSearchConfig: {
    searchFields: [{ field: "content" }],
  },
  include: { author: true, post: true },
});
```

### 4. Repository Factory Class

```typescript
export class RepositoryFactory {
  constructor(private prisma: PrismaClient) {}

  createGenericRepository<TShared, TPrisma>(
    modelDelegate: any,
    mapToShared: (entity: TPrisma) => TShared,
    searchFields?: string[],
    include?: any
  ) {
    const config: RepositoryConfig<TShared, TPrisma> = {
      model: modelDelegate,
      mapToShared,
      globalSearchConfig: searchFields
        ? {
            searchFields: searchFields.map((field) => ({ field })),
          }
        : undefined,
      include,
      defaultSort: { createdAt: "desc" },
    };

    return createRepository<TShared, TPrisma>(this.prisma, config);
  }
}
```

## Common Patterns

### Pagination and Filtering

All repositories automatically support:

```typescript
// Pagination
const result = await repository.findAll({
  pagination: { page: 0, limit: 10 },
});

// Filtering
const result = await repository.findAll({
  filter: {
    title_contains: "search term",
    createdAt_gte: "2023-01-01",
    "author.displayName_startsWith": "John",
  },
});

// Sorting
const result = await repository.findAll({
  sort: {
    createdAt: "desc",
    title: "asc",
  },
});

// Global search
const result = await repository.findAll({
  filter: {
    globalSearch: "search across all configured fields",
  },
});
```

### Error Handling

The base repository provides consistent error handling:

```typescript
// Automatic error transformation
try {
  const post = await postRepository.findById("invalid-id");
} catch (error) {
  // Error is automatically transformed to user-friendly message
  // "Post data not found" instead of raw Prisma error
}
```

### Custom Methods

Add entity-specific methods to repositories:

```typescript
export class PostRepository extends BaseRepository<Post, PrismaPostWithAuthor> {
  // ... base configuration ...

  // Custom method for finding by author
  async findByAuthorId(authorId: string): Promise<Post[]> {
    const posts = await this.config.model.findMany({
      where: { authorId },
      include: this.config.include,
    });
    return posts.map(this.config.mapToShared);
  }

  // Custom method for recent posts
  async findRecent(limit: number = 10): Promise<Post[]> {
    const posts = await this.config.model.findMany({
      include: this.config.include,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return posts.map(this.config.mapToShared);
  }
}
```

## Migration Strategy

### Gradual Migration

You can migrate repositories gradually:

```typescript
// Keep using existing repository for some entities
const userRepository = new UserRepositoryV1(prisma);

// Use new factory-based repository for others
const postRepository = new PostRepositoryV2(prisma);

// Services work with both due to interface compliance
const postService = new PostService(postRepository, userRepository);
```

### Interface Compliance

All factory-based repositories implement existing interfaces:

```typescript
// Both V1 and V2 implement IUserRepository
interface IUserRepository {
  findAll(options?: QueryOptions): Promise<PaginatedResult<User>>;
  findById(id: string): Promise<User | null>;
  create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<boolean>;
}
```

## Future Extensibility

### Adding New Entities

1. **Define the shared model**:

```typescript
export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
```

2. **Create repository using factory**:

```typescript
const commentRepository = factory.createGenericRepository(
  prisma.comment,
  (comment) => ({
    id: comment.id,
    content: comment.content,
    postId: comment.postId,
    authorId: comment.authorId,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  }),
  ["content"], // Search fields
  { author: true, post: true } // Include relations
);
```

3. **Or extend for custom methods**:

```typescript
export class CommentRepository extends BaseRepository<Comment, PrismaComment> {
  constructor(prisma: PrismaClient) {
    super(prisma, {
      model: prisma.comment,
      mapToShared: (comment) => ({
        /* mapping */
      }),
      // ... other config
    });
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    // Custom method implementation
  }
}
```

## Performance Considerations

- **Parallel Queries**: Total and filtered counts are fetched in parallel
- **Optimized Includes**: Relationships are included only when needed
- **Efficient Filtering**: Database-level filtering using Prisma's where clauses
- **Smart Pagination**: Skip/take patterns for efficient pagination

## Best Practices

1. **Use meaningful search fields** for global search configuration
2. **Include necessary relations** in the configuration
3. **Map data types carefully** (especially dates to ISO strings)
4. **Add entity-specific methods** for complex queries
5. **Maintain interface compliance** for service layer compatibility
6. **Use TypeScript generics** for type safety
7. **Handle errors appropriately** with user-friendly messages

This repository factory pattern provides a robust, scalable foundation for data access in your application while maintaining flexibility for future growth and customizations.
