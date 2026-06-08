import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MusicContext } from '../context/MusicContext';
import { musicService } from '../services/musicService';
import { GeneratedAvatar, useProfileSettings } from './ProfileViews';

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
);
const MicIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
    </svg>
);
const BellIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
    </svg>
);

// Animated equalizer bars — shown while a song from this dropdown is playing
const Equalizer = () => (
    <span className="search-eq" aria-label="Now playing" title="Now Playing">
        <span className="search-eq-bar" />
        <span className="search-eq-bar" />
        <span className="search-eq-bar" />
        <span className="search-eq-bar" />
    </span>
);

// Spinner for loading state
const MiniSpinner = () => (
    <span className="search-mini-spinner" aria-label="Loading" />
);

const Navbar = () => {
    const navigate   = useNavigate();
    const { user, logout }                      = useContext(AuthContext);
    const { playSpotifySong, currentSong, isPlaying, navigateTo, showToast } = useContext(MusicContext);
    const [profile]                             = useProfileSettings();

    const [query,         setQuery]         = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError,   setSearchError]   = useState('');
    const [showDropdown,  setShowDropdown]  = useState(false);
    const [showUserMenu,  setShowUserMenu]  = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [voiceActive, setVoiceActive] = useState(false);

    // Which song is currently loading (clicked but not yet playing)
    const [loadingId, setLoadingId] = useState(null);

    const dropdownRef    = useRef(null);
    const userMenuRef    = useRef(null);
    const notificationRef = useRef(null);
    const searchInputRef = useRef(null);
    const debounceRef    = useRef(null);
    const notificationKey = `st-notifications-${user?.id || user?._id || user?.username || 'guest'}`;

    useEffect(() => {
        const fallbackNotifications = [
            { id: 'release', title: 'New release from favorite artists', body: 'Fresh tracks are ready in your recommendations.', type: 'release', read: false },
            { id: 'recs', title: 'New recommendations', body: 'Your SurTaal mix has been refreshed.', type: 'recommendation', read: false },
            { id: 'playlist', title: 'Playlist updates', body: 'Punjabi Hits and Bollywood Romance have new picks.', type: 'playlist', read: false },
            { id: 'trending', title: 'Trending songs in India', body: 'Explore what listeners are playing today.', type: 'trending', read: false },
            { id: 'recent', title: 'Recently added tracks', body: 'New music has been added to discovery sections.', type: 'new', read: false },
        ];
        try {
            const saved = JSON.parse(localStorage.getItem(notificationKey) || 'null');
            if (Array.isArray(saved) && saved.length) {
                setNotifications(saved);
            } else {
                setNotifications(fallbackNotifications);
                localStorage.setItem(notificationKey, JSON.stringify(fallbackNotifications));
            }
        } catch {
            setNotifications(fallbackNotifications);
        }
    }, [notificationKey]);

    const persistNotifications = (next) => {
        setNotifications(next);
        localStorage.setItem(notificationKey, JSON.stringify(next));
    };

    // ── Search logic ─────────────────────────────────────────────────────────
    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed || trimmed.length < 2) {
            clearTimeout(debounceRef.current);
            setSearchResults([]);
            setSearchLoading(false);
            setSearchError('');
            setShowDropdown(false);
            setLoadingId(null);
            return;
        }
        setShowDropdown(true);
        setSearchLoading(true);
        setSearchError('');
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await musicService.searchSongs(trimmed, { limit: 7 });
                setSearchResults(results);
                setShowDropdown(true);
            } catch (error) {
                setSearchResults([]);
                setSearchError('Search unavailable. Is the backend running?');
                setShowDropdown(true);
            } finally {
                setSearchLoading(false);
            }
        }, 350);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    // Clear loadingId once the song actually starts playing
    useEffect(() => {
        if (isPlaying && currentSong && loadingId) {
            const playingKey = currentSong.spotifyId || currentSong.id || currentSong.src || currentSong.title;
            if (playingKey === loadingId) {
                setLoadingId(null);
            }
        }
    }, [isPlaying, currentSong, loadingId]);

    // ── Outside click — close dropdown ────────────────────────────────────────
    useEffect(() => {
        const handleMouseDown = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, []);

    // ── Ctrl+K ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const handleShortcut = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
                if (query.trim().length >= 2) setShowDropdown(true);
            }
        };
        window.addEventListener('keydown', handleShortcut);
        return () => window.removeEventListener('keydown', handleShortcut);
    }, [query]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleInputChange = (e) => setQuery(e.target.value);

    const handleSearchEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    const handleSuggestionClick = (song, idx) => {
        const songKey = song.spotifyId || song.id || song.src || song.title;
        setLoadingId(songKey);
        // ── DO NOT clear query or hide dropdown ──
        // Results stay visible; row highlights immediately
        playSpotifySong(song, 'Search', searchResults, idx);
    };

    const handleSeeAll = () => {
        clearTimeout(debounceRef.current);
        setShowDropdown(false);
        navigateTo('search', { query: query.trim() });
    };

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast('Voice search is not supported in this browser', 'error');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        setVoiceActive(true);
        recognition.onresult = (event) => {
            const spoken = event.results?.[0]?.[0]?.transcript || '';
            const cleaned = spoken.replace(/^play\s+/i, '').trim();
            if (cleaned.length >= 2) {
                setQuery(cleaned);
                setShowDropdown(false);
                navigateTo('search', { query: cleaned });
            }
        };
        recognition.onerror = () => showToast('Voice search failed. Please try again.', 'error');
        recognition.onend = () => setVoiceActive(false);
        recognition.start();
    };

    const toggleNotifications = () => {
        const nextOpen = !showNotifications;
        setShowNotifications(nextOpen);
        if (nextOpen) {
            persistNotifications(notifications.map(item => ({ ...item, read: true })));
        }
    };

    const openProfileView = (view) => {
        navigateTo(view);
        setShowUserMenu(false);
    };

    // Helper: is this song the currently playing one?
    const isSongActive = (song) => {
        if (!currentSong) return false;
        const key   = song.spotifyId || song.id || song.src || song.title;
        const cKey  = currentSong.spotifyId || currentSong.id || currentSong.src || currentSong.title;
        return key === cKey;
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="navbar">
            <div className="search-wrapper" ref={dropdownRef}>
                <span className="search-icon"><SearchIcon /></span>
                <input
                    ref={searchInputRef}
                    type="text"
                    className="search-input"
                    placeholder="What do you want to play?"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleSearchEnter}
                    onFocus={() => { if (query.trim().length >= 2) setShowDropdown(true); }}
                    autoComplete="off"
                />

                {showDropdown && (
                    <div className="suggestions-dropdown">
                        {searchLoading ? (
                            <div className="search-status-msg">Searching…</div>
                        ) : searchError ? (
                            <div className="search-status-msg">{searchError}</div>
                        ) : searchResults.length > 0 ? (
                            <>
                                {searchResults.map((song, idx) => {
                                    const songKey  = song.spotifyId || song.id || song.src || song.title;
                                    const loading  = loadingId === songKey;
                                    const active   = isSongActive(song) && isPlaying;

                                    return (
                                        <div
                                            key={songKey || idx}
                                            className={`suggestion-item${active ? ' suggestion-active' : ''}${loading ? ' suggestion-loading' : ''}`}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleSuggestionClick(song, idx);
                                            }}
                                        >
                                            <div className="suggestion-cover-wrap">
                                                <img src={song.cover} alt={song.title} />
                                                {active && <div className="suggestion-cover-overlay" />}
                                            </div>
                                            <div className="suggestion-text">
                                                <div className={`song-title${active ? ' active-title' : ''}`}>
                                                    {song.title}
                                                </div>
                                                <div className="song-artist">{song.singer} · {song.album}</div>
                                            </div>
                                            <div className="suggestion-status">
                                                {loading && <MiniSpinner />}
                                                {active  && <Equalizer />}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div
                                    className="suggestion-item suggestion-see-all"
                                    onMouseDown={(e) => { e.preventDefault(); handleSeeAll(); }}
                                >
                                    See all results for "{query}"
                                </div>
                            </>
                        ) : (
                            <div className="search-status-msg">No results for "{query}"</div>
                        )}
                    </div>
                )}
            </div>

            <div className="auth-section">
                <button className={`nav-icon-btn ${voiceActive ? 'listening' : ''}`} title="Voice search" onClick={handleVoiceSearch}><MicIcon /></button>
                <div className="notification-wrapper" ref={notificationRef}>
                    <button className="nav-icon-btn notification-trigger" title="Notifications" onClick={toggleNotifications}>
                        <BellIcon />
                        {notifications.some(item => !item.read) && <span className="notification-dot" />}
                    </button>
                    {showNotifications && (
                        <aside className="notifications-panel">
                            <div className="notifications-header">
                                <span>Music Notifications</span>
                                <button onClick={() => persistNotifications([])}>Clear</button>
                            </div>
                            {notifications.length === 0 ? (
                                <p className="notifications-empty">No new music updates yet.</p>
                            ) : notifications.map(item => (
                                <button
                                    key={item.id}
                                    className="notification-item"
                                    onClick={() => {
                                        setShowNotifications(false);
                                        navigateTo(item.type === 'trending' ? 'search' : 'home', item.type === 'trending' ? { query: 'Trending India' } : null);
                                    }}
                                >
                                    <strong>{item.title}</strong>
                                    <span>{item.body}</span>
                                </button>
                            ))}
                        </aside>
                    )}
                </div>

                {user ? (
                    <div className="user-section" ref={userMenuRef}>
                        <div className="user-avatar" onClick={() => setShowUserMenu(!showUserMenu)}>
                            <GeneratedAvatar user={user} profile={profile} size="nav" />
                        </div>
                        {showUserMenu && (
                            <div className="user-dropdown">
                                {user && user.role === 'admin' && (
                                    <button 
                                        style={{ color: '#d4a15d', fontWeight: 'bold' }} 
                                        onClick={() => { navigate('/admin'); setShowUserMenu(false); }}
                                    >
                                        🛡️ Admin Panel
                                    </button>
                                )}
                                <button onClick={() => openProfileView('profile')}>View Profile</button>
                                <button onClick={() => openProfileView('history')}>Listening History</button>
                                <button onClick={() => openProfileView('settings')}>Account Settings</button>
                                <button onClick={() => { logout(); setShowUserMenu(false); }}>Log out</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <button className="btn-signup" onClick={() => navigate('/login')}>Sign Up</button>
                        <button className="btn-login" onClick={() => navigate('/login')}>Log in</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;
