import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MusicContext } from '../context/MusicContext';

const defaultProfile = {
    displayName: '',
    username: '',
    bio: 'Indian classical moods, late-night drives, and fresh desi discoveries.',
    image: '',
    favoriteGenre: 'Bollywood',
    country: 'India',
    themePreference: 'SurTaal Signature',
    musicPreferences: 'Bollywood, Punjabi, Classical Fusion',
    accentColor: 'Soft Gold',
    cardStyle: 'Glass',
    animationIntensity: 'Balanced',
    compactMode: false,
    sidebarSize: 'Comfortable',
    language: 'English',
    privacyActivity: true,
    privacyPublic: true,
    privacyRecent: true,
    privacyStats: true,
    notifNewMusic: true,
    notifPlaylists: true,
    notifAnnounce: true,
    notifEmail: true,
};

const profileListeners = new Set();

const readProfile = (user) => {
    const userKey = user ? `st-profile-${user.id || user._id}` : 'st-profile-guest';
    try {
        const data = localStorage.getItem(userKey);
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed.themePreference === 'SurTaal Gold') {
                parsed.themePreference = 'SurTaal Signature';
            }
            return { ...defaultProfile, ...parsed };
        }
        return {
            ...defaultProfile,
            displayName: user ? (user.username || '') : '',
            username: user ? (user.username || '') : '',
            themePreference: 'SurTaal Signature',
        };
    } catch {
        return defaultProfile;
    }
};

const applyAppearance = (profile) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.dataset.themeVariant = profile.themePreference || 'SurTaal Signature';
    root.dataset.accentColor = profile.accentColor || 'Soft Gold';
    root.dataset.cardStyle = profile.cardStyle || 'Glass';
    root.dataset.animationIntensity = profile.animationIntensity || 'Balanced';
    root.dataset.compactMode = profile.compactMode ? 'true' : 'false';
    root.dataset.sidebarSize = profile.sidebarSize || 'Comfortable';
};

export const notifyToast = (message, type = 'success') => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('surtaal-toast', { detail: { message, type } }));
};

export const useProfileSettings = () => {
    const { user } = useContext(AuthContext);
    const userKey = user ? `st-profile-${user.id || user._id}` : 'st-profile-guest';
    const [profile, setProfileState] = useState(() => readProfile(user));

    useEffect(() => {
        const nextProfile = readProfile(user);
        setProfileState(nextProfile);
        applyAppearance(nextProfile);
    }, [user]);

    useEffect(() => {
        applyAppearance(profile);
        const listener = (nextProfile) => setProfileState(nextProfile);
        profileListeners.add(listener);
        return () => profileListeners.delete(listener);
    }, [profile]);

    const setProfile = (next) => {
        const currentProfile = readProfile(user);
        const value = typeof next === 'function' ? next(currentProfile) : next;
        localStorage.setItem(userKey, JSON.stringify(value));
        applyAppearance(value);
        setProfileState(value);
        profileListeners.forEach((listener) => {
            if (listener !== setProfileState) listener(value);
        });
        return value;
    };

    const resetProfile = () => {
        localStorage.removeItem(userKey);
        const defaultValue = {
            ...defaultProfile,
            displayName: user ? (user.username || '') : '',
            username: user ? (user.username || '') : '',
            themePreference: 'SurTaal Signature',
        };
        applyAppearance(defaultValue);
        setProfileState(defaultValue);
        profileListeners.forEach((listener) => {
            if (listener !== setProfileState) listener(defaultValue);
        });
    };

    return [profile, setProfile, resetProfile];
};

const toTitleCase = (value = '') => value
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const profileName = (user, profile) => {
    const displayName = toTitleCase(profile?.displayName || '');
    if (displayName) return displayName;
    return toTitleCase(user?.username || '') || 'Music Lover';
};

