import { PrismaClient } from '@prisma/client';
import { Container } from '../core/container';

// Import the new repository implementations
import { UserRepository as UserRepositoryV2 } from '../repositories/UserRepositoryV2';
import { PostRepository as PostRepositoryV2 } from '../repositories/PostRepositoryV2';
import { RepositoryFactory } from '../repositories/RepositoryFactory';

// Import existing repositories for comparison
import { UserRepository as UserRepositoryV1 } from '../repositories/userRepository';
import { PostRepository as PostRepositoryV1 } from '../repositories/postRepository';

// Import services
import { UserService } from '../services/userService';
import { PostService } from '../services/postService';
import { AuthService } from '../services/authService';

/**
 * Example of how to set up the container with the new repository factory
 */
export function setupContainerWithFactory(prisma: PrismaClient): Container {
    const container = new Container();

    // Register Prisma client
    container.register('prisma', prisma);

    // Create repository factory
    const repositoryFactory = new RepositoryFactory(prisma);
    container.register('repositoryFactory', repositoryFactory);

    // Option 1: Use the new factory-based repositories
    const userRepositoryV2 = new UserRepositoryV2(prisma);
    const postRepositoryV2 = new PostRepositoryV2(prisma);

    container.register('userRepository', userRepositoryV2);
    container.register('postRepository', postRepositoryV2);

    // Register services (they work with both old and new repositories due to interface compliance)
    const userService = new UserService(userRepositoryV2);
    const postService = new PostService(postRepositoryV2, userRepositoryV2);

    // AuthService requires additional parameters from environment
    const authService = new AuthService(
        userRepositoryV2,
        process.env.ADB2C_TENANT_ID || '',
        process.env.ADB2C_CLIENT_ID || '',
        process.env.ADB2C_CLIENT_SECRET || ''
    );

    container.register('userService', userService);
    container.register('postService', postService);
    container.register('authService', authService);

    return container;
}

/**
 * Alternative setup showing gradual migration approach
 */
export function setupContainerWithMigration(prisma: PrismaClient): Container {
    const container = new Container();

    // You can choose to use old or new repositories per entity
    // This allows for gradual migration

    // Keep using V1 for users (if needed)
    const userRepositoryV1 = new UserRepositoryV1(prisma);

    // Use V2 for posts (new features)
    const postRepositoryV2 = new PostRepositoryV2(prisma);

    container.register('userRepository', userRepositoryV1);
    container.register('postRepository', postRepositoryV2);

    // Services work with both due to interface compliance
    const userService = new UserService(userRepositoryV1);
    const postService = new PostService(postRepositoryV2, userRepositoryV1);

    // AuthService requires additional parameters from environment
    const authService = new AuthService(
        userRepositoryV1,
        process.env.ADB2C_TENANT_ID || '',
        process.env.ADB2C_CLIENT_ID || '',
        process.env.ADB2C_CLIENT_SECRET || ''
    );

    container.register('userService', userService);
    container.register('postService', postService);
    container.register('authService', authService);

    return container;
}

/**
 * Example showing how to create custom repositories for new entities
 */
export function setupContainerWithCustomEntities(prisma: PrismaClient): Container {
    const container = new Container();
    const repositoryFactory = new RepositoryFactory(prisma);

    // Standard entities
    container.register('userRepository', new UserRepositoryV2(prisma));
    container.register('postRepository', new PostRepositoryV2(prisma));

    // Custom entities using the factory (when you add new entities in the future)
    // Uncomment when you have these entities in your schema:

    // container.register('commentRepository', repositoryFactory.createCommentRepository());
    // container.register('tagRepository', repositoryFactory.createTagRepository());
    // container.register('categoryRepository', repositoryFactory.createCategoryRepository());

    // Example of a completely custom entity using the generic factory
    // const auditLogRepository = repositoryFactory.createGenericRepository(
    //   prisma.auditLog,
    //   (log: any) => ({
    //     id: log.id,
    //     action: log.action,
    //     entityType: log.entityType,
    //     entityId: log.entityId,
    //     userId: log.userId,
    //     details: log.details,
    //     createdAt: log.createdAt.toISOString()
    //   }),
    //   ['action', 'entityType', 'details'],
    //   { user: true }
    // );
    // container.register('auditLogRepository', auditLogRepository);

    return container;
}

/**
 * Utility function to demonstrate the benefits of the factory approach
 */
export function demonstrateRepositoryBenefits() {
    console.log(`
Repository Factory Benefits:

1. **Code Reuse**: 
   - Common CRUD operations are implemented once
   - Pagination, filtering, and sorting logic is shared
   - Error handling is standardized

2. **Type Safety**: 
   - Full TypeScript support with generics
   - Compile-time checking for entity mappings
   - Interface compliance guaranteed

3. **Consistency**: 
   - All repositories follow the same patterns
   - Standardized error messages and logging
   - Consistent API across different entities

4. **Extensibility**: 
   - Easy to add entity-specific methods
   - Flexible configuration for different use cases
   - Support for complex relationships and includes

5. **Maintainability**: 
   - Changes to common logic affect all repositories
   - Easy to add new features (like audit trails)
   - Reduced boilerplate code

6. **Performance**: 
   - Optimized queries with proper includes
   - Efficient pagination with parallel count queries
   - Built-in query optimization patterns

7. **Future-Proof**: 
   - Easy to add new entities without code duplication
   - Consistent patterns for new developers
   - Scalable architecture for growing applications
  `);
}
