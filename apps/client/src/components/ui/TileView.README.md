# TileView Component

The `TileView` component is a flexible, reusable component for displaying data in a tile/card format with features like global search, filtering, pagination, and customizable actions. It's designed to complement the existing `DataTable` component for scenarios where a visual card-based layout is more appropriate than a tabular format.

## Features

- **Customizable Tile Rendering**: Define how each item should be rendered using a tile renderer function
- **Global Search**: Built-in search functionality across all data
- **Filtering**: Expandable filter panel with support for text and select filters
- **Pagination**: Server-side pagination with configurable page sizes
- **Actions**: Configurable CRUD actions per tile with conditional visibility
- **Loading States**: Skeleton loading with customizable row count
- **Error Handling**: User-friendly error display with retry functionality
- **Responsive Design**: Mobile-first responsive grid layout

## Basic Usage

```tsx
import { TileView, TileRenderer } from "../../components/ui/TileView";
import { ENTITY_TYPES } from "@blog/shared/src/index";

export function MyTileViewPage() {
  const tileRenderer: TileRenderer<MyDataType> = (item) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium">{item.title}</h3>
      <p className="text-gray-600">{item.description}</p>
    </div>
  );

  return (
    <TileView
      entityType={ENTITY_TYPES.MY_ENTITY}
      tileRenderer={tileRenderer}
      title="My Data"
      enableGlobalFilter={true}
      globalFilterPlaceholder="Search my data..."
    />
  );
}
```

## Props

### Core Props

- `entityType`: The type of entity to fetch (from `ENTITY_TYPES`)
- `tileRenderer`: Function that defines how each tile should be rendered
- `title`: Page title displayed in the header

### Search and Filtering

- `enableGlobalFilter`: Enable global search functionality (default: `true`)
- `globalFilterPlaceholder`: Placeholder text for search input
- `enableFilters`: Enable expandable filter panel (default: `false`)
- `filterConfigs`: Array of filter configurations for custom filters

### Actions

- `actions`: Array of action configurations for CRUD operations
- `createButton`: Optional React node for create button in header

### Pagination

- `defaultPageSize`: Number of items per page (default: `20`)
- `initialSorting`: Initial sorting configuration

### Styling

- `tileContainerClassName`: CSS classes for the tile container grid
- `loadingRows`: Number of skeleton tiles to show while loading
- `emptyStateMessage`: Custom message when no data is found

### Advanced

- `staleTime`: Query cache stale time in milliseconds
- `refetchOnMount`: When to refetch data on mount
- `onDataChange`: Callback function for data changes

## Filter Configuration

```tsx
const filterConfigs: TileFilterConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  {
    key: "category",
    label: "Category",
    type: "text",
    placeholder: "Search by category...",
  },
];
```

## Action Configuration

```tsx
const actions: TileActionConfig[] = [
  {
    label: "Edit",
    variant: "secondary",
    icon: PencilIcon,
    onClick: (item) => navigate(`/edit/${item.id}`),
    show: (item) => item.canEdit, // Optional conditional visibility
  },
  {
    label: "Delete",
    variant: "danger",
    icon: TrashIcon,
    onClick: (item) => setItemToDelete(item.id),
    show: (item) => item.canDelete,
  },
];
```

## Tile Renderer Examples

### Basic Card

```tsx
const tileRenderer: TileRenderer<Post> = (post) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-medium mb-2">{post.title}</h3>
    <p className="text-gray-600 mb-4">{post.description}</p>
    <div className="text-sm text-gray-500">
      {new Date(post.createdAt).toLocaleDateString()}
    </div>
  </div>
);
```

### Card with Actions

```tsx
const tileRenderer: TileRenderer<Post> = (post, actionButtons) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-medium mb-2">{post.title}</h3>
    <p className="text-gray-600 mb-4">{post.description}</p>
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-500">
        {new Date(post.createdAt).toLocaleDateString()}
      </div>
      {actionButtons}
    </div>
  </div>
);
```

### User Profile Card

```tsx
const tileRenderer: TileRenderer<User> = (user) => (
  <div className="bg-white rounded-lg shadow p-6 text-center">
    <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
      <UserIcon className="w-8 h-8 text-primary-600" />
    </div>
    <h3 className="text-lg font-medium mb-2">{user.displayName}</h3>
    <p className="text-gray-600 text-sm mb-4">{user.email}</p>
    <Link
      to={`/users/${user.id}`}
      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
    >
      View Profile →
    </Link>
  </div>
);
```

## Grid Layout Options

### Standard Grid

```tsx
tileContainerClassName = "grid gap-6 md:grid-cols-2 lg:grid-cols-3";
```

### Compact Grid

```tsx
tileContainerClassName =
  "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
```

### Large Cards

```tsx
tileContainerClassName = "grid gap-8 md:grid-cols-2";
```

## Complete Example

```tsx
import { useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  TileView,
  TileActionConfig,
  TileRenderer,
  TileFilterConfig,
} from "../../components/ui/TileView";
import { ENTITY_TYPES } from "@blog/shared/src/index";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export function PostsTileViewPage() {
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const filterConfigs: TileFilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "published", label: "Published" },
        { value: "draft", label: "Draft" },
      ],
    },
  ];

  const actions: TileActionConfig[] = [
    {
      label: "Edit",
      variant: "secondary",
      icon: PencilIcon,
      onClick: (post) => navigate(`/posts/${post.id}/edit`),
    },
    {
      label: "Delete",
      variant: "danger",
      icon: TrashIcon,
      onClick: (post) => setItemToDelete(post.id),
    },
  ];

  const tileRenderer: TileRenderer<Post> = (post, actionButtons) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-2">
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <p className="text-gray-600 mb-4">{post.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
        {actionButtons}
      </div>
    </div>
  );

  return (
    <TileView
      entityType={ENTITY_TYPES.POSTS}
      tileRenderer={tileRenderer}
      title="Posts"
      enableGlobalFilter={true}
      globalFilterPlaceholder="Search posts..."
      enableFilters={true}
      filterConfigs={filterConfigs}
      actions={actions}
      createButton={
        <Link to="/posts/create" className="btn btn-primary">
          Create Post
        </Link>
      }
      defaultPageSize={12}
      emptyStateMessage="No posts found. Create your first post!"
      tileContainerClassName="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    />
  );
}
```

## Comparison with DataTable

| Feature           | TileView                          | DataTable                   |
| ----------------- | --------------------------------- | --------------------------- |
| **Layout**        | Card/tile based                   | Tabular                     |
| **Best for**      | Rich content, images, visual data | Dense data, many columns    |
| **Filtering**     | Simple expandable panel           | Advanced per-column filters |
| **Actions**       | Integrated into tiles             | Separate actions column     |
| **Responsive**    | Mobile-first grid                 | Horizontal scrolling        |
| **Global Search** | ✅                                | ✅                          |
| **Pagination**    | ✅                                | ✅                          |
| **Sorting**       | Limited (initial only)            | Full interactive sorting    |

## Tips

1. **Use appropriate tile sizes**: Choose grid classes that work well with your content
2. **Keep tiles consistent**: Maintain similar heights and structure across tiles
3. **Limit actions**: Too many actions can clutter the tile interface
4. **Consider loading states**: Use appropriate `loadingRows` for better UX
5. **Test responsiveness**: Ensure tiles work well on all screen sizes

## TypeScript Support

The component is fully typed with TypeScript generics:

```tsx
interface MyData {
  id: string;
  title: string;
  description: string;
}

const tileRenderer: TileRenderer<MyData> = (item) => (
  // TypeScript will provide full type safety for 'item'
  <div>{item.title}</div>
);
```
