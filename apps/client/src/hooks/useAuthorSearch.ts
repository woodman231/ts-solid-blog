import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSocketStore } from '../lib/socket';
import { SearchAuthorsRequest } from '@blog/shared/src/socket/Request';
import { SearchAuthorsResponse } from '@blog/shared/src/socket/Response';

interface AuthorOption {
    id: string;
    displayName: string;
}

export function useAuthorSearch() {
    const { sendRequest } = useSocketStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Search authors query
    const { data: authors = [], isLoading, error } = useQuery({
        queryKey: ['searchAuthors', debouncedQuery],
        queryFn: async (): Promise<AuthorOption[]> => {
            const request: SearchAuthorsRequest = {
                requestType: 'searchAuthors',
                requestParams: {
                    query: debouncedQuery,
                    limit: 20,
                },
            };

            const response = await sendRequest<SearchAuthorsRequest, SearchAuthorsResponse>(request);
            return response.responseParams.authors;
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        enabled: true, // Always enabled, will return all authors if no query
    });

    const searchAuthors = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    return {
        authors,
        searchAuthors,
        isLoading,
        error,
    };
}
