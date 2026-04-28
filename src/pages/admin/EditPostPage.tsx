import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMyPostById, updatePost } from '../../api/posts';
import type { PostUpdateRequest } from '../../types/post';
import type { ErrorResponse } from '../../types/api';

const inputClass = "w-full border border-black/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand transition-colors";
const labelClass = "block text-sm font-semibold text-black mb-1.5";

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
                const post = await getMyPostById(Number(id));
                setForm({
                    title: post.title,
                    content: post.content,
                    excerpt: post.excerpt ?? '',
                    featuredImage: post.featuredImage ?? '',
                    categoryIds: post.categories.map(c => c.id),
                    metaDescription: post.metaDescription ?? '',
                    metaKeywords: post.metaKeywords ?? '',
                });
            } catch {
                setError('Failed to load post.');
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

    if (fetching) return <p className="text-sm text-black/50">Loading post...</p>;

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-black tracking-tight">Edit post</h1>
                <button
                    onClick={() => navigate('/admin/posts')}
                    className="text-sm text-black/40 hover:text-black transition-colors"
                >
                    ← Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className={labelClass}>
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        maxLength={500}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>
                        Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        required
                        rows={12}
                        className={`${inputClass} resize-y font-mono`}
                    />
                </div>

                <div>
                    <label className={labelClass}>Excerpt</label>
                    <textarea
                        name="excerpt"
                        value={form.excerpt}
                        onChange={handleChange}
                        rows={3}
                        maxLength={1000}
                        className={`${inputClass} resize-none`}
                    />
                </div>

                <div>
                    <label className={labelClass}>Featured Image URL</label>
                    <input
                        type="url"
                        name="featuredImage"
                        value={form.featuredImage}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="https://..."
                    />
                </div>

                <div>
                    <label className={labelClass}>Meta Description</label>
                    <input
                        type="text"
                        name="metaDescription"
                        value={form.metaDescription}
                        onChange={handleChange}
                        maxLength={500}
                        className={inputClass}
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand text-white text-sm px-6 py-2.5 rounded-full font-semibold hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/posts')}
                        className="text-sm px-6 py-2.5 rounded-full border border-black/15 text-black/65 hover:border-black/35 hover:text-black transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}