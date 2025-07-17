import { Fragment, ReactNode, FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FormModalWithActionsProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (e: FormEvent) => void | Promise<void>;
    title: string;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
    maxHeight?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
    icon?: ReactNode;
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    className?: string;
    submitText?: string;
    cancelText?: string;
    submitButtonVariant?: 'primary' | 'secondary' | 'danger' | 'success';
    isSubmitting?: boolean;
    submitDisabled?: boolean;
    showSubmitButton?: boolean;
    showCancelButton?: boolean;
    customActions?: ReactNode;
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
};

const maxHeightClasses = {
    sm: 'max-h-96',
    md: 'max-h-[32rem]',
    lg: 'max-h-[40rem]',
    xl: 'max-h-[48rem]',
    '2xl': 'max-h-[56rem]',
    '3xl': 'max-h-[64rem]',
    '4xl': 'max-h-[72rem]',
    '5xl': 'max-h-[80rem]',
    '6xl': 'max-h-[88rem]',
    full: 'max-h-[calc(100vh-2rem)]',
};

const submitButtonClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 focus-visible:ring-primary-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 focus-visible:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500',
};

export function FormModalWithActions({
    isOpen,
    onClose,
    onSubmit,
    title,
    children,
    maxWidth = 'lg',
    maxHeight = 'full',
    icon,
    showCloseButton = true,
    closeOnOverlayClick = true,
    className = '',
    submitText = 'Submit',
    cancelText = 'Cancel',
    submitButtonVariant = 'primary',
    isSubmitting = false,
    submitDisabled = false,
    showSubmitButton = true,
    showCancelButton = true,
    customActions,
}: FormModalWithActionsProps) {
    const handleClose = () => {
        if (closeOnOverlayClick && !isSubmitting) {
            onClose();
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (onSubmit && !isSubmitting && !submitDisabled) {
            await onSubmit(e);
        }
    };

    const isFormSubmitDisabled = isSubmitting || submitDisabled;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
                    <div className="flex min-h-full items-start justify-center p-4 sm:items-center">
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
                                className={`w-full ${maxWidthClasses[maxWidth]} ${maxHeightClasses[maxHeight]} transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all flex flex-col my-8 ${className}`}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                                    <div className="flex items-center">
                                        {icon && (
                                            <div className="flex-shrink-0 text-primary-600 mr-3">
                                                {icon}
                                            </div>
                                        )}
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900"
                                        >
                                            {title}
                                        </Dialog.Title>
                                    </div>
                                    {showCloseButton && (
                                        <button
                                            type="button"
                                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            onClick={onClose}
                                            disabled={isSubmitting}
                                        >
                                            <span className="sr-only">Close</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>

                                {/* Form Content */}
                                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                                    {/* Scrollable Content */}
                                    <div className="flex-1 overflow-y-auto p-6 min-h-0">
                                        {children}
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                                        {customActions || (
                                            <>
                                                {showCancelButton && (
                                                    <button
                                                        type="button"
                                                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                                        onClick={onClose}
                                                        disabled={isSubmitting}
                                                    >
                                                        {cancelText}
                                                    </button>
                                                )}
                                                {showSubmitButton && (
                                                    <button
                                                        type="submit"
                                                        className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${submitButtonClasses[submitButtonVariant]}`}
                                                        disabled={isFormSubmitDisabled}
                                                    >
                                                        {isSubmitting ? 'Loading...' : submitText}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
