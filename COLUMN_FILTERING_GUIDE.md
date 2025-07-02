# Column Filtering Feature Guide

The DataTable component now supports advanced column filtering with different filter types for different data types. This guide explains how to configure and use column filters.

## Overview

Column filtering allows users to apply specific filters to individual columns, providing more granular control over data display. The system supports:

- **Text Filters**: Contains, starts with, ends with, equals, not equals
- **Number Filters**: Equals, not equals, greater than, less than, greater/less than or equal, between
- **Date Filters**: Equals, before, after, between
- **Lookup Filters**: In list, not in list (with selectable options)
- **Boolean Filters**: Yes/No/Any

## Configuration

### Basic Setup

To enable column filtering, set `enableColumnFilters={true}` and provide `columnFilterConfigs`:

```tsx
import { DataTable, ColumnFilterConfig } from "../../components/ui/DataTable";

const columnFilterConfigs: Record<string, ColumnFilterConfig> = {
  columnId: {
    type: "text", // or 'number', 'date', 'lookup', 'boolean'
    operators: ["contains", "startsWith", "endsWith"],
    placeholder: "Filter by...",
  },
};

<DataTable
  enableColumnFilters={true}
  columnFilterConfigs={columnFilterConfigs}
  // ... other props
/>;
```

### Filter Type Configurations

#### Text Filters

```tsx
title: {
    type: 'text',
    operators: ['contains', 'startsWith', 'endsWith', 'equals', 'notEquals'],
    placeholder: 'Filter by title...',
}
```

**Available operators:**

- `contains` - Text contains the value (case-insensitive)
- `startsWith` - Text starts with the value
- `endsWith` - Text ends with the value
- `equals` - Text exactly matches the value
- `notEquals` - Text does not match the value

#### Number Filters

```tsx
price: {
    type: 'number',
    operators: ['equals', 'notEquals', 'gt', 'lt', 'gte', 'lte', 'between'],
    placeholder: 'Enter amount...',
}
```

**Available operators:**

- `equals` - Number equals the value
- `notEquals` - Number does not equal the value
- `gt` - Greater than
- `lt` - Less than
- `gte` - Greater than or equal
- `lte` - Less than or equal
- `between` - Between two values (shows two input fields)

#### Date Filters

```tsx
createdAt: {
    type: 'date',
    operators: ['equals', 'before', 'after', 'between'],
}
```

**Available operators:**

- `equals` - Date equals the selected date
- `before` - Date is before the selected date
- `after` - Date is after the selected date
- `between` - Date is between two selected dates

#### Lookup Filters

```tsx
'author.displayName': {
    type: 'lookup',
    operators: ['in', 'notIn'],
    lookupOptions: [
        { value: 'user1', label: 'John Doe' },
        { value: 'user2', label: 'Jane Smith' },
        { value: 'user3', label: 'Bob Johnson' },
    ],
    lookupSearchable: true, // Optional: enable search within options
}
```

**Available operators:**

- `in` - Value is in the selected list
- `notIn` - Value is not in the selected list

#### Boolean Filters

```tsx
isActive: {
    type: 'boolean',
    operators: ['equals'],
}
```

Shows a dropdown with Yes/No/Any options.

## Real-World Examples

### Posts Table with Advanced Filtering

```tsx
const columnFilterConfigs: Record<string, ColumnFilterConfig> = {
  title: {
    type: "text",
    operators: ["contains", "startsWith", "endsWith", "equals"],
    placeholder: "Filter by title...",
  },
  description: {
    type: "text",
    operators: ["contains", "startsWith", "endsWith"],
    placeholder: "Filter by description...",
  },
  "author.displayName": {
    type: "lookup",
    operators: ["in", "notIn"],
    lookupOptions: [
      { value: "user1", label: "John Doe" },
      { value: "user2", label: "Jane Smith" },
      { value: "user3", label: "Bob Johnson" },
    ],
    lookupSearchable: true,
  },
  createdAt: {
    type: "date",
    operators: ["equals", "before", "after", "between"],
  },
};
```

### Users Table with Filtering

