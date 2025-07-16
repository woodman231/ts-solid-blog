import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useCallback, useEffect, useState } from 'react';
import { loginRequest, getAccessTokenForAccount } from './msal';
import { debugTokens } from './debugTokens';

export const useAuth = () => {
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoadingUserId, setIsLoadingUserId] = useState(false);
    const [userIdFetchAttempted, setUserIdFetchAttempted] = useState(false);

    // Get the active account (first account if available)
    const account = accounts.length > 0 ? accounts[0] : null;

    // Debug logging
    useEffect(() => {
        console.log('Auth state:', {
            isAuthenticated,
            accountsCount: accounts.length,
            currentUserId,
            account: account ? {
                name: account.name,
                username: account.username,
                homeAccountId: account.homeAccountId
            } : null
        });
    }, [isAuthenticated, accounts.length, account, currentUserId]);

    // Fetch user ID from server when authenticated
    useEffect(() => {
        const fetchUserId = async () => {
            if (isAuthenticated && account && !currentUserId && !isLoadingUserId && !userIdFetchAttempted) {
                setIsLoadingUserId(true);
                setUserIdFetchAttempted(true);
                try {
                    const token = await getAccessTokenForAccount(account);
                    if (token) {
                        // Make a request to get the user's database ID
                        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (response.ok) {
                            const userData = await response.json();
                            setCurrentUserId(userData.id);
                        } else {
                            console.warn(`Failed to fetch user ID: ${response.status} ${response.statusText}`);
                            // Don't retry automatically - user ID will remain null
                        }
                    } else {
                        console.warn('No token available for user ID fetch');
                    }
                } catch (error) {
                    console.error('Failed to fetch user ID:', error);
                    // Don't retry automatically - user ID will remain null
                } finally {
                    setIsLoadingUserId(false);
                }
            }
        };

        fetchUserId();
    }, [isAuthenticated, account, currentUserId, isLoadingUserId, userIdFetchAttempted]);

    // Clear user ID when logging out
    useEffect(() => {
        if (!isAuthenticated) {
            setCurrentUserId(null);
            setUserIdFetchAttempted(false); // Reset so it can be fetched again on next login
        }
    }, [isAuthenticated]);

    // Debug function
    const debugAuth = useCallback(async () => {
        if (account) {
            await debugTokens(account);
        } else {
            console.log('No account available for token debugging');
        }
    }, [account]);

    const login = useCallback(async () => {
        try {
            await instance.loginRedirect(loginRequest);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }, [instance]);

    const loginPopup = useCallback(async () => {
        try {
            await instance.loginPopup(loginRequest);
        } catch (error) {
            console.error('Popup login failed:', error);
            throw error;
        }
    }, [instance]);

    const logout = useCallback(async () => {
        try {
            await instance.logoutRedirect({
                account: account,
                postLogoutRedirectUri: window.location.origin,
            });
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }, [instance, account]);

    const getToken = useCallback(async () => {
        if (!account) {
            return null;
        }
        return await getAccessTokenForAccount(account);
    }, [account]);

    // Manual retry function for fetching user ID
    const retryFetchUserId = useCallback(async () => {
        if (isAuthenticated && account) {
            setUserIdFetchAttempted(false); // Reset the flag to allow retry
            setCurrentUserId(null); // Clear current value to trigger refetch
        }
    }, [isAuthenticated, account]);

    return {
        isAuthenticated,
        user: account,
        currentUserId,
        isLoadingUserId,
        login,
        loginPopup,
        logout,
        getToken,
        retryFetchUserId, // Expose the retry function
        debugAuth, // Expose the debug function
    };
};
