import { useState, useEffect } from 'react';
import { useSocketStore } from '../../lib/socket';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { UpdateEntityRequest, LoadPageRequest, EntityDataResponse, SuccessResponse } from '@blog/shared/src/index';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FormModalWithActions } from '../ui/FormModalWithActions';
import { PencilIcon } from '@heroicons/react/24/outline';

// Form validation schema
const postSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
    description: z.string().min(3, 'Description must be at least 3 characters').max(200, 'Description is too long'),
    body: z.string().min(10, 'Content must be at least 10 characters'),
});

interface EditPostModalProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditPostModal({ postId, isOpen, onClose, onSuccess }: EditPostModalProps) {
    const { sendRequest } = useSocketStore();
    const queryClient = useQueryClient();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch post data
    const { data, isLoading, error } = useQuery({
        queryKey: ['post', postId, 'edit'],
        queryFn: async () => {
            const request: LoadPageRequest = {
                requestType: 'loadPage',
                requestParams: {
                    pageName: 'postDetails',
                    postId,
                },
            };

            const response = await sendRequest<LoadPageRequest, EntityDataResponse>(request);
            return response.responseParams.entities.data.post?.[0];
        },
        enabled: isOpen, // Only fetch when modal is open
    });

    // Create form with post data
    const form = useForm({
        defaultValues: {
            title: '',
            description: '',
            body: '',
        },
        onSubmit: async ({ value }) => {
            await handleSubmit(value);
        },
    });

    // Update form values when data is loaded
    useEffect(() => {
        if (data) {
            form.setFieldValue('title', data.title || '');
            form.setFieldValue('description', data.description || '');
            form.setFieldValue('body', data.body || '');
        }
    }, [data, form]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            form.reset();
            setSubmitError(null);
            setIsSubmitting(false);
        }
    }, [isOpen, form]);

    const handleSubmit = async (values: { title: string; description: string; body: string }) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Validate the form data with Zod before submitting
            const validatedData = postSchema.parse(values);

            const request: UpdateEntityRequest = {
                requestType: 'updateEntity',
                requestParams: {
                    entityType: 'posts',
                    entityId: postId,
                    entityData: validatedData,
                },
            };

            await sendRequest<UpdateEntityRequest, SuccessResponse>(request);

            // Invalidate relevant queries to refetch fresh data
            await queryClient.invalidateQueries({ queryKey: ['posts'] });
            await queryClient.invalidateQueries({ queryKey: ['post', postId] });

            onSuccess();
        } catch (error) {
            if (error instanceof z.ZodError) {
                setSubmitError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
            } else {
                setSubmitError(error instanceof Error ? error.message : 'Failed to update post');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.handleSubmit();
    };

    if (error) {
        return (
            <FormModalWithActions
                isOpen={isOpen}
                onClose={onClose}
                title="Error"
                showSubmitButton={false}
                cancelText="Close"
            >
                <div className="text-red-600">
                    Error loading post: {error instanceof Error ? error.message : 'Unknown error'}
                </div>
            </FormModalWithActions>
        );
    }

    return (
        <FormModalWithActions
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleFormSubmit}
            title="Edit Post"
            submitText={isSubmitting ? 'Saving...' : 'Save Changes'}
            cancelText="Cancel"
            submitButtonVariant="primary"
            isSubmitting={isSubmitting}
            submitDisabled={isLoading}
            closeOnOverlayClick={!isSubmitting}
            maxWidth="2xl"
            maxHeight="full"
            icon={<PencilIcon className="h-6 w-6" aria-hidden="true" />}
        >
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-gray-600">Loading post data...</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {submitError && (
                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {submitError}
                        </div>
                    )}

                    <form.Provider>
                        <div className="space-y-6">
                            <form.Field
                                name="title"
                                validators={{
                                    onChange: ({ value }) => {
                                        const result = postSchema.shape.title.safeParse(value);
                                        return result.success ? undefined : result.error.issues[0]?.message;
                                    },
                                }}
                            >
                                {(field) => (
                                    <div>
                                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                                            Title
                                        </label>
                                        <input
                                            id={field.name}
                                            name={field.name}
                                            type="text"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                            placeholder="Enter post title..."
                                        />
                                        {field.state.meta.errors ? (
                                            <p className="mt-1 text-sm text-red-600">
                                                {field.state.meta.errors.join(', ')}
                                            </p>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>

                            <form.Field
                                name="description"
                                validators={{
                                    onChange: ({ value }) => {
                                        const result = postSchema.shape.description.safeParse(value);
                                        return result.success ? undefined : result.error.issues[0]?.message;
                                    },
                                }}
                            >
                                {(field) => (
                                    <div>
                                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <input
                                            id={field.name}
                                            name={field.name}
                                            type="text"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                            placeholder="Enter post description..."
                                        />
                                        {field.state.meta.errors ? (
                                            <p className="mt-1 text-sm text-red-600">
                                                {field.state.meta.errors.join(', ')}
                                            </p>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>

                            <form.Field
                                name="body"
                                validators={{
                                    onChange: ({ value }) => {
                                        const result = postSchema.shape.body.safeParse(value);
                                        return result.success ? undefined : result.error.issues[0]?.message;
                                    },
                                }}
                            >
                                {(field) => (
                                    <div>
                                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                                            Content
                                        </label>
                                        <textarea
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                            rows={12}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                            placeholder="Enter post content..."
                                        />
                                        {field.state.meta.errors ? (
                                            <p className="mt-1 text-sm text-red-600">
                                                {field.state.meta.errors.join(', ')}
                                            </p>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
                        </div>
                    </form.Provider>
                </div>
            )}
        </FormModalWithActions>
    );
}
