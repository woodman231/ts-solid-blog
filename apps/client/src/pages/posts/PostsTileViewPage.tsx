import { useState, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { PostWithAuthor } from '@blog/shared/src/models/Post';
import { TileView, TileActionConfig, TileRenderer, TileFilterConfig } from '../../components/ui/TileView';
import { DeletePostDialog } from '../../components/posts/DeletePostDialog';
import { useAuthContext } from '../../contexts/AuthContext';
import { ENTITY_TYPES } from '@blog/shared/src/index';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export function PostsTileViewPage() {
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const { currentUserId } = useAuthContext();

    // Configure filters for tile view
    const filterConfigs: TileFilterConfig[] = [
        {
            key: 'author',
            label: 'Author',
            type: 'text',
            placeholder: 'Search by author...',
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' },
            ],
        },
    ];

    // Configure actions for tiles
    const actions: TileActionConfig[] = [
        {
            label: 'Edit',
            variant: 'secondary',
            icon: PencilIcon,
            onClick: (post: PostWithAuthor) => {
                // Navigate to edit page - you might want to use router navigation here
                window.location.href = `/posts/${post.id}/edit`;
            },
            show: (post: PostWithAuthor) => post.authorId === currentUserId,
        },
        {
            label: 'Delete',
            variant: 'danger',
            icon: TrashIcon,
            onClick: (post: PostWithAuthor) => {
                setPostToDelete(post.id);
            },
            show: (post: PostWithAuthor) => post.authorId === currentUserId,
        },
    ];

    // Tile renderer function
    const tileRenderer: TileRenderer<PostWithAuthor> = (post, actionButtons) => (
        <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
                {/* Post Title */}
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    <Link
                        to="/posts/$postId"
                        params={{ postId: post.id }}
                        className="hover:text-primary-600 transition-colors"
                    >
                        {post.title}
                    </Link>
                </h3>

                {/* Post Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.description}
                </p>

                {/* Author and Date */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                        <span>By </span>
                        <Link
                            to="/users/$userId"
                            params={{ userId: post.author.id }}
                            className="font-medium text-primary-600 hover:text-primary-800 ml-1"
                        >
                            {post.author.displayName}
                        </Link>
                    </div>
                    <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                </div>

                {/* Read More Link */}
                <div className="border-t border-gray-200 pt-4">
                    <Link
                        to="/posts/$postId"
                        params={{ postId: post.id }}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center"
                    >
                        Read more →
                    </Link>
                </div>

                {/* Action Buttons */}
                {actionButtons}
            </div>
        </div>
    );

    // Handle successful post deletion
    const handleDeleteSuccess = useCallback(() => {
        setPostToDelete(null);
        // The TileView will automatically refetch due to its query invalidation
    }, []);

    return (
        <>
            <TileView
                entityType={ENTITY_TYPES.POSTS}
                tileRenderer={tileRenderer}
                initialSorting={{ createdAt: 'desc' }}
                enableGlobalFilter={true}
                globalFilterPlaceholder="Search posts by title, description, content, or author..."
                enableFilters={true}
                filterConfigs={filterConfigs}
                title="Posts"
                createButton={
                    <Link
                        to="/posts/create"
                        className="btn btn-primary"
                    >
                        Create Post
                    </Link>
                }
                actions={actions}
                defaultPageSize={12}
                staleTime={1000 * 30}
                refetchOnMount="always"
                emptyStateMessage="No posts found. Create your first post to get started!"
                tileContainerClassName="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
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
