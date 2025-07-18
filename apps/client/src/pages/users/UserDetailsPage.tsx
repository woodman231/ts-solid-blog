import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useSocketStore } from '../../lib/socket';
import { Link } from '@tanstack/react-router';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EntityDataTable, ColumnFilterConfig } from '../../components/ui/EntityDataTable';
import { User } from '@blog/shared/src/models/User';
import { PostWithAuthor } from '@blog/shared/src/models/Post';
import { LoadPageRequest, EntityDataResponse, ENTITY_TYPES } from '@blog/shared/src/index';
import { ColumnDef } from '@tanstack/react-table';

export function UserDetailsPage() {
    const { userId } = useParams({ from: '/layout/users/$userId' });
    const { sendRequest } = useSocketStore();

    // Configure column filters with immutable filter for this user's posts
    const columnFilterConfigs: Record<string, ColumnFilterConfig> = {
        title: {
            type: 'text',
            operators: ['contains', 'startsWith', 'endsWith', 'equals'],
            placeholder: 'Filter by title...',
        },
        description: {
            type: 'text',
            operators: ['contains', 'startsWith', 'endsWith'],
            placeholder: 'Filter by description...',
        },
        'authorId': {
            type: 'lookup',
            operators: ['in'],
            defaultValue: {
                operator: 'in',
                value: [userId], // Filter to only this user's posts
            },
            immutable: true, // User cannot change this filter
        },
        createdAt: {
            type: 'date',
            operators: ['equals', 'before', 'after', 'between'],
        },
    };

    // Configure column sort mapping
    const columnSortMapping: Record<string, string> = {
        'title': 'title',
        'description': 'description',
        'authorId': 'author.displayName',
        'createdAt': 'createdAt',
        'updatedAt': 'updatedAt',
    };

    // Define columns for the posts table
    const columns: ColumnDef<PostWithAuthor>[] = [
        {
            accessorKey: 'title',
            header: 'Title',
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
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <div className="truncate max-w-xs" title={row.original.description}>
                    {row.original.description}
                </div>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: 'Posted',
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <Link
                    to="/posts/$postId"
                    params={{ postId: row.original.id }}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                    View →
                </Link>
            ),
        },
    ];

    // Fetch user data
    const { data, isLoading, error } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const request: LoadPageRequest = {
                requestType: 'loadPage',
                requestParams: {
                    pageName: 'userDetails',
                    userId,
                },
            };

            const response = await sendRequest<LoadPageRequest, EntityDataResponse>(request);
            return {
                user: response.responseParams.entities.data.user?.[0] as User | undefined,
            };
        },
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error || !data?.user) {
        return (
            <div className="text-red-600">
                {error instanceof Error
                    ? `Error loading user: ${error.message}`
                    : 'User not found'}
            </div>
        );
    }

    const { user } = data;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold">{user.displayName}'s Profile</h1>
                <Link
                    to="/users"
                    className="btn btn-secondary"
                >
                    Back to Users
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details.</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Full name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.displayName}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Email address</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Member since</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <EntityDataTable
                entityType={ENTITY_TYPES.POSTS}
                columns={columns}
                initialSorting={[{ id: 'createdAt', desc: true }]}
                enableGlobalFilter={true}
                globalFilterPlaceholder={`Search ${user.displayName}'s posts...`}
                enableColumnFilters={true}
                columnFilterConfigs={columnFilterConfigs}
                columnSortMapping={columnSortMapping}
                title={`Posts by ${user.displayName}`}
                defaultPageSize={10}
                staleTime={1000 * 30}
                refetchOnMount="always"
            />
        </div>
    );
}