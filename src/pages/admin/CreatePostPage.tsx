import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../../api/posts';
import type { PostCreateRequest } from '../../types/post';
import type { ErrorResponse } from '../../types/api';

export default function CreatePostPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<PostCreateRequest>({
        title: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        status: 'DRAFT',
        categoryIds: [],
        metaDescription: '',
        metaKeywords: '',
    });

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
            await createPost(form);
            navigate('/admin/posts');
        } catch (err) {
            const apiError = err as ErrorResponse;
            if (apiError.status === 409) {
                setError('A post with this slug already exists.');
            } else if (apiError.errors?.length) {
                setError(apiError.errors.map(e => e.message).join(', '));
            } else {
                setError('Something went wrong. Try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">New post</h2>
                <button
                    onClick={() => navigate('/admin/posts')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    ← Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
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
                        placeholder="Post title"
                    />
                </div>

                {/* Content */}
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
                        placeholder="Write your post content here..."
                    />
                </div>

                {/* Excerpt */}
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
                        placeholder="Short summary of the post..."
                    />
                </div>

                {/* Featured Image */}
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

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                    </select>
                </div>

                {/* Meta Description */}
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
                        placeholder="SEO description..."
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
                        {loading ? 'Saving...' : 'Save post'}
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