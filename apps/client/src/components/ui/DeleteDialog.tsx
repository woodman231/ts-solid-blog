import { useState } from 'react';
import { useSocketStore } from '../../lib/socket';
import { DeleteEntityRequest, SuccessResponse } from '@blog/shared/src/index';
import { ConfirmModal } from '../ui/ConfirmModal';

interface DeleteDialogProps {
    entityType: string;
    entityId: string;
    entityName?: string;
    title?: string;
    message?: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function DeleteDialog({
    entityType,
    entityId,
    entityName,
    title,
    message,
    onClose,
    onSuccess
}: DeleteDialogProps) {
    const { sendRequest } = useSocketStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const defaultTitle = title || `Delete ${entityName || entityType}`;
    const defaultMessage = message || `Are you sure you want to delete this ${entityName || entityType}? This action cannot be undone.`;

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            const request: DeleteEntityRequest = {
                requestType: 'deleteEntity',
                requestParams: {
                    entityType,
                    entityId,
                },
            };

            await sendRequest<DeleteEntityRequest, SuccessResponse>(request);
            onSuccess();
        } catch (error) {
            setError(error instanceof Error ? error.message : `Failed to delete ${entityName || entityType}`);
            setIsDeleting(false);
        }
    };

    return (
        <>
            <ConfirmModal
                isOpen={true}
                onClose={onClose}
                onConfirm={handleDelete}
                title={defaultTitle}
                message={defaultMessage}
                confirmText={isDeleting ? 'Deleting...' : 'Delete'}
                cancelText="Cancel"
                variant="danger"
                isLoading={isDeleting}
                disabled={isDeleting}
            />

            {error && (
                <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
        </>
    );
}
