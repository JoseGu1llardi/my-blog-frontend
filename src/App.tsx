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

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-48 bg-white shadow-sm flex flex-col">
                <div className="px-4 py-5 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-900">Blog Admin</span>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-1">
                    <NavLink
                        to="/admin/posts"
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`
                        }
                    >
                        Posts
                    </NavLink>
                </nav>
                <div className="px-4 py-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">{user?.fullName}</p>
                    <button
                        onClick={logout}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 px-8 py-6">
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