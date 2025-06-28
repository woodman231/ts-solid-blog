import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useSocketStore } from '../../lib/socket';
import { Link } from '@tanstack/react-router';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { User } from '@blog/shared/src/models/User';
import { Post } from '@blog/shared/src/models/Post';
import { LoadPageRequest, EntityDataResponse } from '@blog/shared/src/index';

export function UserDetailsPage() {
    const { userId } = useParams({ from: '/layout/users/$userId' });
    const { sendRequest } = useSocketStore();

    // Fetch user data and posts
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
                posts: response.responseParams.entities.data.posts as Post[],
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

    const { user, posts } = data;

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

            <h2 className="text-xl font-bold mt-8">Posts by {user.displayName}</h2>

            {posts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 truncate">{post.title}</h3>
                                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{post.description}</p>
                                <div className="mt-4">
                                    <Link
                                        to="/posts/$postId"
                                        params={{ postId: post.id }}
                                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                    >
                                        Read more →
                                    </Link>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-2 text-xs text-gray-500">
                                Posted on {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">This user hasn't created any posts yet.</p>
                </div>
            )}
        </div>
    );
}