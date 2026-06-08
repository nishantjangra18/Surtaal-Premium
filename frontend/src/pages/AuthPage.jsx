import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        let res;
        if (mode === 'login') {
            res = await login(formData.email, formData.password);
        } else {
            res = await register(formData.username, formData.email, formData.password);
        }

        setLoading(false);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
        }
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError('');
    };

    return (
        <div className="auth-page">
            <div className="auth-logo" onClick={() => navigate('/')}>
                <img src="/surtaal-gold-logo.svg" alt="SurTaal" />
            </div>

            <div className="auth-card">
                <h1>{mode === 'login' ? 'Log in to SurTaal' : 'Sign up to start listening'}</h1>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                className="form-input"
                                placeholder="Enter a username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                autoComplete="username"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="name@example.com"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        />
                    </div>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span className="spinner"></span>
                                Processing...
                            </span>
                        ) : (
                            mode === 'login' ? 'Log In' : 'Sign Up'
                        )}
                    </button>
                </form>

                <hr className="auth-divider" />

                <div className="auth-switch">
                    <p>{mode === 'login' ? "Don't have an account?" : "Already have an account?"}</p>
                    <button onClick={switchMode}>
                        {mode === 'login' ? 'Sign up for SurTaal' : 'Log in to SurTaal'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
