import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useCallback, useEffect } from 'react';
import { loginRequest, getAccessTokenForAccount } from './msal';
import { debugTokens } from './debugTokens';

export const useAuth = () => {
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    // Get the active account (first account if available)
    const account = accounts.length > 0 ? accounts[0] : null;

    // Debug logging
    useEffect(() => {
        console.log('Auth state:', {
            isAuthenticated,
            accountsCount: accounts.length,
            account: account ? {
                name: account.name,
                username: account.username,
                homeAccountId: account.homeAccountId
            } : null
        });
    }, [isAuthenticated, accounts.length, account]);

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

    return {
        isAuthenticated,
        user: account,
        login,
        loginPopup,
        logout,
        getToken,
        debugAuth, // Expose the debug function
    };
};
