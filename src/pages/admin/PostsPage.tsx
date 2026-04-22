import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, publishPost, unpublishPost, deletePost } from '../../api/posts';
import type { PostSummaryResponse } from '../../types/post';

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PUBLISHED: 'bg-green-100 text-green-700',
        DRAFT: 'bg-gray-100 text-gray-600',
        SCHEDULED: 'bg-blue-100 text-blue-700',
        ARCHIVED: 'bg-yellow-100 text-yellow-700',
    };
    return (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
}

export default function PostsPage() {
    const [page, setPage] = useState(0);
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['posts', page],
        queryFn: () => getPosts(page),
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

    if (isLoading) return <p className="text-sm text-gray-500">Loading posts...</p>;
    if (isError) return <p className="text-sm text-red-500">Failed to load posts.</p>;

    const posts = data?.content ?? [];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Posts</h2>
                <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    New post
                </button>
            </div>

            {posts.length === 0 ? (
                <p className="text-sm text-gray-500">No posts yet.</p>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Title</th>
                                <th className="px-4 py-3 text-left">Author</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Published at</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {posts.map((post: PostSummaryResponse) => (
                                <tr key={post.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                                        {post.title}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {post.author.fullName}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={post.publishedAt ? 'PUBLISHED' : 'DRAFT'} />
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {post.publishedAt
                                            ? new Date(post.publishedAt).toLocaleDateString()
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => publish.mutate(post.id)}
                                                className="text-green-600 hover:text-green-700 text-xs font-medium"
                                            >
                                                Publish
                                            </button>
                                            <button
                                                onClick={() => unpublish.mutate(post.id)}
                                                className="text-yellow-600 hover:text-yellow-700 text-xs font-medium"
                                            >
                                                Unpublish
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Delete "${post.title}"?`)) {
                                                        remove.mutate(post.id);
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-700 text-xs font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Page {(data?.page ?? 0) + 1} of {data?.totalPages ?? 1}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => p - 1)}
                                disabled={data?.first}
                                className="text-xs px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={data?.last}
                                className="text-xs px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
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