const getDisplayName = (fullName) => {
    if (!fullName) return 'Music Lover';
    let name = fullName.trim();
    if (name.includes(' ')) {
        return name.split(' ')[0];
    }
    const camelParts = name.split(/(?=[A-Z])/);
    if (camelParts.length > 1 && camelParts[0].length > 1) {
        return camelParts[0];
    }
    name = name.replace(/\d+$/, '');
    if (name.length > 8) {
        if (name.toLowerCase().startsWith('nishang')) {
            return 'Nishang';
        }
        if (name.toLowerCase().startsWith('nishant')) {
            return 'Nishant';
        }
        name = name.slice(0, 7);
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
};

const usernameHandle = (user, profile) => {
    const uname = profile?.username || user?.username || 'musiclover';
    return `@${uname.toLowerCase()}`;
};

const GeneratedAvatar = ({ user, profile, size = 'large' }) => {
    const initial = profileName(user, profile).charAt(0).toUpperCase();
    if (profile.image) {
        return <img className={`profile-avatar-img ${size}`} src={profile.image} alt={profileName(user, profile)} />;
    }

    return (
        <div className={`profile-generated-avatar ${size}`}>
            <span>{initial}</span>
            <small>♪</small>
        </div>
    );
};

const StatTile = ({ label, value }) => (
    <div className="profile-stat-tile">
        <span>{label}</span>
        <strong>{value}</strong>
    </div>
);

const GoldVerifiedBadge = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="premium-verified-badge" style={{ color: 'var(--amber)', marginLeft: '6px', display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
);

const ChevronRight = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="option-chevron" style={{ opacity: 0.6 }}>
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const { likedSongs, recentlyPlayed, customPlaylists, listeningHistory, navigateTo } = useContext(MusicContext);
    const [profile] = useProfileSettings();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigateTo('home');
        }
    };

    const handleLogout = () => {
        logout();
    };

    if (isMobile) {
        return (
            <div className="profile-view mobile-profile-view">
                <button className="mobile-back-btn" onClick={handleBack} aria-label="Back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                {/* 1. Large Hero Card */}
                <section className="profile-card mobile-hero-profile-card">
                    <div className="mobile-profile-avatar-wrap">
                        <GeneratedAvatar user={user} profile={profile} size="large" />
                    </div>
                    <div className="mobile-profile-identity">
                        <h1>{profileName(user, profile)}</h1>
                        <span className="profile-username">{usernameHandle(user, profile)}</span>
                    </div>
                </section>

                {/* 2. Four Action Menu Cards */}
                <div className="mobile-profile-menu-container">
                    <button className="mobile-profile-menu-item" onClick={() => navigateTo('edit-profile')}>
                        <span>Edit Profile</span>
                        <ChevronRight />
                    </button>
                    <button className="mobile-profile-menu-item" onClick={() => navigateTo('history')}>
                        <span>Listening History</span>
                        <ChevronRight />
                    </button>
                    <button className="mobile-profile-menu-item" onClick={() => navigateTo('settings')}>
                        <span>Account Settings</span>
                        <ChevronRight />
                    </button>
                    <button className="mobile-profile-menu-item logout-item" onClick={handleLogout}>
                        <span>Logout</span>
                        <ChevronRight />
                    </button>
                </div>
            </div>
        );
    }

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : '—';

    return (
        <div className="profile-view">
            <button className="mobile-back-btn" onClick={handleBack} aria-label="Back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>
            <section className="profile-card hero-profile-card">
                <GeneratedAvatar user={user} profile={profile} />
                <div className="profile-identity">
                    <span className="profile-kicker">View Profile</span>
                    <h1>{profileName(user, profile)}</h1>
                    <span className="profile-username">{usernameHandle(user, profile)}</span>
                    <p>{profile.bio}</p>
                    <div className="profile-actions">
                        <button onClick={() => navigateTo('edit-profile')}>Edit Profile</button>
                        <button onClick={() => navigateTo('history')}>Listening History</button>
                    </div>
                </div>
            </section>

            <section className="profile-grid">
                <StatTile label="Display Name"    value={profileName(user, profile)} />
                <StatTile label="Username"        value={usernameHandle(user, profile)} />
                <StatTile label="Member Since"    value={memberSince} />
                <StatTile label="Liked Songs"     value={likedSongs.length || '—'} />
                <StatTile label="Playlists"       value={customPlaylists.length || '—'} />
                <StatTile label="Recently Played" value={recentlyPlayed.length || '—'} />
            </section>
        </div>
    );
};

