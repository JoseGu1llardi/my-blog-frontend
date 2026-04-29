import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPosts } from '../../api/posts';
import { getCategoriesWithPosts } from '../../api/categories';
import type { PostSummaryResponse } from '../../types/post';

function PostCard({ post }: { post: PostSummaryResponse }) {
    return (
        <Link to={`/posts/${post.slug}`} className="group block">
            <article className="border border-black/8 rounded-2xl overflow-hidden hover:border-black/20 transition-colors">
                {post.featuredImage && (
                    <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                        <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                    </div>
                )}
                {!post.featuredImage && (
                    <div className="aspect-[16/9] bg-black/5 flex items-center justify-center">
                        <span className="text-black/20 text-4xl">✦</span>
                    </div>
                )}
                <div className="p-6">
                    <h2 className="text-lg font-bold text-black tracking-tight leading-snug mb-2 group-hover:text-black/70 transition-colors">
                        {post.title}
                    </h2>
                    {post.excerpt && (
                        <p className="text-sm text-black/50 leading-relaxed line-clamp-2 mb-4">
                            {post.excerpt}
                        </p>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-black/40 font-medium">
                            {post.author.fullName}
                        </span>
                        <span className="text-xs text-black/30">
                            {post.publishedAt
                                ? new Date(post.publishedAt).toLocaleDateString('en-IE', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })
                                : ''}
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default function HomePage() {
    const [page, setPage] = useState(0);

    const { data: postsData, isLoading } = useQuery({
        queryKey: ['public-posts', page],
        queryFn: () => getPosts(page),
    });

    const { data: categories } = useQuery({
        queryKey: ['categories-with-posts'],
        queryFn: getCategoriesWithPosts,
    });

    const posts = postsData?.content ?? [];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-black/8 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link to="/" className="text-lg font-bold text-black tracking-tight">
                        my-blog
                    </Link>
                    <nav className="flex items-center gap-6">
                        {categories?.slice(0, 4).map(cat => (
                            <Link
                                key={cat.id}
                                to={`/categories/${cat.slug}`}
                                className="text-sm text-black/50 hover:text-black transition-colors"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                {isLoading ? (
                    <p className="text-sm text-black/40">Loading posts...</p>
                ) : posts.length === 0 ? (
                    <p className="text-sm text-black/40">No posts published yet.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {(postsData?.totalPages ?? 1) > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-12">
                                <button
                                    onClick={() => setPage(p => p - 1)}
                                    disabled={postsData?.first}
                                    className="text-sm px-4 py-2 rounded-full border border-black/10 disabled:opacity-30 hover:bg-black/5 transition-colors"
                                >
                                    ← Previous
                                </button>
                                <span className="text-sm text-black/40">
                                    {(postsData?.page ?? 0) + 1} / {postsData?.totalPages ?? 1}
                                </span>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={postsData?.last}
                                    className="text-sm px-4 py-2 rounded-full border border-black/10 disabled:opacity-30 hover:bg-black/5 transition-colors"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}