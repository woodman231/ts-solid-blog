import { useState, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { Category } from '@blog/shared/src/models/Category';
import { EntityTileView, TileActionConfig, TileRenderer, TileSortConfig } from '../../components/ui/EntityTileView';
import { ColumnFilterConfig } from '../../components/ui/ColumnFilter';
import { DeleteCategoryDialog } from '../../components/categories/DeleteCategoryDialog';
import { ENTITY_TYPES } from '@blog/shared/src/index';
import { PencilIcon, TrashIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';
import { CreateCategoryDialog } from '@/components/categories/CreateCategoryDialog';
import { useSocketStore } from '../../lib/socket';
import { CreateEntityRequest, SuccessResponse } from '@blog/shared/src/index';
import { useQueryClient } from '@tanstack/react-query';
import { AlertModal } from '@/components/ui/AlertModal';

export function CategoriesListPage() {
    const { sendRequest } = useSocketStore();
    const queryClient = useQueryClient();

    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState<boolean>(false);
    const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
    const [createCategoryError, setCreateCategoryError] = useState<string | null>(null);
    const [isCreateCategoryErrorModalOpen, setIsCreateCategoryErrorModalOpen] = useState<boolean>(false);

    // Configure filters for tile view
    const filterConfigs: Record<string, ColumnFilterConfig<Category>> = {
        "name": {
            type: 'text',
            operators: ['contains', 'startsWith', 'endsWith'],
            label: 'Name',
            placeholder: 'Filter by name...',
        },
    };

    // Configure sorting options
    const sortConfigs: TileSortConfig[] = [
        {
            key: 'createdAt',
            label: 'Date Created',
            serverField: 'createdAt',
        },
        {
            key: 'updatedAt',
            label: 'Date Updated',
            serverField: 'updatedAt',
        },
        {
            key: 'name',
            label: 'Name',
            serverField: 'name',
        },
    ];

    // Configure actions for tiles
    const actions: TileActionConfig[] = [
        {
            label: 'Edit',
            variant: 'secondary',
            icon: PencilIcon,
            onClick: (category: Category) => {
                // Navigate to edit page - you might want to use router navigation here
                window.location.href = `/categories/${category.id}/edit`;
            },
            show: () => true,
        },
        {
            label: 'Delete',
            variant: 'danger',
            icon: TrashIcon,
            onClick: (category: Category) => {
                setCategoryToDelete(category.id);
            },
            show: () => true,
        },
    ];

    // Tile renderer function
    const tileRenderer: TileRenderer<Category> = (category, actionButtons) => (
        <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-primary-200">
            <div className="p-6">
                {/* Icon and Category Name */}
                <div className="flex items-start space-x-3 mb-3">
                    <div className="flex-shrink-0 p-2 bg-primary-50 rounded-lg">
                        <PuzzlePieceIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                            <Link
                                to="/categories/$categoryId"
                                params={{ categoryId: category.id }}
                                className="hover:text-primary-600 transition-colors"
                            >
                                {category.name}
                            </Link>
                        </h3>
                    </div>
                </div>

                {/* Category Description */}
                {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {category.description}
                    </p>
                )}

                {/* Divider */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                    {/* Action Buttons */}
                    {actionButtons}
                </div>
            </div>
        </div>
    );

    // Handle successful category deletion
    const handleDeleteSuccess = useCallback(() => {
        setCategoryToDelete(null);
        // The TileView will automatically refetch due to its query invalidation
    }, []);

    const onCreateCategoryClick = () => {
        setIsCreateCategoryDialogOpen(true);
    }

    const onCloseCreateNewCategoryDialog = () => {
        setIsCreatingCategory(false);
        setIsCreateCategoryDialogOpen(false);
    }

    const onSubmitCreateNewCategoryDialog = async (categoryName: string) => {
        setIsCreatingCategory(true);
        setCreateCategoryError(null);

        try {
            const request: CreateEntityRequest<Omit<Category, "id" | "createdAt" | "updatedAt">> = {
                requestType: 'createEntity',
                requestParams: {
                    entityType: 'category',
                    entityData: {
                        name: categoryName,
                        slug: categoryName,
                    },
                },
            };

            await sendRequest<CreateEntityRequest, SuccessResponse>(request);

            await queryClient.invalidateQueries({ queryKey: ['categories'] });
        } catch (error) {
            setCreateCategoryError(error instanceof Error ? error.message : 'Failed to create post');
            setIsCreateCategoryErrorModalOpen(true);
        }

        setIsCreatingCategory(false);
        setIsCreateCategoryDialogOpen(false);
    }

    const onCloseCreateCategoryErrorDialog = () => {
        setCreateCategoryError(null);
        setIsCreateCategoryErrorModalOpen(false);
    }

    return (
        <>
            {(!isCreatingCategory) && (<EntityTileView
                entityType={ENTITY_TYPES.CATEGORIES}
                tileRenderer={tileRenderer}
                initialSorting={{ createdAt: 'desc' }}
                enableGlobalFilter={true}
                globalFilterPlaceholder="Search categories by name..."
                enableFilters={true}
                filterConfigs={filterConfigs}
                enableSorting={true}
                sortConfigs={sortConfigs}
                title="Categories"
                createButton={
                    <button
                        className="btn btn-primary"
                        onClick={onCreateCategoryClick}
                    >
                        Create Category
                    </button>
                }
                actions={actions}
                defaultPageSize={12}
                staleTime={1000 * 30}
                refetchOnMount="always"
                emptyStateMessage="No categories found. Create your first category to get started!"
                tileContainerClassName="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            />)}

            {/* Delete confirmation dialog */}
            {categoryToDelete && (
                <DeleteCategoryDialog
                    categoryId={categoryToDelete}
                    onClose={() => setCategoryToDelete(null)}
                    onSuccess={handleDeleteSuccess}
                />
            )}
            {isCreateCategoryDialogOpen && (
                <CreateCategoryDialog
                    isOpen={isCreateCategoryDialogOpen}
                    onClose={onCloseCreateNewCategoryDialog}
                    onSubmit={onSubmitCreateNewCategoryDialog}
                />
            )}
            {(isCreateCategoryErrorModalOpen && createCategoryError) && (
                <AlertModal
                    isOpen={isCreateCategoryErrorModalOpen}
                    message={createCategoryError}
                    onClose={onCloseCreateCategoryErrorDialog}
                    title='Create Category Error'
                    variant='error'
                />
            )}
        </>
    );
}
