import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 2, // 2 minutes - reduced for more responsive updates
            refetchOnWindowFocus: true, // Refetch when window gains focus
            refetchOnMount: 'always', // Always refetch when component mounts
            retry: 1,
        },
    },
});