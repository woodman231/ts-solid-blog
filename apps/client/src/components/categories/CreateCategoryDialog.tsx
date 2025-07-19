import { PromptModal } from "../ui/PromptModal";
import { PuzzlePieceIcon } from "@heroicons/react/20/solid";

interface CreateCategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: string) => void | Promise<void>;
}

export function CreateCategoryDialog(props: CreateCategoryDialogProps) {
    const { isOpen, onClose, onSubmit } = props;

    return (
        <PromptModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            message="Enter a name for the new Category"
            title="Create Category"
            icon={<PuzzlePieceIcon />}
        />
    )
}