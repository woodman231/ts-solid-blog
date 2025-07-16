import { useState, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { ColumnDef } from '@tanstack/react-table';
import { PostWithAuthor } from '@blog/shared/src/models/Post';
import { DataTable, ColumnFilterConfig } from '../../components/ui/DataTable';
import { DeletePostDialog } from '../../components/posts/DeletePostDialog';
import { useAuthorSearch } from '../../hooks/useAuthorSearch';
import { useAuthContext } from '../../contexts/AuthContext';
import { ENTITY_TYPES } from '@blog/shared/src/index';

export function PostsListPage() {
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const { currentUserId } = useAuthContext();

    // Configure column filters
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
            operators: ['in', 'notIn'],
            useDynamicLookup: true,
            dynamicLookupHook: useAuthorSearch,
            lookupSearchable: true,
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
        'authorId': 'author.displayName', // Map authorId column to nested author.displayName for sorting
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
            id: 'authorId', // Use authorId for filtering
            accessorFn: (row) => row.author.displayName,
            header: 'Author',
            cell: ({ row }) => {
                const authorId = row.original.author.id;
                return (
                    <Link
                        to="/users/$userId"
                        params={{ userId: authorId }}
                        className="text-primary-600 hover:text-primary-800"
                    >
                        {row.original.author.displayName}
                    </Link>
                );
            },
        },
        {
            accessorKey: 'createdAt',
            header: 'Created',
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const post = row.original;
                const isAuthor = post.authorId === currentUserId;

                if (!isAuthor) {
                    return null;
                }

                return (
                    <div className="flex items-center gap-2">
                        <Link
                            to="/posts/$postId/edit"
                            params={{ postId: post.id }}
                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={() => setPostToDelete(post.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Delete
                        </button>
                    </div>
                );
            },
        },
    ];

    // Handle successful post deletion
    const handleDeleteSuccess = useCallback(() => {
        setPostToDelete(null);
        // The DataTable will automatically refetch due to its query invalidation
    }, []);

    return (
        <>
            <DataTable
                entityType={ENTITY_TYPES.POSTS}
                columns={columns}
                initialSorting={[{ id: 'createdAt', desc: true }]}
                enableGlobalFilter={true}
                globalFilterPlaceholder="Search posts by title, description, content, or author..."
                enableColumnFilters={true}
                columnFilterConfigs={columnFilterConfigs}
                columnSortMapping={columnSortMapping}
                title="Posts"
                createButton={
                    <Link
                        to="/posts/create"
                        className="btn btn-primary"
                    >
                        Create Post
                    </Link>
                }
                defaultPageSize={20}
                staleTime={1000 * 30} // 30 seconds
                refetchOnMount="always"
            />

            {/* Delete confirmation dialog */}
            {postToDelete && (
                <DeletePostDialog
                    postId={postToDelete}
                    onClose={() => setPostToDelete(null)}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </>
    );
}
