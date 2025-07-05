# Entity Handler Refactoring

## Overview

This refactoring eliminates magic strings and introduces a more maintainable, type-safe approach to handling entity operations in the socket handlers.

## Key Changes

### 1. Entity Type Constants

- **Before**: Magic strings like `'users'`, `'posts'`
- **After**: Type-safe constants from `ENTITY_TYPES`

```typescript
// Before
if (!["users", "posts"].includes(entityType)) {
  // handle error
}

// After
import {
  ENTITY_TYPES,
  isValidEntityType,
} from "@blog/shared/src/constants/entityTypes";

if (!isValidEntityType(entityType)) {
  // handle error
}
```

### 2. Response Type Constants

- **Before**: Magic strings like `'setEntityData'`, `'error'`
- **After**: Type-safe constants from `RESPONSE_TYPES`

```typescript
// Before
callback({
  responseType: 'setEntityData',
  responseParams: { ... }
});

// After
import { RESPONSE_TYPES } from '@blog/shared/src/constants/responseTypes';

callback({
  responseType: RESPONSE_TYPES.SET_ENTITY_DATA,
  responseParams: { ... }
});
```

### 3. Key-Based Entity Fetching

- **Before**: Switch statement with magic strings
- **After**: Registry-based approach with type safety

```typescript
// Before
switch (entityType) {
  case "users":
    result = await services.userService.getAll(queryOptions);
    break;
  case "posts":
    result = await services.postService.getAllPostsWithContext(
      context,
      queryOptions
    );
    break;
}

// After
import { getEntityFetcher, hasEntityFetcher } from "../registry/entityRegistry";

if (hasEntityFetcher(entityType)) {
  const entityFetcher = getEntityFetcher(entityType);
  result = await entityFetcher(services, context, queryOptions);
}
```

### 4. Error Code Constants

- **Before**: Magic strings for error codes
- **After**: Type-safe error codes from `ERROR_CODES`

```typescript
// Before
callback({
  responseType: "error",
  responseParams: {
    error: {
      code: "INVALID_ENTITY_TYPE",
      message: "Error message",
    },
  },
});

// After
import { ERROR_CODES } from "@blog/shared/src/constants/responseTypes";

callback({
  responseType: RESPONSE_TYPES.ERROR,
  responseParams: {
    error: {
      code: ERROR_CODES.INVALID_ENTITY_TYPE,
      message: "Error message",
    },
  },
});
```

## Benefits

1. **Type Safety**: All entity types and response types are now type-checked at compile time
2. **Maintainability**: Adding new entity types is easier - just add to the constants and registry
3. **Consistency**: All handlers use the same constants, reducing typos and inconsistencies
4. **IDE Support**: Better autocomplete and refactoring support
5. **Extensibility**: Easy to add new entity types without modifying switch statements

## Adding New Entity Types

To add a new entity type (e.g., `'comments'`):

1. Add to `ENTITY_TYPES` constant:

```typescript
export const ENTITY_TYPES = {
  USERS: "users",
  POSTS: "posts",
  COMMENTS: "comments", // Add here
} as const;
```

2. Add to entity registry:

```typescript
export const ENTITY_FETCHERS: Record<EntityType, EntityFetcher> = {
  [ENTITY_TYPES.USERS]: async (services, context, options) => {
    return await services.userService.getAll(options);
  },
  [ENTITY_TYPES.POSTS]: async (services, context, options) => {
    return await services.postService.getAllPostsWithContext(context, options);
  },
  [ENTITY_TYPES.COMMENTS]: async (services, context, options) => {
    // Add here
    return await services.commentService.getAllCommentsWithContext(
      context,
      options
    );
  },
};
```

3. Update the service registry interface if needed:

```typescript
export interface EntityServiceRegistry {
  userService: IUserService;
  postService: IPostService;
  commentService: ICommentService; // Add here
}
```

## Migration Notes

- All existing handlers will continue to work without modification
- The changes are backwards compatible with existing client code
- Type checking will catch any inconsistencies during development
- The registry approach makes it easy to add middleware, caching, or other cross-cutting concerns

## Files Modified

- `/workspace/packages/shared/src/constants/entityTypes.ts` - New entity type constants
- `/workspace/packages/shared/src/constants/responseTypes.ts` - New response type constants
- `/workspace/packages/shared/src/socket/Request.ts` - Updated to use EntityType
- `/workspace/packages/shared/src/socket/Response.ts` - Updated to use response type constants
- `/workspace/apps/server/src/socket/registry/entityRegistry.ts` - New registry for entity fetchers
- `/workspace/apps/server/src/socket/handlers/fetchEntitiesHandler.ts` - Refactored to use constants and registry
- `/workspace/apps/server/src/socket/handlers/index.ts` - Updated to use constants and registry
- `/workspace/packages/shared/src/index.ts` - Added exports for new constants
