import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getCategory, getPostsByCategory } from '../../api/categories';
import type { PostSummaryResponse } from '../../types/post';

function PostCard({ post }: { post: PostSummaryResponse }) {
    return (
        <Link to={`/posts/${post.slug}`} className="group block">
            <article className="border border-black/8 rounded-2xl overflow-hidden hover:border-black/20 transition-colors">
                {post.featuredImage ? (
                    <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                        <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                    </div>
                ) : (
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

export default function CategoryPage() {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState(0);

    const { data: category } = useQuery({
        queryKey: ['category', slug],
        queryFn: () => getCategory(slug!),
        enabled: !!slug,
    });

    const { data: postsData, isLoading } = useQuery({
        queryKey: ['category-posts', slug, page],
        queryFn: () => getPostsByCategory(slug!, page),
        enabled: !!slug,
    });

    const posts = postsData?.content ?? [];

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b border-black/8 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link to="/" className="text-lg font-bold text-black tracking-tight">
                        my-blog
                    </Link>
                    <Link to="/" className="text-sm text-black/40 hover:text-black transition-colors">
                        ← All posts
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-10">
                    {category?.icon && (
                        <span className="text-3xl mb-3 block">{category.icon}</span>
                    )}
                    <h1 className="text-4xl font-bold text-black tracking-tight mb-2">
                        {category?.name ?? '...'}
                    </h1>
                    {category?.description && (
                        <p className="text-base text-black/50">{category.description}</p>
                    )}
                </div>

                {isLoading ? (
                    <p className="text-sm text-black/40">Loading posts...</p>
                ) : posts.length === 0 ? (
                    <p className="text-sm text-black/40">No posts in this category yet.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post: PostSummaryResponse) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>

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