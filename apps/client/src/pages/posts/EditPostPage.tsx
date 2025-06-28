import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useSocketStore } from '../../lib/socket';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Link } from '@tanstack/react-router';
import { UpdateEntityRequest, LoadPageRequest, EntityDataResponse, SuccessResponse } from '@blog/shared/src/index';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

// Form validation schema
const postSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
    description: z.string().min(3, 'Description must be at least 3 characters').max(200, 'Description is too long'),
    body: z.string().min(10, 'Content must be at least 10 characters'),
});

export function EditPostPage() {
    const { postId } = useParams({ from: '/layout/posts/$postId/edit' });
    const { sendRequest } = useSocketStore();
    const navigate = useNavigate();
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
    });

    // Create form with post data
    const form = useForm({
        defaultValues: {
            title: data?.title || '',
            description: data?.description || '',
            body: data?.body || '',
        },
        onSubmit: async ({ value }) => {
            await handleSubmit(value);
        },
    });

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
            navigate({ to: '/posts/$postId', params: { postId } });
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

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error || !data) {
        return (
            <div className="text-red-600">
                {error instanceof Error
                    ? `Error loading post: ${error.message}`
                    : 'Post not found'}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Edit Post</h1>
                <Link
                    to="/posts/$postId"
                    params={{ postId }}
                    className="btn btn-secondary"
                >
                    Cancel
                </Link>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
                {submitError && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {submitError}
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-6"
                >
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
                                <label htmlFor={field.name} className="form-label">
                                    Title
                                </label>
                                <input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
                                <label htmlFor={field.name} className="form-label">
                                    Description
                                </label>
                                <input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
                                <label htmlFor={field.name} className="form-label">
                                    Content
                                </label>
                                <textarea
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    rows={10}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                                {field.state.meta.errors ? (
                                    <p className="mt-1 text-sm text-red-600">
                                        {field.state.meta.errors.join(', ')}
                                    </p>
                                ) : null}
                            </div>
                        )}
                    </form.Field>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}