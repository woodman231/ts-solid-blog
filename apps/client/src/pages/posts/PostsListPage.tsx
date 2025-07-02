import { useState, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { PostWithAuthor } from '@blog/shared/src/models/Post';
import { DataTable } from '../../components/ui/DataTable';
import { DeletePostDialog } from '../../components/posts/DeletePostDialog';
import { useSocketStore } from '../../lib/socket';
import { LoadPageRequest, EntityDataResponse } from '@blog/shared/src/index';
import { useAuth } from '../../auth/useAuth';

export function PostsListPage() {
    const { sendRequest } = useSocketStore();
    const { user: account } = useAuth();
    const [postToDelete, setPostToDelete] = useState<string | null>(null);

    // Fetch current user data to get the database user ID
    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const request: LoadPageRequest = {
                requestType: 'loadPage',
                requestParams: {
                    pageName: 'currentUser',
                },
            };

            const response = await sendRequest<LoadPageRequest, EntityDataResponse>(request);
            return response.responseParams.entities.data.user?.[0];
        },
        enabled: !!account, // Only fetch if user is authenticated
    });

    const userId = currentUser?.id || '';

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
            id: 'author.displayName', // Explicitly set the ID for server-side sorting
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
                const isAuthor = post.authorId === userId;

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
                entityType="posts"
                columns={columns}
                initialSorting={[{ id: 'createdAt', desc: true }]}
                enableGlobalFilter={true}
                globalFilterPlaceholder="Search posts by title, description, content, or author..."
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
