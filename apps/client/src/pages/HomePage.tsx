import { useAuth } from '../auth/useAuth';
import { getUserDisplayName } from '../auth/userUtils';
import { Link } from '@tanstack/react-router';

export function HomePage() {
    const { isAuthenticated, user: account, login } = useAuth();

    const handleLogin = async () => {
        try {
            await login();
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    return (
        <div className="relative isolate px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Welcome to the Blog App
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                    A place to share your thoughts and connect with others.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    {isAuthenticated ? (
                        <div className="space-y-6">
                            <p className="text-lg">
                                Welcome back, <span className="font-semibold">{getUserDisplayName(account)}</span>!
                            </p>
                            <div className="flex gap-4">
                                <Link
                                    to="/posts"
                                    className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                                >
                                    Browse Posts
                                </Link>
                                <Link
                                    to="/users"
                                    className="rounded-md bg-gray-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                                >
                                    Browse Users
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 text-center">
                            <p className="text-lg">Please sign in to continue.</p>
                            <button
                                onClick={handleLogin}
                                className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                            >
                                Sign In
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}