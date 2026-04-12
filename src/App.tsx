import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import type React from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{ children }</> : <Navigate to='/login' replace />
}

export default function App() {
    return (
        <Routes>
            <Route path='/login' element={ <LoginPage /> } />
            <Route
                path='/admin'
                element={
                    <ProtectedRoute>
                        <div className="p-8 text-gray-900">
                            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                            <p className="mt-2 text-gray-500">You are logged in.</p>
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route path='*' element={ <Navigate to='/login' replace /> } />
        </Routes>
    )
}