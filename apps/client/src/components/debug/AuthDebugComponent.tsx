import React from 'react';
import { useAuth } from '../../auth/useAuth';
import { getUserDisplayName, getUserEmail } from '../../auth/userUtils';

export const AuthDebugComponent: React.FC = () => {
    const { isAuthenticated, user, login, logout, getToken, debugAuth } = useAuth();

    const handleGetToken = async () => {
        const token = await getToken();
        console.log('Access Token:', token);
    };

    const handleDebugTokens = async () => {
        await debugAuth();
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Authentication Debug</h3>

            <div className="space-y-2">
                <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                <p><strong>User:</strong> {user ? 'Account object exists' : 'No account'}</p>

                {user && (
                    <div className="ml-4">
                        <p><strong>Display Name:</strong> {getUserDisplayName(user)}</p>
                        <p><strong>Email:</strong> {getUserEmail(user)}</p>
                        <p><strong>Home Account ID:</strong> {user.homeAccountId}</p>
                    </div>
                )}
            </div>

            <div className="mt-4 space-x-2">
                {!isAuthenticated ? (
                    <button
                        onClick={login}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Login
                    </button>
                ) : (
                    <>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                        <button
                            onClick={handleGetToken}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Get Token
                        </button>
                        <button
                            onClick={handleDebugTokens}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Debug Tokens
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
