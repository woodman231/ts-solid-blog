import React, { createContext, useContext } from 'react';
import { useAuth } from '../auth/useAuth';

interface AuthContextType {
    currentUserId: string | null;
    isLoadingUserId: boolean;
    userDisplayName: string | null;
    userEmail: string | null;
    isAuthenticated: boolean;
    retryFetchUserId: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const { isAuthenticated, user, currentUserId, isLoadingUserId, retryFetchUserId } = useAuth();

    const value: AuthContextType = {
        currentUserId,
        isLoadingUserId,
        userDisplayName: user?.name || null,
        userEmail: user?.username || null,
        isAuthenticated,
        retryFetchUserId,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
