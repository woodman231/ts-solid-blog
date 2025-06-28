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
import { PostWithAuthor } from '@blog/shared/src/models/Post';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { FetchEntitiesRequest, EntityDataResponse } from '@blog/shared/src/index';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import { useAuth } from '../../auth/useAuth';
import { DeletePostDialog } from '../../components/posts/DeletePostDialog';

export function PostsListPage() {
    const { sendRequest } = useSocketStore();
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'createdAt', desc: true },
    ]);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const { user: account } = useAuth();
    const userId = account?.localAccountId || '';

    // Fetch posts data
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['posts'],
        queryFn: async () => {
            const request: FetchEntitiesRequest = {
                requestType: 'fetchEntities',
                requestParams: {
                    entityType: 'posts',
                    sort: { createdAt: 'desc' },
                    page: 0,
                    limit: 50,
                },
            };

            const response = await sendRequest<FetchEntitiesRequest, EntityDataResponse>(request);
            return response.responseParams.entities;
        },
    });

    // Column definition for the table
    const columnHelper = createColumnHelper<PostWithAuthor>();

    const columns = [
        columnHelper.accessor('title', {
            header: 'Title',
            cell: info => (
                <Link
                    to="/posts/$postId"
                    params={{ postId: info.row.original.id }}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                >
                    {info.getValue()}
                </Link>
            ),
        }),
        columnHelper.accessor('description', {
            header: 'Description',
            cell: info => (
                <div className="truncate max-w-xs">{info.getValue()}</div>
            ),
        }),
        columnHelper.accessor('author.displayName', {
            header: 'Author',
            cell: info => {
                const authorId = info.row.original.author.id;
                return (
                    <Link
                        to="/users/$userId"
                        params={{ userId: authorId }}
                        className="text-primary-600 hover:text-primary-800"
                    >
                        {info.getValue()}
                    </Link>
                );
            },
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: info => new Date(info.getValue()).toLocaleDateString(),
        }),
        columnHelper.display({
            id: 'actions',
            header: '',
            cell: info => {
                const post = info.row.original;
                const isAuthor = post.authorId === userId;

                if (!isAuthor) return null;

                return (
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600">
                                <span className="sr-only">Open options</span>
                                <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                            </Menu.Button>
                        </div>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                to="/posts/$postId/edit"
                                                params={{ postId: post.id }}
                                                className={`
                          ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} 
                          block px-4 py-2 text-sm
                        `}
                                            >
                                                Edit
                                            </Link>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => setPostToDelete(post.id)}
                                                className={`
                          ${active ? 'bg-gray-100 text-red-700' : 'text-red-600'} 
                          block px-4 py-2 text-sm w-full text-left
                        `}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                );
            },
        }),
    ];

    const posts = data?.data?.posts || [];

    const table = useReactTable({
        data: posts,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const handleDeleteSuccess = () => {
        refetch();
        setPostToDelete(null);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="text-red-600">
                Error loading posts: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Posts</h1>
                    <Link
                        to="/posts/create"
                        className="btn btn-primary"
                    >
                        Create Post
                    </Link>
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
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {header.column.getCanSort() ? (
                                                <div className="flex items-center gap-2">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    <span>
                                                        {header.column.getIsSorted() === 'asc' ? ' 🔼' : header.column.getIsSorted() === 'desc' ? ' 🔽' : ''}
                                                    </span>
                                                </div>
                                            ) : (
                                                flexRender(header.column.columnDef.header, header.getContext())
                                            )}
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
                                        No posts found
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

            {postToDelete && (
                <DeletePostDialog
                    postId={postToDelete}
                    onClose={() => setPostToDelete(null)}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </>
    );
}