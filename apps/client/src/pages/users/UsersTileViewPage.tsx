import { Link } from '@tanstack/react-router';
import { User } from '@blog/shared/src/models/User';
import { EntityTileView, TileRenderer, TileSortConfig } from '../../components/ui/EntityTileView';
import { ColumnFilterConfig } from '../../components/ui/ColumnFilter';
import { ENTITY_TYPES } from '@blog/shared/src/index';
import { UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export function UsersTileViewPage() {
    // Configure sorting options
    const sortConfigs: TileSortConfig[] = [
        {
            key: 'createdAt',
            label: 'Join Date',
            serverField: 'createdAt',
        },
        {
            key: 'displayName',
            label: 'Name',
            serverField: 'displayName',
        },
        {
            key: 'email',
            label: 'Email',
            serverField: 'email',
        },
    ];

    // Configure filters for user tiles
    const filterConfigs: Record<string, ColumnFilterConfig> = {
        role: {
            type: 'lookup',
            operators: ['in'],
            lookupOptions: [
                { value: 'admin', label: 'Admin' },
                { value: 'moderator', label: 'Moderator' },
                { value: 'user', label: 'User' },
            ],
            label: 'Role',
            placeholder: 'Select roles...',
        },
        displayName: {
            type: 'text',
            operators: ['contains', 'startsWith', 'endsWith'],
            label: 'Name',
            placeholder: 'Filter by name...',
        },
        email: {
            type: 'text',
            operators: ['contains', 'startsWith', 'endsWith'],
            label: 'Email',
            placeholder: 'Filter by email...',
        },
        createdAt: {
            type: 'date',
            operators: ['equals', 'before', 'after', 'between'],
            label: 'Member Since',
        },
    };

    // Tile renderer function for users
    const tileRenderer: TileRenderer<User> = (user) => (
        <div key={user.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
                {/* User Avatar/Icon */}
                <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4">
                    <UserIcon className="w-8 h-8 text-primary-600" />
                </div>

                {/* User Name */}
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                    <Link
                        to="/users/$userId"
                        params={{ userId: user.id }}
                        className="hover:text-primary-600 transition-colors"
                    >
                        {user.displayName}
                    </Link>
                </h3>

                {/* User Email */}
                <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                    <EnvelopeIcon className="w-4 h-4 mr-1" />
                    {user.email}
                </div>

                {/* Member Since */}
                <div className="text-center text-sm text-gray-500 mb-4">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                </div>

                {/* View Profile Link */}
                <div className="border-t border-gray-200 pt-4 text-center">
                    <Link
                        to="/users/$userId"
                        params={{ userId: user.id }}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center"
                    >
                        View Profile →
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <EntityTileView
            entityType={ENTITY_TYPES.USERS}
            tileRenderer={tileRenderer}
            initialSorting={{ createdAt: 'desc' }}
            enableGlobalFilter={true}
            globalFilterPlaceholder="Search users by name or email..."
            enableFilters={true}
            filterConfigs={filterConfigs}
            enableSorting={true}
            sortConfigs={sortConfigs}
            title="Users"
            defaultPageSize={15}
            staleTime={1000 * 60} // 1 minute
            emptyStateMessage="No users found."
            tileContainerClassName="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />
    );
}
