import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getPublishedPost } from '../../api/posts';

export default function PostPage() {
    const { slug } = useParams<{ slug: string }>();

    const { data: post, isLoading, isError } = useQuery({
        queryKey: ['post', slug],
        queryFn: () => getPublishedPost(slug!),
        enabled: !!slug,
    });

    if (isLoading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <p className="text-sm text-black/40">Loading...</p>
        </div>
    );

    if (isError || !post) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <p className="text-lg font-bold text-black mb-2">Post not found</p>
                <Link to="/" className="text-sm text-black/50 hover:text-black transition-colors">
                    ← Back to home
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-black/8 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <Link to="/" className="text-lg font-bold text-black tracking-tight">
                        my-blog
                    </Link>
                    <Link to="/" className="text-sm text-black/40 hover:text-black transition-colors">
                        ← All posts
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                {/* Categories */}
                {post.categories.length > 0 && (
                    <div className="flex gap-2 mb-4">
                        {post.categories.map(cat => (
                            <Link
                                key={cat.id}
                                to={`/categories/${cat.slug}`}
                                className="text-xs font-semibold text-black/50 uppercase tracking-widest hover:text-black transition-colors"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Title */}
                <h1 className="text-4xl font-bold text-black tracking-tight leading-tight mb-4">
                    {post.title}
                </h1>

                {/* Meta */}
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-black/8">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-black/8 flex items-center justify-center text-xs font-bold text-black/50">
                            {post.author.fullName[0]}
                        </div>
                        <span className="text-sm font-medium text-black/70">
                            {post.author.fullName}
                        </span>
                    </div>
                    {post.publishedAt && (
                        <span className="text-sm text-black/30">
                            {new Date(post.publishedAt).toLocaleDateString('en-IE', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                    )}
                    {post.readingTimeMinutes > 0 && (
                        <span className="text-sm text-black/30">
                            {post.readingTimeMinutes} min read
                        </span>
                    )}
                </div>

                {/* Featured image */}
                {post.featuredImage && (
                    <div className="rounded-2xl overflow-hidden mb-8">
                        <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none text-black/80 leading-relaxed">
                    {post.content.split('\n').map((paragraph, i) =>
                        paragraph.trim() ? (
                            <p key={i} className="mb-4 text-base leading-7 text-black/75">
                                {paragraph}
                            </p>
                        ) : null
                    )}
                </div>
            </main>
        </div>
    );
}