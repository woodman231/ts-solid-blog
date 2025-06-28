import { useQuery } from '@tanstack/react-query';
import { useSocketStore } from '../../lib/socket';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
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

    // Fetch users data
    const { data, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const request: FetchEntitiesRequest = {
                requestType: 'fetchEntities',
                requestParams: {
                    entityType: 'users',
                    sort: { createdAt: 'desc' },
                    page: 0,
                    limit: 20,
                },
            };

            const response = await sendRequest<FetchEntitiesRequest, EntityDataResponse>(request);
            return response.responseParams.entities;
        },
    });

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

    const table = useReactTable({
        data: users,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
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
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                        {table.getRowModel().rows.length > 0 ? (
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        className="btn btn-secondary"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </button>
                </div>
                <div className="text-sm text-gray-500">
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                </div>
            </div>
        </div>
    );
}