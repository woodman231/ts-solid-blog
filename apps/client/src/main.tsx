import React from 'react';
import ReactDOM from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './auth/msal';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { AuthProvider } from './contexts/AuthContext';
import './styles/globals.css';

// The MsalProvider will handle initialization automatically
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MsalProvider instance={msalInstance}>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={router} />
                </QueryClientProvider>
            </AuthProvider>
        </MsalProvider>
    </React.StrictMode>
);