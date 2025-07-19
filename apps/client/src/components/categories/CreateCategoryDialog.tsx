import { PuzzlePieceIcon } from "@heroicons/react/20/solid";
import { FormModalWithActions } from "../ui/FormModalWithActions";
import { FormEvent } from "react";
import { CreateCategory } from '@blog/shared/src/models/Category';

interface CreateCategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: CreateCategory) => void | Promise<void>;
    isSubmitting: boolean;
}

export function CreateCategoryDialog(props: CreateCategoryDialogProps) {
    const { isOpen, onClose, onSubmit, isSubmitting } = props;

    const handleCategorySubmit = async (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData) as CreateCategory;
        await onSubmit(data);
        onClose();
    };

    return (
        <FormModalWithActions
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleCategorySubmit}
            isSubmitting={isSubmitting}
            title="Create Category"
            icon={<PuzzlePieceIcon className="h-6 w-6" />}
        >
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                    </label>
                    <input
                        name="name"
                        type="text"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Category name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Category description"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Category (optional)
                    </label>
                    <select
                        name="parentId"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                        <option value="">None</option>
                        {/* Options for parent categories should be populated here */}
                    </select>
                </div>
            </div>
        </FormModalWithActions>
    )
}