# DataTable Architecture Refactoring

## Overview

The DataTable component has been refactored to separate concerns between generic table functionality and entity-specific data fetching. This creates a more flexible and reusable architecture.

## Architecture

### 1. `DataTable<T>` - Generic Table Component

**File:** `apps/client/src/components/ui/DataTable.tsx`

The new `DataTable` is a pure UI component that:

- Handles table rendering, sorting, filtering, and pagination UI
- Receives data and handlers as props
- Does not know about entities or data fetching
- Can be used for any tabular data

#### Props Interface:

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  sorting: SortingState;
  onSortingChange: (updater: any) => void;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  debouncedGlobalFilter: string;
  columnFilters: ColumnFilters;
  onColumnFilterChange: (columnId: string, filter: FilterValue | null) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalPages: number;
  total: number;
  filteredTotal: number;
  isLoading: boolean;
  error: any;
  onRefetch: () => void;
  enableGlobalFilter?: boolean;
  globalFilterPlaceholder?: string;
  enableColumnFilters?: boolean;
  columnFilterConfigs?: Record<string, ColumnFilterConfig>;
  title: string;
  createButton?: React.ReactNode;
  entityType?: string; // For display purposes
  activeFiltersCount: number;
  userChangedFiltersCount: number;
  onClearAllFilters: () => void;
}
```

### 2. `EntityDataTable<T>` - Entity-Aware Wrapper

**File:** `apps/client/src/components/ui/EntityDataTable.tsx`

The `EntityDataTable` is a wrapper component that:

- Handles entity-specific data fetching via socket requests
- Manages state for sorting, filtering, and pagination
- Provides the original API for entity tables
- Uses the generic `DataTable` for rendering

#### Props Interface:

```typescript
interface EntityDataTableProps<T> {
  entityType: EntityType;
  columns: ColumnDef<T>[];
  initialSorting?: SortingState;
  enableGlobalFilter?: boolean;
  globalFilterPlaceholder?: string;
  enableColumnFilters?: boolean;
  columnFilterConfigs?: Record<string, ColumnFilterConfig>;
  columnSortMapping?: Record<string, string>;
  title: string;
  createButton?: React.ReactNode;
  defaultPageSize?: number;
  staleTime?: number;
  refetchOnMount?: boolean | "always";
  onDataChange?: (data: any) => void;
}
```

## Usage Examples

### For Entity Data (Recommended)

Use `EntityDataTable` for fetching entities from the server:

```tsx
import {
  EntityDataTable,
  ColumnFilterConfig,
} from "../../components/ui/EntityDataTable";
import { ENTITY_TYPES } from "@blog/shared/src/index";

export function PostsListPage() {
  const columnFilterConfigs: Record<string, ColumnFilterConfig> = {
    title: {
      type: "text",
      operators: ["contains", "startsWith", "endsWith", "equals"],
      placeholder: "Filter by title...",
    },
    // ... other filters
  };

  const columns: ColumnDef<PostWithAuthor>[] = [
    // ... column definitions
  ];

  return (
    <EntityDataTable
      entityType={ENTITY_TYPES.POSTS}
      columns={columns}
      enableGlobalFilter={true}
      enableColumnFilters={true}
      columnFilterConfigs={columnFilterConfigs}
      title="Posts"
      // ... other props
    />
  );
}
```

### For Custom Data (Advanced)

Use the generic `DataTable` when you have custom data sources:

```tsx
import { DataTable } from "../../components/ui/DataTable";
import { useState, useCallback } from "react";

export function CustomDataPage() {
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState("");
  // ... other state

  const handleSortingChange = useCallback((updater) => {
    setSorting(updater);
    // Custom sorting logic
  }, []);

  const handleGlobalFilterChange = useCallback((value) => {
    setGlobalFilter(value);
    // Custom filtering logic
  }, []);

  // ... other handlers

  return (
    <DataTable
      data={data}
      columns={columns}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={handleGlobalFilterChange}
      debouncedGlobalFilter={debouncedGlobalFilter}
      // ... all required props
    />
  );
}
```

## Migration Guide

### Existing Code

If you have existing code using the old `DataTable` for entities:

```tsx
// OLD - Using DataTable directly
import { DataTable } from "../../components/ui/DataTable";

<DataTable
  entityType={ENTITY_TYPES.POSTS}
  columns={columns}
  // ... props
/>;
```

### Updated Code

Change the import and component name:

```tsx
// NEW - Using EntityDataTable
import { EntityDataTable } from "../../components/ui/EntityDataTable";

<EntityDataTable
  entityType={ENTITY_TYPES.POSTS}
  columns={columns}
  // ... same props
/>;
```

## Benefits

1. **Separation of Concerns**: Data fetching logic is separated from UI logic
2. **Reusability**: Generic `DataTable` can be used for any data source
3. **Maintainability**: Easier to test and modify individual components
4. **Flexibility**: Custom data sources can use the table UI without entity constraints
5. **Backward Compatibility**: Existing entity usage remains the same with `EntityDataTable`

## Files Modified

1. `apps/client/src/components/ui/DataTable.tsx` - Refactored to be generic
2. `apps/client/src/components/ui/EntityDataTable.tsx` - New entity wrapper
3. `apps/client/src/pages/posts/PostsListPage.tsx` - Updated to use EntityDataTable
4. `apps/client/src/pages/users/UsersListPage.tsx` - Updated to use EntityDataTable
5. `apps/client/src/pages/users/UserDetailsPage.tsx` - Updated to use EntityDataTable
