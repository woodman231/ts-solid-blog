import { ColumnDef } from '@tanstack/react-table';
import { Link } from '@tanstack/react-router';
import { User } from '@blog/shared/src/models/User';
import { DataTable, ColumnFilterConfig } from '../../components/ui/DataTable';

export function UsersListPage() {
    // Configure column filters
    const columnFilterConfigs: Record<string, ColumnFilterConfig> = {
        displayName: {
            type: 'text',
            operators: ['contains', 'startsWith', 'endsWith', 'equals'],
            placeholder: 'Filter by name...',
        },
        email: {
            type: 'text',
            operators: ['contains', 'startsWith', 'endsWith', 'equals'],
            placeholder: 'Filter by email...',
        },
        createdAt: {
            type: 'date',
            operators: ['equals', 'before', 'after', 'between'],
        },
    };
    // Define columns for the users table
    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'displayName',
            header: 'Name',
            cell: ({ row }) => (
                <Link
                    to="/users/$userId"
                    params={{ userId: row.original.id }}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                >
                    {row.original.displayName}
                </Link>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => (
                <span className="text-gray-900">
                    {row.original.email}
                </span>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: 'Joined',
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
        },
    ];

    return (
        <DataTable
            entityType="users"
            columns={columns}
            initialSorting={[{ id: 'createdAt', desc: true }]}
            enableGlobalFilter={true}
            globalFilterPlaceholder="Search users by name or email..."
            enableColumnFilters={true}
            columnFilterConfigs={columnFilterConfigs}
            title="Users"
            defaultPageSize={20}
            staleTime={1000 * 60} // 1 minute - users change less frequently
            refetchOnMount="always"
        />
    );
}
