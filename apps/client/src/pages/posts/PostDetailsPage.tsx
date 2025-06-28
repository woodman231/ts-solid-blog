import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useSocketStore } from '../../lib/socket';
import { Link } from '@tanstack/react-router';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Post } from '@blog/shared/src/models/Post';
import { User } from '@blog/shared/src/models/User';
import { LoadPageRequest, EntityDataResponse } from '@blog/shared/src/index';
import { useAuth } from '../../auth/useAuth';
import { useState } from 'react';
import { DeletePostDialog } from '../../components/posts/DeletePostDialog';
import { useNavigate } from '@tanstack/react-router';

export function PostDetailsPage() {
    const { postId } = useParams({ from: '/layout/posts/$postId' });
    const { sendRequest } = useSocketStore();
    const navigate = useNavigate();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { user: account } = useAuth();

    const currentUserId = account?.localAccountId || '';

    // Fetch post data
    const { data, isLoading, error } = useQuery({
        queryKey: ['post', postId],
        queryFn: async () => {
            const request: LoadPageRequest = {
                requestType: 'loadPage',
                requestParams: {
                    pageName: 'postDetails',
                    postId,
                },
            };

            const response = await sendRequest<LoadPageRequest, EntityDataResponse>(request);
            return {
                post: response.responseParams.entities.data.post?.[0] as Post | undefined,
                author: response.responseParams.entities.data.author?.[0] as User | undefined,
            };
        },
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error || !data?.post) {
        return (
            <div className="text-red-600">
                {error instanceof Error
                    ? `Error loading post: ${error.message}`
                    : 'Post not found'}
            </div>
        );
    }

    const { post, author } = data;
    const isAuthor = post.authorId === currentUserId;

    const handleDeleteSuccess = () => {
        navigate({ to: '/posts' });
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold">{post.title}</h1>
                    <div className="flex gap-2">
                        <Link
                            to="/posts"
                            className="btn btn-secondary"
                        >
                            Back to Posts
                        </Link>
                        {isAuthor && (
                            <>
                                <Link
                                    to="/posts/$postId/edit"
                                    params={{ postId }}
                                    className="btn btn-primary"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="btn btn-danger"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <p className="text-sm text-gray-500">
                            Posted by{' '}
                            <Link
                                to="/users/$userId"
                                params={{ userId: post.authorId }}
                                className="text-primary-600 hover:text-primary-800"
                            >
                                {author?.displayName || 'Unknown'}
                            </Link>{' '}
                            on {new Date(post.createdAt).toLocaleString()}
                        </p>
                    </div>

                    <div className="px-4 py-5 sm:px-6">
                        <p className="text-lg font-medium text-gray-900 mb-4">{post.description}</p>

                        <div className="prose max-w-none">
                            {post.body.split('\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {showDeleteDialog && (
                <DeletePostDialog
                    postId={postId}
                    onClose={() => setShowDeleteDialog(false)}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </>
    );
}