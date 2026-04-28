import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import PostsPage from './pages/admin/PostsPage';
import type React from 'react';
import CreatePostPage from './pages/admin/CreatePostPage';
import EditPostPage from './pages/admin/EditPostPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to='/login' replace />;
}

function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();

    // Gera iniciais do nome
    const initials = user?.fullName
        .split(' ')
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase() ?? '?';

    return (
        <div className="min-h-screen bg-white flex">
            {/* Sidebar */}
            <aside className="w-60 bg-white border-r border-black/8 flex flex-col">
                <div className="px-4 py-6 border-b border-black/8">
                    <span className="text-base font-bold text-black tracking-tight">Blog Admin</span>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-0.5">
                    <NavLink
                        to="/admin/posts"
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-brand-light text-brand border-l-2 border-brand font-semibold'
                                    : 'text-black/60 hover:bg-black/5 hover:text-black'
                            }`
                        }
                    >
                        Posts
                    </NavLink>
                </nav>
                <div className="px-4 py-4 border-t border-black/8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-light text-brand flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">{user?.fullName}</p>
                        <button
                            onClick={logout}
                            className="text-xs text-black/40 hover:text-black transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 px-14 py-12">
                {children}
            </main>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route
                path='/admin/*'
                element={
                    <ProtectedRoute>
                        <AdminLayout>
                            <Routes>
                                <Route path='posts' element={<PostsPage />} />
                                <Route path='posts/new' element={<CreatePostPage />} />
                                <Route path='posts/:id/edit' element={<EditPostPage />} />
                                <Route index element={<Navigate to='posts' replace />} />
                            </Routes>
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />
            <Route path='*' element={<Navigate to='/admin' replace />} />
        </Routes>
    );
}