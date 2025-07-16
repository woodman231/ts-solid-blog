# Generic Dynamic Lookup Hook Refactoring

## Problem

The previous `ColumnFilterConfig` interface was too specific to authors, making it difficult to reuse for other types of lookup data like categories, tags, or any other entities.

## Solution

I've refactored the `dynamicLookupHook` to be generic and reusable for any type of lookup data.

## Changes Made

### 1. Generic Interface

```typescript
// Before (specific to authors)
dynamicLookupHook?: () => {
    authors: Array<{ id: string; displayName: string }>;
    searchAuthors: (query: string) => void;
    isLoading: boolean;
    error: any;
};

// After (generic)
dynamicLookupHook?: () => {
    data: Array<T>;
    searchData: (query: string) => void;
    isLoading: boolean;
    error: any;
};
```

### 2. Type Parameterization

```typescript
export interface ColumnFilterConfig<T = any> {
  // ... other properties
  dynamicLookupHook?: () => {
    data: Array<T>;
    searchData: (query: string) => void;
    isLoading: boolean;
    error: any;
  };
}
```

### 3. Generic Component

```typescript
function DynamicLookupSelector<T extends { id: string; displayName: string }>({
  value,
  setValue,
  dynamicLookupHook,
}: DynamicLookupSelectorProps<T>) {
  const { data, searchData, isLoading } = dynamicLookupHook();
  // Uses 'data' instead of 'authors'
}
```

## Usage Examples

### Authors (Current Usage)

```typescript
const columnFilterConfigs: Record<string, ColumnFilterConfig> = {
  authorId: {
    type: "lookup",
    operators: ["in", "notIn"],
    useDynamicLookup: true,
    dynamicLookupHook: useAuthorSearch, // Returns { data, searchData, isLoading, error }
  },
};
```

### Categories Example

```typescript
// Create a generic hook for categories
export function useCategorySearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // ... debouncing logic

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["searchCategories", debouncedQuery],
    queryFn: async () => {
      // Fetch categories
      return categoriesData;
    },
  });

  const searchData = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    data: categories, // Generic 'data' property
    searchData, // Generic 'searchData' function
    isLoading,
    error,
  };
}

// Usage in column config
const columnFilterConfigs: Record<string, ColumnFilterConfig> = {
  categoryId: {
    type: "lookup",
    operators: ["in", "notIn"],
    useDynamicLookup: true,
    dynamicLookupHook: useCategorySearch, // Now it's generic!
  },
};
```

### Tags Example

```typescript
// Tags hook
export function useTagSearch() {
  // ... implementation
  return {
    data: tags, // Array of { id: string; displayName: string }
    searchData, // (query: string) => void
    isLoading,
    error,
  };
}

// Usage
const columnFilterConfigs: Record<string, ColumnFilterConfig> = {
  tagIds: {
    type: "lookup",
    operators: ["in", "notIn"],
    useDynamicLookup: true,
    dynamicLookupHook: useTagSearch,
  },
};
```

### Custom Entity Example

```typescript
// Generic hook for any entity
export function useEntitySearch<T extends { id: string; displayName: string }>(
  entityType: string,
  searchEndpoint: string
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const {
    data: entities = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [entityType, debouncedQuery],
    queryFn: async () => {
      // Generic fetch logic
      return fetchEntities(searchEndpoint, debouncedQuery);
    },
  });

  const searchData = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    data: entities,
    searchData,
    isLoading,
    error,
  };
}

// Usage
const useProjectSearch = () =>
  useEntitySearch("projects", "/api/projects/search");
```

## Benefits

### 1. Reusability

- Same interface works for any type of lookup data
- No need to create specific interfaces for each entity type
- Consistent API across all lookup filters

### 2. Type Safety

- Full TypeScript support with generics
- Compile-time checking for correct data structure
- IntelliSense support for all properties

### 3. Maintainability

- Single implementation for all lookup types
- Changes to lookup behavior apply everywhere
- Easier to add new lookup entity types

### 4. Flexibility

- Can be used for any entity with `id` and `displayName`
- Supports custom search logic per entity type
- Easy to extend with additional properties

## Migration Guide

### For Existing Code

1. Update hook return object:

   ```typescript
   // Change from:
   return { authors, searchAuthors, isLoading, error };

   // To:
   return { data: authors, searchData: searchAuthors, isLoading, error };
   ```

2. No changes needed in column configurations - they work the same way

### For New Implementations

1. Create hooks that return the generic interface:

   ```typescript
   return {
     data: yourEntities,
     searchData: yourSearchFunction,
     isLoading,
     error,
   };
   ```

2. Ensure your entities have `id` and `displayName` properties

## Constraints

- Lookup entities must have `id: string` and `displayName: string` properties
- This is enforced by the generic constraint: `T extends { id: string; displayName: string }`
- If you need different property names, you can map them in your hook

The refactored interface is now truly generic and can be used for any type of lookup data while maintaining type safety and a consistent API.
