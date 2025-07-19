import { DeleteDialog } from '../ui/DeleteDialog';

interface DeleteCategoryDialogProps {
    categoryId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function DeleteCategoryDialog({ categoryId, onClose, onSuccess }: DeleteCategoryDialogProps) {
    return (
        <DeleteDialog
            entityType="categories"
            entityId={categoryId}
            entityName="category"
            onClose={onClose}
            onSuccess={onSuccess}
        />
    );
}