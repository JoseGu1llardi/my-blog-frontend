import { Link } from 'react-router-dom';
import type { PostSummaryResponse } from '../types/post';

export default function PostCard({ post }: { post: PostSummaryResponse }) {
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