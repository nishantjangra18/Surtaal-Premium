import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicContext } from '../context/MusicContext';
import { AuthContext } from '../context/AuthContext';
import PlaylistCover from './PlaylistCover';

// No data.js imports — library shows only the logged-in user's actual playlists

const HomeIcon     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>;
const PremiumIcon  = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 16L3 5l5.5 6L12 4l3.5 7L21 5l-2 11H5zm14 3H5v-2h14v2z" />
    </svg>
);
const RequestIcon  = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H7v-2h10v2zm0-3H7V9h10v2zm0-3H7V6h10v2z"/>
    </svg>
);
const HeartIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>;
const LibraryIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>;
const ChevronRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>;
const PlusIcon     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>;

const Sidebar = () => {
    const navigate = useNavigate();
    const {
        navigateTo, activeView, activeViewData,
        likedSongs, customPlaylists, setCreatePlaylistOpen,
        setRequestModalOpen,
    } = useContext(MusicContext);
    const { user, requireLogin } = useContext(AuthContext);

    const isActive = (id) => activeViewData?.id === id || activeViewData?.name === id;

    const handleCreatePlaylist = () => {
        if (!user) {
            requireLogin({
                message: 'Login to create and manage playlists.',
                action: { type: 'createPlaylist' },
            });
            return;
        }
        setCreatePlaylistOpen(true);
    };

    const handleRequestSongClick = () => {
        if (!user) {
            requireLogin({
                message: 'Login to request songs, artists, or features.',
                action: { type: 'openRequestModal' },
            });
            return;
        }
        navigateTo('request-song');
    };

    return (
        <div className="sidebar sidebar-library-focused">
            {/* ── Logo ── */}
            <div className="sidebar-logo" onClick={() => navigateTo('home')}>
                <div className="logo-ornament" aria-hidden="true">
                    <svg viewBox="0 0 100 100" width="52" height="52">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(212,161,93,0.15)" strokeWidth="0.8"/>
                        <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(212,161,93,0.1)"  strokeWidth="0.5"/>
                        <circle cx="50" cy="50" r="26" fill="none" stroke="rgba(212,161,93,0.08)" strokeWidth="0.5"/>
                        {[0,30,60,90,120,150].map(a => (
                            <line key={a} x1="50" y1="4" x2="50" y2="96"
                                stroke="rgba(212,161,93,0.06)" strokeWidth="0.4"
                                transform={`rotate(${a} 50 50)`}/>
                        ))}
                    </svg>
                </div>
                <img src="/surtaal-gold-logo.svg" alt="SurTaal" className="logo-img" />
                <div className="logo-text">
                    <span className="logo-brand">SURTAAL</span>
                    <span className="logo-tagline">Suron ka Safar</span>
                </div>
            </div>

            {/* ── Nav ── */}
            <div className="sidebar-nav">
                <div
                    className={`sidebar-nav-item ${activeView === 'home' ? 'active' : ''}`}
                    onClick={() => navigateTo('home')}
                >
                    <HomeIcon /><span>Home</span>
                    {activeView === 'home' && <span className="nav-chevron"><ChevronRight /></span>}
                </div>
                <div
                    className={`sidebar-nav-item ${activeView === 'premium' ? 'active' : ''}`}
                    onClick={() => navigateTo('premium')}
                >
                    <PremiumIcon /><span>Premium</span>
                </div>
                <div
                    className="sidebar-nav-item"
                    onClick={handleRequestSongClick}
                >
                    <RequestIcon /><span>Request Song</span>
                </div>
                {user && user.role === 'admin' && (
                    <div
                        className="sidebar-nav-item admin-sidebar-link"
                        style={{ color: '#d4a15d', fontWeight: 'bold' }}
                        onClick={() => navigate('/admin')}
                    >
                        <span style={{ fontSize: '18px' }}>🛡️</span><span>Admin Panel</span>
                    </div>
                )}
            </div>


            <div className="sidebar-divider" />

            {/* ── Library header ── */}
            <div className="sidebar-header">
                <div className="library-label">
                    <LibraryIcon />
                    <span>Your Library</span>
                </div>
                <button
                    className="add-btn"
                    title="Create playlist"
                    aria-label="Create playlist"
                    onClick={handleCreatePlaylist}
                >
                    <PlusIcon />
                </button>
            </div>

            {/* ── Library content ── */}
            <div className="sidebar-playlists">

                {/* Logged-out state */}
                {!user && (
                    <div className="library-empty-state">
                        <p>Login to access your playlists, liked songs, and history.</p>
                        <button
                            className="library-login-btn"
                            onClick={() => requireLogin({ message: 'Login to access your playlists.' })}
                        >
                            Login
                        </button>
                    </div>
                )}

                {/* Logged-in — user's own data only */}
                {user && (
                    <>
                        {/* Liked Songs — always visible when logged in */}
                        <div
                            className={`sidebar-playlist-item ${isActive('Liked Songs') ? 'active' : ''}`}
                            onClick={() => navigateTo('album', {
                                id: 'liked-songs',
                                name: 'Liked Songs',
                                cover: '/liked-songs-cover.webp',
                                songs: likedSongs,
                                type: 'Playlist',
                                isCustom: true
                            })}
                        >
                            <div className="liked-cover"><HeartIcon /></div>
                            <div>
                                <div className="playlist-name">Liked Songs</div>
                                <div className="playlist-meta">Playlist • {likedSongs.length} songs</div>
                            </div>
                        </div>

                        {/* User-created playlists from MongoDB */}
                        {customPlaylists.map((pl) => (
                            <div
                                key={pl.id}
                                className={`sidebar-playlist-item ${activeViewData?.id === pl.id ? 'active' : ''}`}
                                onClick={() => navigateTo('album', { ...pl, type: 'Playlist', isCustom: true })}
                            >
                                <PlaylistCover
                                    customCover={pl.cover}
                                    songs={pl.songs}
                                    playlistName={pl.name}
                                    size="small"
                                    className="sidebar-playlist-cover"
                                />
                                <div>
                                    <div className="playlist-name">{pl.name}</div>
                                    <div className="playlist-meta">Playlist • {pl.songs.length} songs</div>
                                </div>
                            </div>
                        ))}

                        {/* Empty state when user has no playlists yet */}
                        {customPlaylists.length === 0 && likedSongs.length === 0 && (
                            <div className="library-empty-state" style={{ marginTop: '8px' }}>
                                <p style={{ fontSize: '11px' }}>No playlists yet.<br/>Create one to get started.</p>
                                <button
                                    className="library-login-btn"
                                    onClick={() => setCreatePlaylistOpen(true)}
                                >
                                    Create Playlist
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
