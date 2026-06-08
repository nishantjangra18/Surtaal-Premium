import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';

// Use the same logo image the sidebar uses
const SurTaalLogo = () => (
    <div className="lm-brand">
        <img
            src="/surtaal-gold-logo.svg"
            alt="SurTaal"
            className="lm-brand-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
        />
        <span className="lm-brand-name">SURTAAL</span>
    </div>
);

const LoginModal = ({ onLoginSuccess }) => {
    const { loginModalOpen, loginModalContext, closeLoginModal, login, register } = useContext(AuthContext);

    const [mode, setMode]               = useState('prompt');
    const [email, setEmail]             = useState('');
    const [password, setPassword]       = useState('');
    const [username, setUsername]       = useState('');
    const [errors, setErrors]           = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading]         = useState(false);

    const emailRef    = useRef(null);
    const usernameRef = useRef(null);
    const modalRef    = useRef(null);

    // Reset when modal opens
    useEffect(() => {
        if (!loginModalOpen) return;
        setMode('prompt');
        setEmail('');
        setPassword('');
        setUsername('');
        setErrors({});
        setServerError('');
        setLoading(false);
    }, [loginModalOpen]);

    // Focus input when mode changes to login/signup
    useEffect(() => {
        if (loginModalOpen && mode === 'login') {
            requestAnimationFrame(() => {
                setTimeout(() => emailRef.current?.focus(), 30);
            });
        }
    }, [loginModalOpen, mode]);

    // Escape closes, Tab traps focus inside modal
    useEffect(() => {
        if (!loginModalOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') { closeLoginModal(); return; }
            if (e.key === 'Tab' && modalRef.current) {
                const focusable = Array.from(modalRef.current.querySelectorAll(
                    'button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
                ));
                if (!focusable.length) return;
                const first = focusable[0];
                const last  = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                } else {
                    if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [loginModalOpen, closeLoginModal]);

    if (!loginModalOpen) return null;

    const song    = loginModalContext?.song    || null;
    const message = loginModalContext?.message || null;

    const validate = () => {
        const e = {};
        if (mode === 'signup' && !username.trim()) e.username = 'Username is required';
        if (!email.trim())    e.email    = 'Email is required';
        if (!password.trim()) e.password = 'Password is required';
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setServerError('');
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        setLoading(true);
        const result = mode === 'login'
            ? await login(email, password)
            : await register(username, email, password);
        setLoading(false);
        if (!result.success) {
            setServerError(result.message || 'Something went wrong. Please try again.');
            return;
        }
        closeLoginModal();
        onLoginSuccess?.();
    };

    const switchMode = () => {
        setMode(m => m === 'login' ? 'signup' : 'login');
        setErrors({});
        setServerError('');
        // Re-focus after mode switch
        requestAnimationFrame(() => {
            setTimeout(() => {
                (mode === 'login' ? usernameRef.current : emailRef.current)?.focus();
            }, 30);
        });
    };

    if (mode === 'prompt') {
        return (
            <div
                className="lm-backdrop"
                role="presentation"
                onClick={(e) => { if (e.target === e.currentTarget) closeLoginModal(); }}
            >
                <div
                    className="lm-modal lm-prompt-modal"
                    role="dialog"
                    aria-modal="true"
                    ref={modalRef}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="lm-close"
                        onClick={closeLoginModal}
                        aria-label="Close"
                        type="button"
                    >×</button>

                    <div className="lm-prompt-icon" aria-hidden="true">🔒</div>
                    <h2 className="lm-heading">Login Required</h2>
                    <p className="lm-context-msg">
                        {message || 'Please login to continue.'}
                    </p>

                    <div className="lm-prompt-actions">
                        <button 
                            type="button" 
                            className="lm-btn-cancel" 
                            onClick={closeLoginModal}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="lm-submit" 
                            onClick={() => setMode('login')}
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        // Backdrop — click outside to close
        <div
            className="lm-backdrop"
            role="presentation"
            onClick={(e) => { if (e.target === e.currentTarget) closeLoginModal(); }}
        >
            {/* Modal — stop clicks from reaching backdrop */}
            <div
                className="lm-modal"
                role="dialog"
                aria-modal="true"
                aria-label={mode === 'login' ? 'Login to SurTaal' : 'Sign up for SurTaal'}
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    className="lm-close"
                    onClick={closeLoginModal}
                    aria-label="Close"
                    type="button"
                >×</button>

                {/* Branding — same logo as sidebar */}
                <SurTaalLogo />

                {/* Song block (PlaybackModal variant) */}
                {song && (
                    <div className="lm-song-block">
                        <img src={song.cover} alt={song.title} className="lm-song-cover" />
                        <div className="lm-song-info">
                            <span className="lm-song-title">{song.title}</span>
                            <span className="lm-song-artist">{song.singer || song.artist}</span>
                        </div>
                    </div>
                )}

                {/* Heading */}
                <h2 className="lm-heading">
                    {song
                        ? 'Login to listen to this song'
                        : mode === 'login'
                            ? 'Log in to SurTaal'
                            : 'Sign up to start listening'}
                </h2>

                {/* Contextual message */}
                {message && !song && (
                    <p className="lm-context-msg">{message}</p>
                )}

                {/* Server error */}
                {serverError && (
                    <div className="lm-server-error" role="alert">{serverError}</div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                    {mode === 'signup' && (
                        <div className="lm-field">
                            <label htmlFor="lm-username">Username</label>
                            <input
                                id="lm-username"
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={e => { setUsername(e.target.value); setErrors(p => ({ ...p, username: '' })); }}
                                className={errors.username ? 'lm-input error' : 'lm-input'}
                                autoComplete="username"
                                ref={usernameRef}
                            />
                            {errors.username && <span className="lm-field-error">{errors.username}</span>}
                        </div>
                    )}

                    <div className="lm-field">
                        <label htmlFor="lm-email">Email address</label>
                        <input
                            id="lm-email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                            className={errors.email ? 'lm-input error' : 'lm-input'}
                            autoComplete="email"
                            ref={emailRef}
                        />
                        {errors.email && <span className="lm-field-error">{errors.email}</span>}
                    </div>

                    <div className="lm-field">
                        <label htmlFor="lm-password">Password</label>
                        <input
                            id="lm-password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                            className={errors.password ? 'lm-input error' : 'lm-input'}
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        />
                        {errors.password && <span className="lm-field-error">{errors.password}</span>}
                    </div>

                    <button type="submit" className="lm-submit" disabled={loading}>
                        {loading
                            ? <span className="lm-spinner" aria-hidden="true" />
                            : mode === 'login' ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <hr className="lm-divider" />

                <div className="lm-switch">
                    <span>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</span>
                    <button type="button" className="lm-switch-btn" onClick={switchMode}>
                        {mode === 'login' ? 'Sign Up' : 'Log In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
