import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import type React from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to='/login' replace />;
}

function AdminDashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold text-gray-900">
                    Blog Admin
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                        {user?.fullName}
                    </span>
                    <button
                        onClick={logout}
                        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </header>
            <main className="px-8 py-6">
                <p className="text-gray-500 text-sm">Dashboard coming soon.</p>
            </main>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route
                path='/admin'
                element={
                    <ProtectedRoute>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
    );
}