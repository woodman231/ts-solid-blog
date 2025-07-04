# Enhanced Type-Safe BaseRepository Example

This example demonstrates the enhanced type-safe BaseRepository pattern with proper delegate separation and Prisma GetPayload usage.

## Key Improvements

1. **Delegate Type Safety**: The `delegate` parameter is now properly typed using `PrismaModelDelegate`
2. **Model Repurposing**: The `model` parameter now represents the Prisma payload type (from `GetPayload`)
3. **Type-Safe Selectors**: Uses `satisfies` to ensure type safety for selectors
4. **Improved Type Inference**: Better TypeScript inference and compile-time safety

## Example Usage

### User Repository with Type-Safe Selector

```typescript
import { PrismaClient, Prisma } from "@prisma/client";
import { User } from "@blog/shared/src/models/User";
import { BaseRepository, RepositoryConfig } from "../core/BaseRepository";

// Define the selector for type-safe queries
export const userSelector = {
  id: true,
  identityId: true,
  email: true,
  displayName: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

// Define the payload type based on the selector
export type UserPayload = Prisma.UserGetPayload<{
  select: typeof userSelector;
}>;

export class UserRepository extends BaseRepository<
  User,
  UserPayload,
  PrismaClient["user"]
> {
  constructor(prisma: PrismaClient) {
    const config: RepositoryConfig<User, UserPayload, PrismaClient["user"]> = {
      delegate: prisma.user, // The actual Prisma delegate
      model: {} as UserPayload, // Type-only placeholder for payload
      mapToShared: (user: UserPayload): User => ({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }),
      // ... other configuration
    };
    super(prisma, config);
  }
}
```

### Post Repository with Related Data

```typescript
import { PrismaClient, Prisma } from "@prisma/client";
import { Post } from "@blog/shared/src/models/Post";
import { BaseRepository, RepositoryConfig } from "../core/BaseRepository";

// Define the selector with author relation
export const postWithAuthorSelector = {
  id: true,
  title: true,
  description: true,
  body: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      displayName: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.PostSelect;

// Define the payload type
export type PostWithAuthorPayload = Prisma.PostGetPayload<{
  select: typeof postWithAuthorSelector;
}>;

export class PostRepository extends BaseRepository<
  Post,
  PostWithAuthorPayload,
  PrismaClient["post"]
> {
  constructor(prisma: PrismaClient) {
    const config: RepositoryConfig<
      Post,
      PostWithAuthorPayload,
      PrismaClient["post"]
    > = {
      delegate: prisma.post,
      model: {} as PostWithAuthorPayload,
      mapToShared: (post: PostWithAuthorPayload): Post => ({
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
      include: { author: true },
    };
    super(prisma, config);
  }
}
```

## Benefits

1. **Type Safety**: The delegate type ensures all Prisma operations are type-safe
2. **Compile-Time Validation**: Selectors are validated at compile time using `satisfies`
3. **Auto-completion**: Full IntelliSense support for all Prisma operations
4. **Future-Proof**: Changes to Prisma schema are automatically reflected in types
5. **Consistent Pattern**: Same pattern across all repositories

## Migration Guide

### Before (Old Pattern)

```typescript
const config: RepositoryConfig<User, PrismaUser> = {
  model: prisma.user, // Mixed concerns - both delegate and type
  // ...
};
```

### After (New Pattern)

```typescript
const config: RepositoryConfig<User, UserPayload, PrismaClient["user"]> = {
  delegate: prisma.user, // The actual Prisma delegate
  model: {} as UserPayload, // Type-only placeholder
  // ...
};
```

## Key Changes Summary

1. **Separate Concerns**: `delegate` for operations, `model` for type inference
2. **Type Parameters**: Added `TDelegate` type parameter extending `PrismaModelDelegate`
3. **Payload Types**: Use `Prisma.ModelGetPayload<{ select: typeof selector }>` pattern
4. **Type Safety**: All operations are now fully type-safe with proper inference
