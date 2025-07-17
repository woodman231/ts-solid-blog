import { useState } from 'react';
import { AlertModal, ConfirmModal, PromptModal, DeleteDialog } from '../ui/modals';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * Example component demonstrating the usage of all modal components
 */
export function ModalExamples() {
    const [showAlert, setShowAlert] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [result, setResult] = useState<string>('');

    const handleConfirm = async () => {
        setResult('Confirmed!');
        setShowConfirm(false);
    };

    const handlePromptSubmit = async (value: string) => {
        setResult(`Prompt result: ${value}`);
        setShowPrompt(false);
    };

    const handleDeleteSuccess = () => {
        setResult('Item deleted successfully!');
        setShowDelete(false);
    };

    return (
        <div className="p-8 space-y-4">
            <h2 className="text-2xl font-bold mb-6">Modal Examples</h2>

            <div className="grid grid-cols-2 gap-4">
                {/* Alert Modal Example */}
                <button
                    onClick={() => setShowAlert(true)}
                    className="btn btn-primary"
                >
                    Show Alert Modal
                </button>

                {/* Confirm Modal Example */}
                <button
                    onClick={() => setShowConfirm(true)}
                    className="btn btn-secondary"
                >
                    Show Confirm Modal
                </button>

                {/* Prompt Modal Example */}
                <button
                    onClick={() => setShowPrompt(true)}
                    className="btn btn-accent"
                >
                    Show Prompt Modal
                </button>

                {/* Delete Dialog Example */}
                <button
                    onClick={() => setShowDelete(true)}
                    className="btn btn-danger"
                >
                    Show Delete Dialog
                </button>
            </div>

            {/* Display result */}
            {result && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">{result}</p>
                </div>
            )}

            {/* Alert Modal */}
            <AlertModal
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
                title="Information"
                message="This is an alert modal example. It's used to display important information to the user."
                variant="info"
            />

            {/* Success Alert Modal Example */}
            <AlertModal
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
                title="Success!"
                message="Operation completed successfully!"
                variant="success"
                icon={<CheckCircleIcon className="h-6 w-6" aria-hidden="true" />}
                buttonText="Great!"
            />

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirm}
                title="Are you sure?"
                message="This action will make changes to your data. Do you want to continue?"
                variant="warning"
                confirmText="Yes, continue"
                cancelText="Cancel"
            />

            {/* Danger Confirm Modal Example */}
            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirm}
                title="Delete Item"
                message="This will permanently delete the item. This action cannot be undone."
                variant="danger"
                confirmText="Delete"
                cancelText="Keep"
                icon={<ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />}
            />

            {/* Prompt Modal */}
            <PromptModal
                isOpen={showPrompt}
                onClose={() => setShowPrompt(false)}
                onSubmit={handlePromptSubmit}
                title="Enter your name"
                message="Please provide your full name for the registration."
                placeholder="Your name..."
                required={true}
                minLength={2}
                maxLength={50}
            />

            {/* Email Prompt Modal Example */}
            <PromptModal
                isOpen={showPrompt}
                onClose={() => setShowPrompt(false)}
                onSubmit={handlePromptSubmit}
                title="Email Address"
                message="Please enter your email address to receive notifications."
                placeholder="email@example.com"
                inputType="email"
                required={true}
                submitText="Subscribe"
                cancelText="Skip"
            />

            {/* Delete Dialog */}
            {showDelete && (
                <DeleteDialog
                    entityType="items"
                    entityId="example-id"
                    entityName="example item"
                    onClose={() => setShowDelete(false)}
                    onSuccess={handleDeleteSuccess}
                />
            )}

            {/* Custom Delete Dialog Example */}
            {showDelete && (
                <DeleteDialog
                    entityType="users"
                    entityId="user-123"
                    entityName="user account"
                    title="Delete User Account"
                    message="This will permanently delete the user account and all associated data. This action cannot be undone."
                    onClose={() => setShowDelete(false)}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </div>
    );
}

/**
 * Usage Examples:
 * 
 * 1. AlertModal - For showing information, warnings, errors, or success messages
 * 2. ConfirmModal - For getting user confirmation before actions
 * 3. PromptModal - For getting user input with various input types
 * 4. DeleteDialog - Specialized confirm dialog for delete operations
 * 
 * All modals support:
 * - Custom icons
 * - Loading states
 * - Different variants/styles
 * - Keyboard accessibility
 * - Focus management
 * - Transition animations
 */
