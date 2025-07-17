import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    buttonText?: string;
    icon?: React.ReactNode;
    variant?: 'info' | 'warning' | 'error' | 'success';
}

const variantStyles = {
    info: {
        iconColor: 'text-blue-600',
        defaultIcon: <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />,
    },
    warning: {
        iconColor: 'text-yellow-600',
        defaultIcon: <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />,
    },
    error: {
        iconColor: 'text-red-600',
        defaultIcon: <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />,
    },
    success: {
        iconColor: 'text-green-600',
        defaultIcon: <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />,
    },
};

export function AlertModal({
    isOpen,
    onClose,
    title,
    message,
    buttonText = 'OK',
    icon,
    variant = 'info'
}: AlertModalProps) {
    const styles = variantStyles[variant];
    const displayIcon = icon || styles.defaultIcon;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
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

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        {buttonText}
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
