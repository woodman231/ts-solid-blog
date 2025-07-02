# DataTable Component

A reusable, configurable table component built with TanStack Table that supports server-side sorting, filtering, and pagination.

## Features

- 🔄 **Server-side operations**: Sorting, pagination, and filtering are handled server-side for optimal performance
- 🔍 **Global search**: Built-in debounced search across multiple fields
- 📊 **Flexible sorting**: Click column headers to sort, with visual indicators
- 📄 **Pagination**: Configurable page sizes with navigation controls
- 🎨 **Responsive design**: Clean, modern UI with Tailwind CSS
- ⚡ **Type-safe**: Full TypeScript support with generic types
- 🔧 **Highly configurable**: Customize columns, behaviors, and appearance

## Usage

### Basic Example

```tsx
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../components/ui/DataTable";
import { User } from "@blog/shared/src/models/User";

export function UsersListPage() {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "displayName",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.displayName}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <DataTable
      entityType="users"
      columns={columns}
      title="Users"
      enableGlobalFilter={true}
      globalFilterPlaceholder="Search users..."
    />
  );
}
```

### Advanced Example with Actions

```tsx
const columns: ColumnDef<PostWithAuthor>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        to="/posts/$postId"
        params={{ postId: row.original.id }}
        className="text-primary-600 hover:text-primary-800 font-medium"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    id: "author.displayName", // Custom ID for nested field sorting
    accessorFn: (row) => row.author.displayName,
    header: "Author",
    cell: ({ row }) => (
      <Link
        to="/users/$userId"
        params={{ userId: row.original.author.id }}
        className="text-primary-600 hover:text-primary-800"
      >
        {row.original.author.displayName}
      </Link>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleEdit(row.original.id)}
          className="text-primary-600 hover:text-primary-800 text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(row.original.id)}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Delete
        </button>
      </div>
    ),
  },
];

return (
  <DataTable
    entityType="posts"
    columns={columns}
    initialSorting={[{ id: "createdAt", desc: true }]}
    enableGlobalFilter={true}
    globalFilterPlaceholder="Search posts by title, description, or author..."
    title="Posts"
    createButton={
      <Link to="/posts/create" className="btn btn-primary">
        Create Post
      </Link>
    }
    defaultPageSize={20}
    onDataChange={({ refetch }) => {
      // Access refetch function for external actions
      setRefetchFn(() => refetch);
    }}
  />
);
```

## Props

| Prop                      | Type                  | Default                             | Description                                            |
| ------------------------- | --------------------- | ----------------------------------- | ------------------------------------------------------ |
| `entityType`              | `'posts' \| 'users'`  | Required                            | The type of entity to fetch from the server            |
| `columns`                 | `ColumnDef<T>[]`      | Required                            | TanStack Table column definitions                      |
| `initialSorting`          | `SortingState`        | `[{ id: 'createdAt', desc: true }]` | Initial sorting configuration                          |
| `enableGlobalFilter`      | `boolean`             | `false`                             | Enable the global search functionality                 |
| `globalFilterPlaceholder` | `string`              | `'Search...'`                       | Placeholder text for the search input                  |
| `title`                   | `string`              | Required                            | Title displayed at the top of the table                |
| `createButton`            | `React.ReactNode`     | `undefined`                         | Optional button displayed in the header                |
| `defaultPageSize`         | `number`              | `20`                                | Default number of rows per page                        |
| `staleTime`               | `number`              | `30000`                             | How long data stays fresh (in milliseconds)            |
| `refetchOnMount`          | `boolean \| 'always'` | `'always'`                          | When to refetch data on component mount                |
| `onDataChange`            | `function`            | `undefined`                         | Callback providing access to data and refetch function |

## Column Configuration

### Nested Field Sorting

For server-side sorting of nested fields (like `author.displayName`), use a custom `id`:

```tsx
{
    id: 'author.displayName', // Maps to server-side sort key
    accessorFn: (row) => row.author.displayName,
    header: 'Author',
    cell: ({ row }) => row.original.author.displayName,
}
```

### Action Columns

For action buttons that don't correspond to data fields:

```tsx
{
    id: 'actions',
    header: '',
    cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <button onClick={() => handleAction(row.original)}>
                Action
            </button>
        </div>
    ),
}
```

## Server-Side Requirements

The DataTable component expects the server to support:

### Sorting

```typescript
// Server receives sort object like:
{
    "createdAt": "desc",
    "author.displayName": "asc"
}
```

### Global Search

```typescript
// Server receives filter object like:
{
    "globalSearch": "search term"
}
```

### Response Format

```typescript
{
    data: {
        [entityType]: T[],
    },
    total: number,
    filteredTotal: number,
    page: number,
    limit: number,
    totalPages: number,
}
```

## Styling

The component uses Tailwind CSS classes. Key CSS classes used:

- `.btn`, `.btn-primary`, `.btn-secondary` - Button styles
- `.text-primary-600`, `.hover:text-primary-800` - Link colors
- Table styling follows standard Tailwind table patterns

## Real-world Examples

The DataTable is currently used in:

- **PostsListPage**: Displays blog posts with author information, supports editing/deletion for post authors
- **UsersListPage**: Displays user directory with search functionality

Both implementations demonstrate different features:

- Posts: Complex nested sorting, custom actions, user permissions
- Users: Simple structure, basic search

## Performance Considerations

- **Debounced search**: 300ms delay reduces API calls during typing
- **Server-side operations**: Only current page data is transferred
- **Stale time**: Configurable caching reduces unnecessary requests
- **Optimistic updates**: Use `onDataChange` callback to trigger refetch after mutations

## Extensibility

The component can be extended to support:

- Column-specific filters
- Export functionality
- Row selection
- Bulk actions
- Custom cell renderers
- More entity types

## Dependencies

- `@tanstack/react-table` - Table functionality
- `@tanstack/react-query` - Data fetching and caching
- `@heroicons/react` - Search icon
- Socket.io client - Real-time communication
- Tailwind CSS - Styling
