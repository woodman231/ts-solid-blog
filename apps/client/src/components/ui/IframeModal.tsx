import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface IframeModalProps {
    isOpen: boolean;
    onClose: () => void;
    src: string;
    title?: string;
    width?: 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
    height?: 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
    allowFullscreen?: boolean;
    sandbox?: string;
    className?: string;
    showTitle?: boolean;
    loading?: 'eager' | 'lazy';
    referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
}

const widthClasses = {
    lg: 'w-[90vw] max-w-4xl',
    xl: 'w-[92vw] max-w-5xl',
    '2xl': 'w-[94vw] max-w-6xl',
    '3xl': 'w-[95vw] max-w-7xl',
    '4xl': 'w-[96vw] max-w-[90rem]',
    '5xl': 'w-[97vw] max-w-[100rem]',
    '6xl': 'w-[98vw] max-w-[110rem]',
    '7xl': 'w-[99vw] max-w-[120rem]',
    full: 'w-[99vw]',
};

const heightClasses = {
    lg: 'h-[70vh]',
    xl: 'h-[75vh]',
    '2xl': 'h-[80vh]',
    '3xl': 'h-[85vh]',
    '4xl': 'h-[90vh]',
    '5xl': 'h-[92vh]',
    '6xl': 'h-[94vh]',
    full: 'h-[96vh]',
};

export function IframeModal({
    isOpen,
    onClose,
    src,
    title,
    width = '4xl',
    height = '4xl',
    allowFullscreen = true,
    sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms allow-downloads',
    className = '',
    showTitle = true,
    loading = 'lazy',
    referrerPolicy = 'strict-origin-when-cross-origin',
}: IframeModalProps) {
    const modalTitle = title || new URL(src).hostname;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className={`${widthClasses[width]} ${heightClasses[height]} transform overflow-hidden rounded-lg bg-white shadow-xl transition-all flex flex-col ${className}`}
                            >
                                {/* Header with title and close buttons */}
                                {showTitle && (
                                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                                        <div className="flex items-center min-w-0 flex-1">
                                            <Dialog.Title
                                                as="h3"
                                                className="text-lg font-medium leading-6 text-gray-900 truncate"
                                                title={modalTitle}
                                            >
                                                {modalTitle}
                                            </Dialog.Title>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            {/* X button */}
                                            <button
                                                type="button"
                                                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 p-1"
                                                onClick={onClose}
                                            >
                                                <span className="sr-only">Close</span>
                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Iframe container */}
                                <div className="flex-1 relative bg-white">
                                    <iframe
                                        src={src}
                                        className="w-full h-full border-0"
                                        allow={allowFullscreen ? "fullscreen" : ""}
                                        sandbox={sandbox}
                                        loading={loading}
                                        referrerPolicy={referrerPolicy}
                                        title={modalTitle}
                                    />
                                </div>

                                {/* Footer with additional close button */}
                                <div className="flex justify-end p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        onClick={onClose}
                                    >
                                        Close
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
