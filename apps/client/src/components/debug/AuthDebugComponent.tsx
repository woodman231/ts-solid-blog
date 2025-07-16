import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../auth/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';
import { getUserDisplayName, getUserEmail } from '../../auth/userUtils';

export const AuthDebugComponent: React.FC = () => {
    const { isAuthenticated, user, login, logout, getToken, debugAuth, currentUserId, isLoadingUserId, retryFetchUserId } = useAuth();
    const authContext = useAuthContext();
    const renderCount = useRef(0);

    useEffect(() => {
        renderCount.current += 1;
        console.log(`AuthDebugComponent render #${renderCount.current}`, {
            currentUserId,
            isLoadingUserId,
            isAuthenticated,
            timestamp: new Date().toISOString()
        });
    });

    const handleGetToken = async () => {
        const token = await getToken();
        console.log('Access Token:', token);
    };

    const handleDebugTokens = async () => {
        await debugAuth();
    };

    const handleRetryFetchUserId = async () => {
        console.log('Manually retrying user ID fetch...');
        await retryFetchUserId();
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Authentication Debug</h3>

            <div className="mb-4 p-3 bg-blue-50 rounded">
                <h4 className="font-medium mb-2">Render Cycle Test</h4>
                <div className="text-sm space-y-1">
                    <div>Render Count: <span className="font-mono">{renderCount.current}</span></div>
                    <div>Current User ID: <span className="font-mono">{currentUserId || 'null'}</span></div>
                    <div>Is Loading User ID: <span className="font-mono">{isLoadingUserId ? 'true' : 'false'}</span></div>
                    <div>Context User ID: <span className="font-mono">{authContext.currentUserId || 'null'}</span></div>
                </div>
                <button
                    onClick={handleRetryFetchUserId}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
                    disabled={isLoadingUserId}
                >
                    {isLoadingUserId ? 'Retrying...' : 'Retry Fetch User ID'}
                </button>
            </div>

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
