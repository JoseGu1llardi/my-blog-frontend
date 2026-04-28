import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publishPost, unpublishPost, deletePost, getMyPosts } from '../../api/posts';
import type { PostResponse } from '../../types/post';
import { useNavigate } from 'react-router-dom';

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PUBLISHED: 'bg-brand-light text-brand',
        DRAFT: 'bg-black/7 text-black/55',
        SCHEDULED: 'bg-blue-100 text-blue-700',
        ARCHIVED: 'bg-yellow-100 text-yellow-700',
    };
    return (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status] ?? 'bg-black/7 text-black/55'}`}>
            {status}
        </span>
    );
}

export default function PostsPage() {
    const [page, setPage] = useState(0);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['posts', page],
        queryFn: () => getMyPosts(page),
    });

    const publish = useMutation({
        mutationFn: publishPost,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
    });

    const unpublish = useMutation({
        mutationFn: unpublishPost,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
    });

    const remove = useMutation({
        mutationFn: deletePost,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
    });

    if (isLoading) return <p className="text-sm text-black/50">Loading posts...</p>;
    if (isError) return <p className="text-sm text-red-500">Failed to load posts.</p>;

    const posts = data?.content ?? [];

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-black tracking-tight">Posts</h1>
                <button
                    onClick={() => navigate('/admin/posts/new')}
                    className="bg-brand text-white text-sm px-5 py-2.5 rounded-full font-semibold hover:bg-brand-hover transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                    New post
                </button>
            </div>

            {posts.length === 0 ? (
                <p className="text-sm text-black/50">No posts yet.</p>
            ) : (
                <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-black/8">
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-black/45 uppercase tracking-widest">Title</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-black/45 uppercase tracking-widest">Author</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-black/45 uppercase tracking-widest">Status</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-black/45 uppercase tracking-widest">Published at</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-black/45 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post: PostResponse) => (
                                <tr key={post.id} className="border-b border-black/6 hover:bg-brand-light/30 transition-colors group">
                                    <td className="px-5 py-4 font-semibold text-black max-w-xs truncate cursor-pointer group-hover:text-brand transition-colors"
                                        onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                                    >
                                        {post.title}
                                    </td>
                                    <td className="px-5 py-4 text-black/50">
                                        {post.author.fullName}
                                    </td>
                                    <td className="px-5 py-4">
                                        <StatusBadge status={post.status} />
                                    </td>
                                    <td className="px-5 py-4 text-black/50">
                                        {post.publishedAt
                                            ? new Date(post.publishedAt).toLocaleDateString()
                                            : '—'}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => publish.mutate(post.id)}
                                                className="text-brand hover:text-brand-hover text-xs font-semibold transition-colors"
                                            >
                                                Publish
                                            </button>
                                            <button
                                                onClick={() => unpublish.mutate(post.id)}
                                                className="text-black/40 hover:text-black text-xs font-semibold transition-colors"
                                            >
                                                Unpublish
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                                                className="text-black/40 hover:text-black text-xs font-semibold transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Delete "${post.title}"?`)) {
                                                        remove.mutate(post.id);
                                                    }
                                                }}
                                                className="text-red-500 hover:text-red-600 text-xs font-semibold transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="px-5 py-3.5 border-t border-black/8 flex items-center justify-between">
                        <span className="text-xs text-black/40">
                            Page {(data?.page ?? 0) + 1} of {data?.totalPages ?? 1}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => p - 1)}
                                disabled={data?.first}
                                className="text-xs px-3 py-1.5 rounded-lg border border-black/10 disabled:opacity-30 hover:bg-black/5 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={data?.last}
                                className="text-xs px-3 py-1.5 rounded-lg border border-black/10 disabled:opacity-30 hover:bg-black/5 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}