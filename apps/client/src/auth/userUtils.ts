import { AccountInfo } from '@azure/msal-browser';

export const getUserDisplayName = (account: AccountInfo | null): string => {
    if (!account) return 'User';

    // Try name first, then username (email), then fallback
    return account.name || account.username || 'User';
};

export const getUserInitial = (account: AccountInfo | null): string => {
    if (!account) return 'U';

    const displayName = getUserDisplayName(account);
    return displayName.charAt(0).toUpperCase();
};

export const getUserEmail = (account: AccountInfo | null): string => {
    if (!account) return '';

    // Username is typically the email in MSAL
    return account.username || '';
};
