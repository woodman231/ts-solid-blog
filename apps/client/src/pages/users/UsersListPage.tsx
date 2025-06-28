import { useQuery } from '@tanstack/react-query';
import { useSocketStore } from '../../lib/socket';
import { useState, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { User } from '@blog/shared/src/models/User';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { FetchEntitiesRequest, EntityDataResponse } from '@blog/shared/src/index';

export function UsersListPage() {
    const { sendRequest } = useSocketStore();
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'createdAt', desc: true },
    ]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    // Convert sorting state to server format
    const serverSort = sorting.reduce((acc, sort) => {
        acc[sort.id] = sort.desc ? 'desc' : 'asc';
        return acc;
    }, {} as Record<string, 'asc' | 'desc'>);

    // Fetch users data with server-side pagination
    const { data, isLoading, error } = useQuery({
        queryKey: ['users', currentPage, pageSize, serverSort],
        queryFn: async () => {
            const request: FetchEntitiesRequest = {
                requestType: 'fetchEntities',
                requestParams: {
                    entityType: 'users',
                    sort: serverSort,
                    page: currentPage,
                    limit: pageSize,
                },
            };

            const response = await sendRequest<FetchEntitiesRequest, EntityDataResponse>(request);
            return response.responseParams.entities;
        },
    });

    // Handle sorting changes
    const handleSortingChange = useCallback((updater: any) => {
        setSorting(updater);
        setCurrentPage(0); // Reset to first page when sorting changes
    }, []);

    // Column definition for the table
    const columnHelper = createColumnHelper<User>();

    const columns = [
        columnHelper.accessor('displayName', {
            header: 'Name',
            cell: info => (
                <Link
                    to="/users/$userId"
                    params={{ userId: info.row.original.id }}
                    className="text-primary-600 hover:text-primary-800"
                >
                    {info.getValue()}
                </Link>
            ),
        }),
        columnHelper.accessor('email', {
            header: 'Email',
        }),
        columnHelper.accessor('createdAt', {
            header: 'Joined',
            cell: info => new Date(info.getValue()).toLocaleDateString(),
        }),
    ];

    const users = data?.data?.users || [];
    const totalPages = data?.totalPages || 0;
    const total = data?.total || 0;
    const filteredTotal = data?.filteredTotal || 0;

    const table = useReactTable({
        data: users,
        columns,
        state: {
            sorting,
        },
        onSortingChange: handleSortingChange,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true, // Enable server-side sorting
        manualPagination: true, // Enable server-side pagination
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="text-red-600">
                Error loading users: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Users</h1>
                <div className="text-sm text-gray-600">
                    Showing {users.length} of {filteredTotal} users ({total} total)
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-2">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            <span>
                                                {header.column.getIsSorted() === 'asc' ? ' 🔼' : header.column.getIsSorted() === 'desc' ? ' 🔽' : ''}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Server-side Pagination Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0 || isLoading}
                        >
                            Previous
                        </button>
                        <button
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage >= totalPages - 1 || isLoading}
                        >
                            Next
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="pageSize" className="text-sm text-gray-700">
                            Page size:
                        </label>
                        <select
                            id="pageSize"
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(0);
                            }}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-700">
                    <span>
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <span>
                        ({((currentPage * pageSize) + 1).toLocaleString()}-{Math.min((currentPage + 1) * pageSize, filteredTotal).toLocaleString()} of {filteredTotal.toLocaleString()})
                    </span>
                </div>
            </div>
        </div>
    );
}