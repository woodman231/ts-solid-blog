import { PublicClientApplication, Configuration, LogLevel, AccountInfo } from '@azure/msal-browser';

// MSAL configuration
const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_ADB2C_CLIENT_ID || '',
        authority: `https://${import.meta.env.VITE_ADB2C_DOMAIN_NAME}/${import.meta.env.VITE_ADB2C_TENANT_NAME}/${import.meta.env.VITE_ADB2C_SIGNIN_POLICY}`,
        knownAuthorities: [import.meta.env.VITE_ADB2C_DOMAIN_NAME],
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        break;
                    case LogLevel.Info:
                        console.info(message);
                        break;
                    case LogLevel.Verbose:
                        console.debug(message);
                        break;
                    case LogLevel.Warning:
                        console.warn(message);
                        break;
                    default:
                        break;
                }
            },
            logLevel: LogLevel.Info,
        },
    },
};

// Login scopes
export const loginRequest = {
    scopes: ['openid', 'profile', 'email', 'https://opsystempilot.onmicrosoft.com/4a499293-0274-4731-a46c-3f4090401c08/access_as_user'],
};

// MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL instance
let initializationPromise: Promise<void> | null = null;

export const initializeMsal = async (): Promise<void> => {
    if (!initializationPromise) {
        initializationPromise = msalInstance.initialize();
    }
    return initializationPromise;
};

// Ensure MSAL is initialized before use
export const getInitializedMsalInstance = async (): Promise<PublicClientApplication> => {
    await initializeMsal();
    return msalInstance;
};

// Get active account
export const getActiveAccount = async (): Promise<AccountInfo | null> => {
    await initializeMsal();

    const activeAccount = msalInstance.getActiveAccount();

    if (activeAccount) {
        return activeAccount;
    }

    // Fallback to first account if active account is not set
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
        return accounts[0];
    }

    return null;
};

// Get ID token
export const getIdToken = async (): Promise<string | null> => {
    const account = await getActiveAccount();

    if (!account) {
        return null;
    }

    try {
        const silentRequest = {
            scopes: loginRequest.scopes,
            account,
        };

        const response = await msalInstance.acquireTokenSilent(silentRequest);
        return response.idToken;
    } catch (error) {
        console.error('Error acquiring token silently', error);
        return null;
    }
};

// Get access token for API calls
export const getAccessToken = async (): Promise<string | null> => {
    const account = await getActiveAccount();

    if (!account) {
        return null;
    }

    try {
        const silentRequest = {
            scopes: ['https://opsystempilot.onmicrosoft.com/4a499293-0274-4731-a46c-3f4090401c08/access_as_user'],
            account,
            // Force refresh if token is close to expiry or has timing issues
            forceRefresh: false,
        };

        const response = await msalInstance.acquireTokenSilent(silentRequest);

        // Check if token is actually usable (not issued in the future)
        if (response.accessToken) {
            try {
                const tokenPayload = JSON.parse(atob(response.accessToken.split('.')[1]));
                const now = Math.floor(Date.now() / 1000);
                const nbf = tokenPayload.nbf || tokenPayload.iat; // not before or issued at

                // If token is issued in the future (clock skew), wait a bit and try refresh
                if (nbf && nbf > now + 30) { // 30 seconds tolerance
                    console.warn('Token issued in the future, forcing refresh', {
                        nbf: new Date(nbf * 1000),
                        now: new Date(now * 1000),
                        diff: nbf - now
                    });

                    // Force refresh the token
                    const refreshRequest = {
                        ...silentRequest,
                        forceRefresh: true,
                    };
                    const refreshResponse = await msalInstance.acquireTokenSilent(refreshRequest);
                    return refreshResponse.accessToken;
                }
            } catch (parseError) {
                console.warn('Could not parse token payload for timing check:', parseError);
                // Continue with original token if parsing fails
            }
        }

        return response.accessToken;
    } catch (error) {
        console.error('Error acquiring access token silently', error);

        // Try interactive token acquisition if silent fails
        try {
            const interactiveRequest = {
                scopes: ['https://opsystempilot.onmicrosoft.com/4a499293-0274-4731-a46c-3f4090401c08/access_as_user'],
            };

            const response = await msalInstance.acquireTokenPopup(interactiveRequest);
            return response.accessToken;
        } catch (interactiveError) {
            console.error('Error acquiring access token interactively', interactiveError);
            return null;
        }
    }
};

// Get access token for API calls with explicit account
export const getAccessTokenForAccount = async (account: AccountInfo): Promise<string | null> => {
    await initializeMsal();

    try {
        const silentRequest = {
            scopes: ['https://opsystempilot.onmicrosoft.com/4a499293-0274-4731-a46c-3f4090401c08/access_as_user'],
            account,
        };

        const response = await msalInstance.acquireTokenSilent(silentRequest);
        return response.accessToken;
    } catch (error) {
        console.error('Error acquiring access token silently', error);

        // Try interactive token acquisition if silent fails
        try {
            const interactiveRequest = {
                scopes: ['https://opsystempilot.onmicrosoft.com/4a499293-0274-4731-a46c-3f4090401c08/access_as_user'],
            };

            const response = await msalInstance.acquireTokenPopup(interactiveRequest);
            return response.accessToken;
        } catch (interactiveError) {
            console.error('Error acquiring access token interactively', interactiveError);
            return null;
        }
    }
};

// Login function
export const login = async (loginType: 'popup' | 'redirect' = 'redirect'): Promise<void> => {
    await initializeMsal();

    try {
        if (loginType === 'popup') {
            await msalInstance.loginPopup(loginRequest);
        } else {
            await msalInstance.loginRedirect(loginRequest);
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Logout function
export const logout = async (logoutType: 'popup' | 'redirect' = 'redirect'): Promise<void> => {
    await initializeMsal();

    try {
        const logoutRequest = {
            account: await getActiveAccount(),
            postLogoutRedirectUri: window.location.origin,
        };

        if (logoutType === 'popup') {
            await msalInstance.logoutPopup(logoutRequest);
        } else {
            await msalInstance.logoutRedirect(logoutRequest);
        }
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// Utility to clear token cache when timing issues are detected
export const clearTokenCache = async (): Promise<void> => {
    await initializeMsal();

    try {
        // Clear active account
        msalInstance.setActiveAccount(null);

        // Clear cache (this clears all tokens and accounts)
        await msalInstance.clearCache();
        console.log('Token cache cleared due to timing issues');
    } catch (error) {
        console.error('Error clearing token cache:', error);
    }
};

// Check if a token has timing issues
export const hasTokenTimingIssues = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        const nbf = payload.nbf || payload.iat;

        // Token is issued more than 2 minutes in the future
        return nbf && nbf > now + 120;
    } catch (error) {
        console.warn('Could not check token timing:', error);
        return false;
    }
};

// Note: Redirect handling is managed by MsalProvider in main.tsx