# DataTable and TileView Architecture Refactoring

## Overview

Both the DataTable and TileView components have been refactored to separate concerns between generic UI functionality and entity-specific data fetching. This creates a more flexible and reusable architecture for both table and tile-based data displays.

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

## TileView Architecture

### 3. `TileView<T>` - Generic Tile Component

**File:** `apps/client/src/components/ui/TileView.tsx`

The new `TileView` is a pure UI component that:

- Handles tile rendering, sorting, filtering, and pagination UI
- Receives data and handlers as props
- Does not know about entities or data fetching
- Can be used for any tile-based data display

#### Props Interface:

```typescript
interface TileViewProps<T> {
  data: T[];
  tileRenderer: TileRenderer<T>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  debouncedGlobalFilter: string;
  columnFilters: Record<string, FilterValue>;
  onColumnFilterChange: (columnId: string, filter: FilterValue | null) => void;
  onClearAllFilters: () => void;
  sorting: Record<string, "asc" | "desc">;
  onSortingChange: (columnId: string) => void;
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
  showFilters: boolean;
  onShowFiltersToggle: () => void;
  activeFiltersCount: number;
  enableGlobalFilter?: boolean;
  globalFilterPlaceholder?: string;
  enableFilters?: boolean;
  filterConfigs?: Record<string, ColumnFilterConfig>;
  enableSorting?: boolean;
  sortConfigs?: TileSortConfig[];
  title: string;
  createButton?: React.ReactNode;
  actions?: TileActionConfig[];
  emptyStateMessage?: string;
  tileContainerClassName?: string;
  loadingRows?: number;
  entityType?: string; // For display purposes
}
```

### 4. `EntityTileView<T>` - Entity-Aware Wrapper

**File:** `apps/client/src/components/ui/EntityTileView.tsx`

The `EntityTileView` is a wrapper component that:

- Handles entity-specific data fetching via socket requests
- Manages state for sorting, filtering, and pagination
- Provides the original API for entity tile views
- Uses the generic `TileView` for rendering

#### Props Interface:

```typescript
interface EntityTileViewProps<T> {
  entityType: EntityType;
  tileRenderer: TileRenderer<T>;
  initialSorting?: Record<string, "asc" | "desc">;
  enableGlobalFilter?: boolean;
  globalFilterPlaceholder?: string;
  enableFilters?: boolean;
  filterConfigs?: Record<string, ColumnFilterConfig>;
  enableSorting?: boolean;
  sortConfigs?: TileSortConfig[];
  title: string;
  createButton?: React.ReactNode;
  actions?: TileActionConfig[];
  defaultPageSize?: number;
  staleTime?: number;
  refetchOnMount?: boolean | "always";
  onDataChange?: (data: any) => void;
  emptyStateMessage?: string;
  tileContainerClassName?: string;
  loadingRows?: number;
}
```

## TileView Usage Examples

### For Entity Data (Recommended)

Use `EntityTileView` for fetching entities from the server:

```tsx
import {
  EntityTileView,
  TileActionConfig,
  TileRenderer,
} from "../../components/ui/EntityTileView";
import { ENTITY_TYPES } from "@blog/shared/src/index";

export function PostsTileViewPage() {
  const tileRenderer: TileRenderer<PostWithAuthor> = (post, actionButtons) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium mb-2">{post.title}</h3>
      <p className="text-gray-600 mb-4">{post.description}</p>
      {actionButtons}
    </div>
  );

  const actions: TileActionConfig[] = [
    {
      label: "Edit",
      variant: "secondary",
      onClick: (post) => navigate(`/posts/${post.id}/edit`),
      show: (post) => post.authorId === currentUserId,
    },
  ];

  return (
    <EntityTileView
      entityType={ENTITY_TYPES.POSTS}
      tileRenderer={tileRenderer}
      enableGlobalFilter={true}
      enableFilters={true}
      filterConfigs={filterConfigs}
      title="Posts"
      actions={actions}
      // ... other props
    />
  );
}
```

### For Custom Data (Advanced)

Use the generic `TileView` when you have custom data sources:

```tsx
import { TileView } from "../../components/ui/TileView";
import { useState, useCallback } from "react";

export function CustomTileViewPage() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState({});
  // ... other state

  const handleGlobalFilterChange = useCallback((value) => {
    setGlobalFilter(value);
    // Custom filtering logic
  }, []);

  const handleSortingChange = useCallback((columnId) => {
    setSorting((prev) => ({
      [columnId]: prev[columnId] === "asc" ? "desc" : "asc",
    }));
    // Custom sorting logic
  }, []);

  // ... other handlers

  return (
    <TileView
      data={data}
      tileRenderer={tileRenderer}
      globalFilter={globalFilter}
      onGlobalFilterChange={handleGlobalFilterChange}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      // ... all required props
    />
  );
}
```

## Migration Guide

### DataTable Migration

#### Existing Code

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

#### Updated Code

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

### TileView Migration

#### Existing Code

If you have existing code using the old `TileView` for entities:

```tsx
// OLD - Using TileView directly
import { TileView } from "../../components/ui/TileView";

<TileView
  entityType={ENTITY_TYPES.POSTS}
  tileRenderer={tileRenderer}
  // ... props
/>;
```

#### Updated Code

Change the import and component name:

```tsx
// NEW - Using EntityTileView
import { EntityTileView } from "../../components/ui/EntityTileView";

<EntityTileView
  entityType={ENTITY_TYPES.POSTS}
  tileRenderer={tileRenderer}
  // ... same props
/>;
```

## Benefits

1. **Separation of Concerns**: Data fetching logic is separated from UI logic for both table and tile views
2. **Reusability**: Generic `DataTable` and `TileView` can be used for any data source
3. **Maintainability**: Easier to test and modify individual components
4. **Flexibility**: Custom data sources can use the UI components without entity constraints
5. **Backward Compatibility**: Existing entity usage remains the same with `EntityDataTable` and `EntityTileView`
6. **Consistency**: Both table and tile views follow the same architectural pattern

## Files Modified

1. `apps/client/src/components/ui/DataTable.tsx` - Refactored to be generic
2. `apps/client/src/components/ui/EntityDataTable.tsx` - New entity wrapper for tables
3. `apps/client/src/components/ui/TileView.tsx` - Refactored to be generic
4. `apps/client/src/components/ui/EntityTileView.tsx` - New entity wrapper for tiles
5. `apps/client/src/pages/posts/PostsListPage.tsx` - Updated to use EntityDataTable
6. `apps/client/src/pages/posts/PostsTileViewPage.tsx` - Updated to use EntityTileView
7. `apps/client/src/pages/users/UsersListPage.tsx` - Updated to use EntityDataTable
8. `apps/client/src/pages/users/UsersTileViewPage.tsx` - Updated to use EntityTileView
9. `apps/client/src/pages/users/UserDetailsPage.tsx` - Updated to use EntityDataTable
