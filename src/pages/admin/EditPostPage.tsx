import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMyPostById, updatePost } from '../../api/posts';
import type { PostUpdateRequest } from '../../types/post';
import type { ErrorResponse } from '../../types/api';

export default function EditPostPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<PostUpdateRequest>({
        title: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        categoryIds: [],
        metaDescription: '',
        metaKeywords: '',
    });

    useEffect(() => {
        async function fetchPost() {
            try {
                const post = await getMyPostById(Number(id))
                setForm({
                    title: post.title,
                    content: post.content,
                    excerpt: post.excerpt ?? '',
                    featuredImage: post.featuredImage ?? '',
                    categoryIds: post.categories.map(c => c.id),
                    metaDescription: post.metaDescription ?? '',
                    metaKeywords: post.metaKeywords ?? '',
                });
            } catch (err) {
                setError('Failed to load post');
            } finally {
                setFetching(false);
            }
        }
        if (id) fetchPost();
        else setFetching(false);
    }, [id]);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await updatePost(Number(id), form);
            navigate('/admin/posts');
        } catch (err) {
            const apiError = err as ErrorResponse;
            if (apiError.errors?.length) {
                setError(apiError.errors.map(e => e.message).join(', '));
            } else {
                setError('Something went wrong. Try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    if (fetching) return <p className="text-sm text-gray-500">Loading post...</p>;

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Edit post</h2>
                <button
                    onClick={() => navigate('/admin/posts')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    ← Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        maxLength={500}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        required
                        rows={12}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Excerpt
                    </label>
                    <textarea
                        name="excerpt"
                        value={form.excerpt}
                        onChange={handleChange}
                        rows={3}
                        maxLength={1000}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Featured Image URL
                    </label>
                    <input
                        type="url"
                        name="featuredImage"
                        value={form.featuredImage}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description
                    </label>
                    <input
                        type="text"
                        name="metaDescription"
                        value={form.metaDescription}
                        onChange={handleChange}
                        maxLength={500}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white text-sm px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/posts')}
                        className="text-sm px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}