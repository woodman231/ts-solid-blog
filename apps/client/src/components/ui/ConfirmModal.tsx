import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    icon?: React.ReactNode;
    variant?: 'warning' | 'danger' | 'info';
    isLoading?: boolean;
    disabled?: boolean;
}

const variantStyles = {
    warning: {
        iconColor: 'text-yellow-600',
        confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700 focus-visible:ring-yellow-500',
        defaultIcon: <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />,
    },
    danger: {
        iconColor: 'text-red-600',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500',
        defaultIcon: <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />,
    },
    info: {
        iconColor: 'text-blue-600',
        confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500',
        defaultIcon: <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />,
    },
};

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    icon,
    variant = 'warning',
    isLoading = false,
    disabled = false
}: ConfirmModalProps) {
    const styles = variantStyles[variant];
    const displayIcon = icon || styles.defaultIcon;

    const handleConfirm = async () => {
        if (disabled || isLoading) return;
        await onConfirm();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={isLoading ? () => { } : onClose}>
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
                                    <div className={`flex-shrink-0 ${styles.iconColor}`}>
                                        {displayIcon}
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900"
                                        >
                                            {title}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                        onClick={onClose}
                                        disabled={isLoading}
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        type="button"
                                        className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${styles.confirmButtonClass}`}
                                        onClick={handleConfirm}
                                        disabled={isLoading || disabled}
                                    >
                                        {isLoading ? 'Loading...' : confirmText}
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