```tsx
const columnFilterConfigs: Record<string, ColumnFilterConfig> = {
  displayName: {
    type: "text",
    operators: ["contains", "startsWith", "endsWith", "equals"],
    placeholder: "Filter by name...",
  },
  email: {
    type: "text",
    operators: ["contains", "startsWith", "endsWith", "equals"],
    placeholder: "Filter by email...",
  },
  createdAt: {
    type: "date",
    operators: ["equals", "before", "after", "between"],
  },
};
```

## User Interface

### Filter Button

Each filterable column displays a filter button in the header:

- Gray when no filter is applied
- Blue with a "1" badge when a filter is active
- Click to open the filter dropdown

### Filter Dropdown

The filter dropdown contains:

1. **Filter Type Selector** - Choose the operator (contains, equals, etc.)
2. **Value Input(s)** - Input field(s) appropriate to the data type
3. **Action Buttons** - Clear, Cancel, Apply

### Active Filters

- Active filters are visually indicated in the header
- "Clear all column filters" button appears when any column filters are active
- Filter count is shown in the table summary

## Server-Side Implementation

### Filter Format

Column filters are sent to the server in the format:

```
{
    "title_contains": "search term",
    "createdAt_between": "2024-01-01",
    "createdAt_between_2": "2024-12-31",
    "author.displayName_in": ["user1", "user2"]
}
```

### Parser Implementation

The server uses `parseColumnFilters()` to convert client filters to Prisma queries:

```typescript
import { parseColumnFilters } from "../utils/filterParser";

// In repository findAll method:
if (options?.filter) {
  const parsedFilters = parseColumnFilters(options.filter);
  where = parsedFilters.where;
  globalSearch = parsedFilters.globalSearch;

  // Combine with global search if present
  if (globalSearch) {
    // ... handle global search
  }
}
```

### Supported Field Mapping

The parser maps client column IDs to database fields:

- `title` → `title`
- `description` → `description`
- `author.displayName` → `author.displayName`
- `createdAt` → `createdAt`
- etc.

## Performance Considerations

### Debouncing

- Filter changes are debounced to reduce server requests
- Global search and column filters use the same debounce mechanism

### Efficient Queries

- Column filters are combined efficiently with sorting and pagination
- Multiple filters on the same column are merged (e.g., between operations)
- Global search and column filters can be combined with AND logic

### Indexing Recommendations

For optimal performance, ensure database indexes on:

- Filtered text fields (with appropriate collation for case-insensitive search)
- Date fields used in range queries
- Foreign key fields used in lookup filters

## Best Practices

### Column Selection

- Enable filters on columns users frequently search/filter
- Consider data cardinality when choosing filter types
- Use lookup filters for columns with limited, known values

### Lookup Options

- Fetch lookup options from the server for dynamic data
- Implement search within lookup options for large lists
- Cache lookup options to avoid repeated server requests

### User Experience

- Provide meaningful placeholder text
- Use appropriate filter operators for each data type
- Show clear visual feedback for active filters

### Server Performance

- Implement proper database indexing
- Consider pagination for lookup options
- Use efficient query patterns (avoid N+1 queries)

## Future Enhancements

Potential improvements to the column filtering system:

### Enhanced Filters

- **Multi-select for text fields** - Select from existing values
- **Numeric ranges with sliders** - Visual range selection
- **Fuzzy text search** - Approximate matching
- **Regular expression support** - Advanced text patterns

### User Experience

- **Filter presets** - Save and load common filter combinations
- **Filter history** - Recently used filters
- **Quick filters** - One-click common filters
- **Bulk filter actions** - Apply/clear multiple filters at once

### Performance

- **Client-side filtering** - For small datasets
- **Filter caching** - Cache filter results
- **Incremental loading** - Load data as user scrolls
- **Background refresh** - Update data without blocking UI

## Troubleshooting

### Common Issues

1. **Filter not working**
   - Verify column ID matches between client and server
   - Check field mapping in `filterParser.ts`
   - Ensure database field exists and is indexed

2. **Performance issues**
   - Add database indexes for filtered columns
   - Consider limiting filter options for large datasets
   - Implement server-side pagination for lookup options

3. **TypeScript errors**
   - Ensure column filter configs match column definitions
   - Verify filter types are correctly imported
   - Check that lookup options have correct structure

4. **UI issues**
   - Verify filter button appears in column header
   - Check that filter dropdown renders correctly
   - Ensure filter states are properly managed

The column filtering system provides a powerful, flexible way to enhance table functionality while maintaining good performance and user experience.
