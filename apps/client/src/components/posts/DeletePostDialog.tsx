import { DeleteDialog } from '../ui/DeleteDialog';

interface DeletePostDialogProps {
    postId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function DeletePostDialog({ postId, onClose, onSuccess }: DeletePostDialogProps) {
    return (
        <DeleteDialog
            entityType="posts"
            entityId={postId}
            entityName="post"
            onClose={onClose}
            onSuccess={onSuccess}
        />
    );
}