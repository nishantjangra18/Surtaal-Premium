import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// localStorage keys that must be cleared on logout and re-loaded on login
const USER_STORAGE_KEYS = [
    'st-liked',
    'st-recent',
    'st-listening-history',
    'st-custom-playlists',
];

export const AuthProvider = ({ children }) => {
    const [user, setUser]   = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // Login-modal state
    const [loginModalOpen,    setLoginModalOpen]    = useState(false);
    const [loginModalContext, setLoginModalContext] = useState(null);
    const [pendingAction,     setPendingAction]     = useState(null);

    // On mount, restore user from localStorage if token exists
    useEffect(() => {
        if (token) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
            }
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const API = import.meta.env.VITE_API_URL || '';
            const res = await axios.post(`${API}/api/auth/login`, { email, password });

            // ── Clear any previous user's data BEFORE setting new user ──
            USER_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));

            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            // Signal MusicContext to re-hydrate from backend for the new user
            window.dispatchEvent(new CustomEvent('surtaal-user-changed', {
                detail: { user: res.data.user, token: res.data.token }
            }));

            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (username, email, password) => {
        try {
            const API = import.meta.env.VITE_API_URL || '';
            await axios.post(`${API}/api/auth/register`, { username, email, password });
            return await login(email, password);
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Registration failed. Please check if the server is running.',
            };
        }
    };

    const logout = () => {
        // ── Clear ALL user-specific localStorage data on logout ──
        USER_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);
        setToken(null);

        // Signal MusicContext to reset all in-memory user data
        window.dispatchEvent(new CustomEvent('surtaal-user-changed', { detail: { user: null, token: null } }));
    };

    const updateUser = useCallback((updatedFields) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...updatedFields };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const requireLogin = useCallback((ctx = {}) => {
        setLoginModalContext({ message: ctx.message || null, song: ctx.song || null });
        setPendingAction(ctx.action || null);
        setLoginModalOpen(true);
    }, []);

    const closeLoginModal = useCallback(() => {
        setLoginModalOpen(false);
        setLoginModalContext(null);
        setPendingAction(null);
    }, []);

    return (
        <AuthContext.Provider value={{
            user, token,
            login, register, logout, updateUser,
            loginModalOpen, loginModalContext, pendingAction,
            setPendingAction, requireLogin, closeLoginModal,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
