import { AccountInfo } from '@azure/msal-browser';
import { msalInstance, initializeMsal } from './msal';

// Debug utility to inspect tokens
export const debugTokens = async (account: AccountInfo) => {
    await initializeMsal();

    const serverClientId = import.meta.env.VITE_ADB2C_SERVER_CLIENT_ID;
    const clientId = import.meta.env.VITE_ADB2C_CLIENT_ID;

    console.log('=== TOKEN DEBUG ===');
    console.log('Client ID:', clientId);
    console.log('Server Client ID:', serverClientId);
    console.log('Account:', account);

    console.log('Environment Variables Check:');
    console.log('VITE_ADB2C_DOMAIN_NAME:', import.meta.env.VITE_ADB2C_DOMAIN_NAME);
    console.log('VITE_ADB2C_CLIENT_ID:', import.meta.env.VITE_ADB2C_CLIENT_ID);
    console.log('VITE_ADB2C_SERVER_CLIENT_ID:', import.meta.env.VITE_ADB2C_SERVER_CLIENT_ID);

    try {
        // Try to get ID token
        const idTokenRequest = {
            scopes: ['openid', 'profile', 'email'],
            account
        };

        const idTokenResponse = await msalInstance.acquireTokenSilent(idTokenRequest);
        console.log('ID Token Response:', {
            idToken: idTokenResponse.idToken,
            accessToken: idTokenResponse.accessToken,
            scopes: idTokenResponse.scopes
        });

        if (idTokenResponse.idToken) {
            const idTokenParts = idTokenResponse.idToken.split('.');
            const idTokenPayload = JSON.parse(atob(idTokenParts[1]));
            console.log('ID Token Payload:', idTokenPayload);
        }

    } catch (error) {
        console.error('Error getting ID token:', error);
    }

    // Test different scope formats for access token
    const domainName = import.meta.env.VITE_ADB2C_DOMAIN_NAME;
    const scopeFormats = [
        // Format 1: Correct onmicrosoft.com format based on server manifest
        'https://opsystempilot.onmicrosoft.com/4a499293-0274-4731-a46c-3f4090401c08/access_as_user',
        // Format 2: Original format using b2clogin domain
        `https://${domainName}/${serverClientId}/access_as_user`,
        // Format 3: Just client ID and scope
        `${serverClientId}/access_as_user`,
        // Format 4: Alternative format some B2C tenants use
        `api://${serverClientId}/access_as_user`,
    ];

    try {
        console.log('Testing different scope formats:');

        for (let i = 0; i < scopeFormats.length; i++) {
            const scope = scopeFormats[i];
            console.log(`Trying scope format ${i + 1}: ${scope}`);

            try {
                const accessTokenRequest = {
                    scopes: [scope],
                    account
                };

                const accessTokenResponse = await msalInstance.acquireTokenSilent(accessTokenRequest);
                console.log(`✅ SUCCESS with format ${i + 1}:`, {
                    scope,
                    accessToken: accessTokenResponse.accessToken ? 'RECEIVED' : 'EMPTY',
                    scopes: accessTokenResponse.scopes
                });

                if (accessTokenResponse.accessToken) {
                    const accessTokenParts = accessTokenResponse.accessToken.split('.');
                    const accessTokenPayload = JSON.parse(atob(accessTokenParts[1]));
                    console.log('Access Token Payload:', accessTokenPayload);
                    break; // Stop if we got a successful token
                }
            } catch (error) {
                console.log(`❌ FAILED with format ${i + 1}:`, error instanceof Error ? error.message : error);
            }
        }

        // If all silent attempts fail, try interactive acquisition
        console.log('All silent attempts failed. Trying interactive acquisition...');

        try {
            const interactiveRequest = {
                scopes: ['https://opsystempilot.onmicrosoft.com/4a499293-0274-4731-a46c-3f4090401c08/access_as_user'], // Use the correct format
                account
            };

            const interactiveResponse = await msalInstance.acquireTokenPopup(interactiveRequest);
            console.log('✅ Interactive acquisition successful:', {
                accessToken: interactiveResponse.accessToken ? 'RECEIVED' : 'EMPTY',
                scopes: interactiveResponse.scopes
            });

            if (interactiveResponse.accessToken) {
                const parts = interactiveResponse.accessToken.split('.');
                const payload = JSON.parse(atob(parts[1]));
                console.log('Interactive Access Token Payload:', payload);
            }
        } catch (interactiveError) {
            console.error('Interactive acquisition also failed:', interactiveError);
        }

    } catch (error) {
        console.error('Error in scope testing:', error);
    }

    console.log('=== END TOKEN DEBUG ===');
};