const EditProfilePage = () => {
    return <SettingsPage panel="settings" />;
};

const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="settings-toggle-row">
        <div className="toggle-info">
            <span className="toggle-label">{label}</span>
            {description && <span className="toggle-desc">{description}</span>}
        </div>
        <label className="st-switch">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="st-slider" />
        </label>
    </div>
);

const SettingsPage = ({ panel = 'settings' }) => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useContext(AuthContext);
    const { navigateTo, showToast, activeView } = useContext(MusicContext);
    const [profile, setProfile, resetProfile] = useProfileSettings();

    // Local drafts for Account settings form
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');

    // Security Form states
    const [currPassword, setCurrPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingSecurity, setIsSavingSecurity] = useState(false);

    // Profile form saving state
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Delete confirmation modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [activeTab, setActiveTab] = useState(() => {
        if (panel === 'appearance') return 'appearance';
        if (panel === 'account' || panel === 'settings') return 'account';
        if (panel === 'profile' || panel === 'edit-profile') return 'profile';
        return 'profile';
    });

    // Sync draft values with active profile when they load or when user changes
    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName || '');
            setUsername(profile.username || '');
            setBio(profile.bio || '');
            setAvatar(profile.image || '');
        }
    }, [profile]);

    useEffect(() => {
        if (activeView === 'edit-profile') {
            setActiveTab('profile');
        } else if (activeView === 'settings') {
            setActiveTab('account');
        } else if (activeView === 'appearance') {
            setActiveTab('appearance');
        }
    }, [activeView]);

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigateTo('home');
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
            showToast('Username cannot be empty', 'error');
            return;
        }
        setIsSavingProfile(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            // Update profile settings
            setProfile((prev) => ({
                ...prev,
                displayName: displayName.trim(),
                username: trimmedUsername,
                bio: bio.trim(),
                image: avatar,
            }));
            // Update user in AuthContext so global references propagate
            updateUser({ username: trimmedUsername });
            showToast('✓ Profile updated successfully');
        } catch {
            showToast('Failed to save profile changes', 'error');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image file size must be less than 5MB', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setAvatar(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = () => {
        setAvatar('');
    };

    const handleSaveSecurity = async (e) => {
        e.preventDefault();
        if (!currPassword || !newPassword || !confirmPassword) {
            showToast('All password fields are required', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        setIsSavingSecurity(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 400));
            showToast('✓ Password updated (mock)');
            setCurrPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            showToast('Failed to update password', 'error');
        } finally {
            setIsSavingSecurity(false);
        }
    };

    const handleLogoutAllDevices = async () => {
        showToast('✓ Logged out of all other devices (mock)');
    };

    const handleDeleteAccount = async () => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setDeleteModalOpen(false);
            // Clear profile settings from local storage
            resetProfile();
            // Logout
            logout();
            showToast('✓ Account deleted successfully (mock)');
            navigateTo('home');
        } catch {
            showToast('Failed to delete account', 'error');
        }
    };

    // Generic helper to update single fields instantly (for switches / simple inputs)
    const updateField = (key, val, msg) => {
        try {
            setProfile((prev) => ({ ...prev, [key]: val }));
            if (msg) showToast(msg);
        } catch {
            showToast('Failed to update settings', 'error');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'account', label: 'Account' },
        { id: 'appearance', label: 'Appearance' },
    ];

    return (
        <div className="profile-view">
            <button className="mobile-back-btn" onClick={handleBack} aria-label="Back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            <div className="settings-layout">
                {/* Unified top sub-navigation bar */}
                <div className="settings-subnav">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-subnav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Render Panels */}
                {activeTab === 'profile' && (
                    <form className="settings-card" onSubmit={handleSaveProfile}>
                        <h3>Profile Customization</h3>
                        <div className="settings-avatar-editor">
                            <GeneratedAvatar user={user} profile={{ image: avatar, displayName }} size="large" />
                            <div className="settings-avatar-actions">
                                <label className="btn-upload-label">
                                    Change Picture
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} />
                                </label>
                                {avatar && (
                                    <button type="button" className="btn-ghost-danger" onClick={handleRemoveAvatar}>
                                        Remove Picture
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="settings-form-grid">
                            <div className="settings-field">
                                <label htmlFor="st-display-name">Display Name</label>
                                <input
                                    id="st-display-name"
                                    className="settings-input"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Enter display name"
                                />
                            </div>
                            <div className="settings-field">
                                <label htmlFor="st-username">Username</label>
                                <input
                                    id="st-username"
                                    className="settings-input"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                />
                            </div>
                            <div className="settings-field wide">
                                <label htmlFor="st-bio">Bio</label>
                                <textarea
                                    id="st-bio"
                                    className="settings-textarea"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Write something about yourself..."
                                />
                            </div>
                        </div>
                        <div className="settings-actions">
                            <button type="submit" className="btn-settings-save" disabled={isSavingProfile}>
                                {isSavingProfile ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'account' && (
                    <>
                        {/* Account Details Section */}
                        <div className="settings-card">
                            <h3>Account Information</h3>
                            <div className="settings-info-row">
                                <span className="settings-info-label">Email Address</span>
                                <span className="settings-info-value">{user?.email || '—'}</span>
                            </div>
                            <div className="settings-info-row">
                                <span className="settings-info-label">Member Since</span>
                                <span className="settings-info-value">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                </span>
                            </div>
                            <div className="settings-info-row">
                                <span className="settings-info-label">Account Type</span>
                                <span className="settings-info-value">
                                    Free <span className="badge-premium-tag">⭐ Premium Coming Soon</span>
                                </span>
                            </div>
                        </div>

                        {/* Security Section */}
                        <form className="settings-card" onSubmit={handleSaveSecurity}>
                            <h3>Security</h3>
                            <div className="settings-form-grid">
                                <div className="settings-field">
                                    <label htmlFor="st-curr-pass">Current Password</label>
                                    <input
                                        id="st-curr-pass"
                                        type="password"
                                        className="settings-input"
                                        value={currPassword}
                                        onChange={(e) => setCurrPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label htmlFor="st-new-pass">New Password</label>
                                    <input
                                        id="st-new-pass"
                                        type="password"
                                        className="settings-input"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label htmlFor="st-confirm-pass">Confirm New Password</label>
                                    <input
                                        id="st-confirm-pass"
                                        type="password"
                                        className="settings-input"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="settings-actions" style={{ gap: '12px', alignItems: 'center' }}>
                                <button type="button" className="btn-ghost-danger" style={{ color: 'var(--amber)' }} onClick={handleLogoutAllDevices}>
                                    Logout All Devices
                                </button>
                                <button type="submit" className="btn-settings-save" disabled={isSavingSecurity}>
                                    {isSavingSecurity ? 'Updating...' : 'Change Password'}
                                </button>
                            </div>
                        </form>

                        {/* Danger Zone */}
                        <div className="settings-card danger-zone">
                            <h3>Danger Zone</h3>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                                <button type="button" className="btn-ghost-danger" onClick={logout} style={{ border: '1px solid rgba(255, 92, 92, 0.3)' }}>
                                    Logout
                                </button>
                                <button type="button" className="btn-danger-filled" onClick={() => setDeleteModalOpen(true)}>
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'appearance' && (
                    <div className="settings-card">
                        <h3>Theme & Interface Options</h3>
                        <p className="toggle-desc" style={{ marginBottom: '20px' }}>Select an app theme dynamically. Updates are applied instantly.</p>

                        <div className="themes-grid">
                            {[
                                { id: 'SurTaal Signature', name: 'SurTaal Signature', desc: 'Luxury black + gold, warm amber gradients, golden active glows.', color: '#D4A15D' },
                                { id: 'Obsidian', name: 'Obsidian', desc: 'Pure black background, white typography, silver accents, minimal glow.', color: '#ffffff' },
                            ].map(t => (
                                <div
                                    key={t.id}
                                    className={`theme-card ${profile.themePreference === t.id ? 'active' : ''}`}
                                    onClick={() => updateField('themePreference', t.id, `Theme changed to ${t.name}`)}
                                >
                                    <div className="theme-color-preview" style={{ background: t.id === 'Obsidian' ? '#000000' : '#080808' }}>
                                        <span className="theme-color-dot" style={{ background: t.color }} />
                                        <span className="theme-color-text" style={{ color: '#ffffff' }}>Aa</span>
                                    </div>
                                    <div className="theme-card-info">
                                        <span className="theme-card-name">{t.name}</span>
                                        <span className="theme-card-desc">{t.desc}</span>
                                    </div>
                                    {profile.themePreference === t.id && (
                                        <div className="theme-card-checkmark" aria-hidden="true">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <hr style={{ border: 'none', height: '1px', background: 'rgba(212, 161, 93, 0.1)', margin: '24px 0' }} />

                        <div className="settings-form-grid">
                            <div className="settings-field">
                                <label htmlFor="st-accent-color">Accent Color</label>
                                <select
                                    id="st-accent-color"
                                    className="settings-select"
                                    value={profile.accentColor}
                                    onChange={(e) => updateField('accentColor', e.target.value, 'Accent color updated')}
                                >
                                    <option>Soft Gold</option>
                                    <option>Warm Amber</option>
                                    <option>Burnt Copper</option>
                                </select>
                            </div>
                            <div className="settings-field">
                                <label htmlFor="st-card-style">Card Style</label>
                                <select
                                    id="st-card-style"
                                    className="settings-select"
                                    value={profile.cardStyle}
                                    onChange={(e) => updateField('cardStyle', e.target.value, 'Card style updated')}
                                >
                                    <option>Glass</option>
                                    <option>Layered</option>
                                    <option>Compact</option>
                                </select>
                            </div>
                            <div className="settings-field">
                                <label htmlFor="st-sidebar-size">Sidebar Size</label>
                                <select
                                    id="st-sidebar-size"
                                    className="settings-select"
                                    value={profile.sidebarSize}
                                    onChange={(e) => updateField('sidebarSize', e.target.value, 'Sidebar size updated')}
                                >
                                    <option>Comfortable</option>
                                    <option>Compact</option>
                                    <option>Expanded</option>
                                </select>
                            </div>
                            <div className="settings-field">
                                <label htmlFor="st-motion">Animation Intensity</label>
                                <select
                                    id="st-motion"
                                    className="settings-select"
                                    value={profile.animationIntensity}
                                    onChange={(e) => updateField('animationIntensity', e.target.value, 'Animation intensity updated')}
                                >
                                    <option>Balanced</option>
                                    <option>Subtle</option>
                                    <option>Expressive</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <ToggleSwitch
                                checked={profile.compactMode}
                                onChange={(e) => updateField('compactMode', e.target.checked, e.target.checked ? 'Compact mode enabled' : 'Compact mode disabled')}
                                label="Compact Playback Mode"
                                description="Minimize spacing and optimize player controls layout."
                            />
                        </div>

                        <div className="settings-actions" style={{ marginTop: '24px' }}>
                            <button type="button" className="btn-ghost-danger" style={{ color: 'var(--amber)' }} onClick={resetProfile}>
                                Reset Preferences to Defaults
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Danger Confirmation Modal */}
            {deleteModalOpen && (
                <div className="lm-backdrop" style={{ zIndex: 10005 }} role="presentation" onClick={() => setDeleteModalOpen(false)}>
                    <div className="lm-modal settings-confirm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                        <button className="lm-close" onClick={() => setDeleteModalOpen(false)} aria-label="Close" type="button">×</button>
                        <div className="lm-prompt-icon" aria-hidden="true">⚠️</div>
                        <h2 className="lm-heading">Delete Account</h2>
                        <p className="lm-context-msg" style={{ margin: '14px 0 24px' }}>
                            Are you sure you want to delete your account? This action is permanent and will erase all your custom playlists, liked songs, and profile data from the application session.
                        </p>
                        <div className="lm-prompt-actions">
                            <button type="button" className="lm-btn-cancel" onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </button>
                            <button type="button" className="btn-danger-filled" onClick={handleDeleteAccount} style={{ flex: 1 }}>
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export { ProfilePage, EditProfilePage, SettingsPage, GeneratedAvatar, profileName, usernameHandle, getDisplayName };
