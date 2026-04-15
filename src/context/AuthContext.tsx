import type { ReactNode } from 'react';
import { logout as logoutApi } from '../api/auth';
import type { AuthResponse } from '../types/auth';
import { createContext, useContext, useState } from 'react';

interface AuthContextType {
    token: string | null;
    user: Omit<AuthResponse, 'token'> | null;
    login: (data: AuthResponse) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem('token')
    );
    const [user, setUser] = useState<Omit<AuthResponse, 'token'> | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    function login(data: AuthResponse) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            username: data.username,
            fullName: data.fullName,
        }));
        setToken(data.token);
        setUser({ username: data.username, fullName: data.fullName });
    }

    async function logout() {
        try {
            await logoutApi();
        } catch (error) {
            console.error('Logout failed:', error); 
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider value={{
            token,
            user,
            login,
            logout,
            isAuthenticated: !!token
        }}>
            { children }
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}