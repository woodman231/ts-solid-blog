import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useSocketStore } from '../../lib/socket';
import { DeleteEntityRequest, SuccessResponse } from '@blog/shared/src/index';

interface DeletePostDialogProps {
    postId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function DeletePostDialog({ postId, onClose, onSuccess }: DeletePostDialogProps) {
    const { sendRequest } = useSocketStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            const request: DeleteEntityRequest = {
                requestType: 'deleteEntity',
                requestParams: {
                    entityType: 'posts',
                    entityId: postId,
                },
            };

            await sendRequest<DeleteEntityRequest, SuccessResponse>(request);
            onSuccess();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete post');
            setIsDeleting(false);
        }
    };

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={isDeleting ? () => { } : onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 text-red-600">
                                        <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900"
                                        >
                                            Delete Post
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete this post? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="mt-3 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                                        {error}
                                    </div>
                                )}

                                <div className="mt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                        onClick={onClose}
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}