import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getMeApi } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            getMeApi(token)
                .then((res) => setUser({ ...res.data, token }))
                .catch(() => {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        const res = await loginApi({ username, password });
        const { token, user: userData } = res.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setUser({ ...userData, token });
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
    };

    const isAdmin = () => user?.role === 'admin';
    const isDepartment = () => user?.role === 'department';
    const isAuthenticated = () => !!user;

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isDepartment, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
