import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSocketStore } from '../lib/socket';
import { SelectListItem } from '@blog/shared/src/types/selectListItem';
import { FetchEntitiesRequest, EntityDataResponse } from '@blog/shared/src/index';
import { ENTITY_TYPES } from '@blog/shared/src/index';
import { User } from '@blog/shared/src/index';

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
        queryFn: async (): Promise<SelectListItem[]> => {
            const request: FetchEntitiesRequest<User> = {
                requestType: 'fetchEntities',
                requestParams: {
                    entityType: ENTITY_TYPES.USERS,
                    page: 0,
                    limit: 20,
                    sort: { displayName: 'asc' },
                    filterOptions: {
                        globalSearch: debouncedQuery.trim() || undefined,
                    }
                },
            };

            const response = await sendRequest<FetchEntitiesRequest, EntityDataResponse<User>>(request);
            const targetEntities = response.responseParams.entities.data[ENTITY_TYPES.USERS] || [];

            return targetEntities.map(author => ({
                value: author.id,
                label: author.displayName,
            }));
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        enabled: true, // Always enabled, will return all authors if no query
    });

    const searchData = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    return {
        data: authors,
        searchData,
        isLoading,
        error,
    };
}
