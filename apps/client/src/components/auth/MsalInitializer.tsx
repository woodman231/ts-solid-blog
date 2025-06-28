import React, { useState, useEffect } from 'react';
import { initializeMsal } from '../../auth/msal';

interface MsalInitializerProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const MsalInitializer: React.FC<MsalInitializerProps> = ({
    children,
    fallback = <div>Initializing authentication...</div>
}) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        initializeMsal()
            .then(() => {
                setIsInitialized(true);
            })
            .catch((err: unknown) => {
                console.error('MSAL initialization failed:', err);
                setError('Failed to initialize authentication');
            });
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!isInitialized) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
