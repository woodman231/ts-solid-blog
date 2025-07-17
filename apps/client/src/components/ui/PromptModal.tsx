import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface PromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: string) => void | Promise<void>;
    title: string;
    message: string;
    placeholder?: string;
    defaultValue?: string;
    submitText?: string;
    cancelText?: string;
    icon?: React.ReactNode;
    isLoading?: boolean;
    disabled?: boolean;
    inputType?: 'text' | 'password' | 'email' | 'number';
    required?: boolean;
    maxLength?: number;
    minLength?: number;
}

export function PromptModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    message,
    placeholder = 'Enter value...',
    defaultValue = '',
    submitText = 'Submit',
    cancelText = 'Cancel',
    icon,
    isLoading = false,
    disabled = false,
    inputType = 'text',
    required = false,
    maxLength,
    minLength
}: PromptModalProps) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const defaultIcon = <QuestionMarkCircleIcon className="h-6 w-6" aria-hidden="true" />;
    const displayIcon = icon || defaultIcon;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (disabled || isLoading) return;
        if (required && !inputValue.trim()) return;

        await onSubmit(inputValue);
    };

    const handleClose = () => {
        if (isLoading) return;
        setInputValue(defaultValue);
        onClose();
    };

    const isSubmitDisabled = disabled || isLoading || (required && !inputValue.trim());

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={handleClose}>
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
                                    <div className="flex-shrink-0 text-blue-600">
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

                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <input
                                            type={inputType}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder={placeholder}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            autoFocus
                                            disabled={isLoading}
                                            required={required}
                                            maxLength={maxLength}
                                            minLength={minLength}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                            onClick={handleClose}
                                            disabled={isLoading}
                                        >
                                            {cancelText}
                                        </button>
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isSubmitDisabled}
                                        >
                                            {isLoading ? 'Loading...' : submitText}
                                        </button>
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
