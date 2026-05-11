import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCategoriesWithPosts } from '../api/categories';
import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
    const { data: categories } = useQuery({
        queryKey: ['categories-with-posts'],
        queryFn: getCategoriesWithPosts,
    });

    return (
        <div className="min-h-screen bg-white">
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
                        <Link
                            to="/search"
                            className="text-sm text-black/50 hover:text-black transition-colors"
                        >
                            Search
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-6 py-12">
                {children}
            </main>
        </div>
    );
}