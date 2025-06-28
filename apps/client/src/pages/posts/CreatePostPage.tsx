import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSocketStore } from '../../lib/socket';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Link } from '@tanstack/react-router';
import { CreateEntityRequest, SuccessResponse } from '@blog/shared/src/index';
import { useQueryClient } from '@tanstack/react-query';

// Form validation schema
const postSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
    description: z.string().min(3, 'Description must be at least 3 characters').max(200, 'Description is too long'),
    body: z.string().min(10, 'Content must be at least 10 characters'),
});

export function CreatePostPage() {
    const { sendRequest } = useSocketStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: { title: string; description: string; body: string }) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const request: CreateEntityRequest = {
                requestType: 'createEntity',
                requestParams: {
                    entityType: 'posts',
                    entityData: values,
                },
            };

            await sendRequest<CreateEntityRequest, SuccessResponse>(request);

            // Invalidate posts queries to refetch fresh data
            await queryClient.invalidateQueries({ queryKey: ['posts'] });

            navigate({ to: '/posts' });
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Create New Post</h1>
                <Link to="/posts" className="btn btn-secondary">
                    Cancel
                </Link>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
                {submitError && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {submitError}
                    </div>
                )}

                <form.Provider>
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
                                        placeholder="Enter a title for your post"
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
                                        placeholder="A brief description of your post"
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
                                        placeholder="Write your post content here"
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
                                {isSubmitting ? 'Creating...' : 'Create Post'}
                            </button>
                        </div>
                    </form>
                </form.Provider>
            </div>
        </div>
    );
}