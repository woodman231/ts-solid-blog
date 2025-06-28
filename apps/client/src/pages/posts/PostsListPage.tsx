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
import { PostWithAuthor } from '@blog/shared/src/models/Post';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { FetchEntitiesRequest, EntityDataResponse, LoadPageRequest } from '@blog/shared/src/index';
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
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const { user: account } = useAuth();

    // Fetch current user data to get the database user ID
    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const request: LoadPageRequest = {
                requestType: 'loadPage',
                requestParams: {
                    pageName: 'currentUser',
                },
            };

            const response = await sendRequest<LoadPageRequest, EntityDataResponse>(request);
            return response.responseParams.entities.data.user?.[0];
        },
        enabled: !!account, // Only fetch if user is authenticated
    });

    const userId = currentUser?.id || '';

    // Convert sorting state to server format
    const serverSort = sorting.reduce((acc, sort) => {
        acc[sort.id] = sort.desc ? 'desc' : 'asc';
        return acc;
    }, {} as Record<string, 'asc' | 'desc'>);

    // Fetch posts data with server-side pagination
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['posts', currentPage, pageSize, serverSort],
        queryFn: async () => {
            const request: FetchEntitiesRequest = {
                requestType: 'fetchEntities',
                requestParams: {
                    entityType: 'posts',
                    sort: serverSort,
                    page: currentPage,
                    limit: pageSize,
                },
            };

            const response = await sendRequest<FetchEntitiesRequest, EntityDataResponse>(request);
            return response.responseParams.entities;
        },
        staleTime: 1000 * 30, // 30 seconds - shorter stale time for list pages
        refetchOnMount: 'always', // Always refetch when component mounts
    });

    // Handle sorting changes
    const handleSortingChange = useCallback((updater: any) => {
        setSorting(updater);
        setCurrentPage(0); // Reset to first page when sorting changes
    }, []);

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
                    <div className="flex justify-end">
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
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
                                <Menu.Items className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                    </div>
                );
            },
        }),
    ];

    const posts = data?.data?.posts || [];
    const totalPages = data?.totalPages || 0;
    const total = data?.total || 0;
    const filteredTotal = data?.filteredTotal || 0;

    const table = useReactTable({
        data: posts,
        columns,
        state: {
            sorting,
        },
        onSortingChange: handleSortingChange,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true, // Enable server-side sorting
        manualPagination: true, // Enable server-side pagination
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
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                            Showing {posts.length} of {filteredTotal} posts ({total} total)
                        </div>
                        <Link
                            to="/posts/create"
                            className="btn btn-primary"
                        >
                            Create Post
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
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
                            {posts.length > 0 ? (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
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