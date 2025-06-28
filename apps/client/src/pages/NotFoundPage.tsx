import { Link } from '@tanstack/react-router';

export function NotFoundPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    404 - Page Not Found
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    The page you're looking for doesn't exist or has been moved.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex flex-col items-center">
                    <div className="text-9xl font-bold text-gray-200">404</div>
                    <Link
                        to="/"
                        className="mt-8 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Go Back Home
                    </Link>
                </div>
            </div>
        </div>
    );
}