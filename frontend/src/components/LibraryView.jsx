import React, { useContext, useState } from 'react';
import { MusicContext } from '../context/MusicContext';
import PlaylistCover from './PlaylistCover';

// Premium SVG icons to replace emojis
const HeartIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
);

const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);

const Disc3Icon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon">
        <circle cx="12" cy="12" r="10"/>
        <path d="M6 12a6 6 0 0 1 1.8-4.2"/>
        <circle cx="12" cy="12" r="2"/>
        <path d="M18 12a6 6 0 0 1-1.8 4.2"/>
    </svg>
);

const MusicNoteIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
    </svg>
);

const LibraryView = () => {
    const {
        likedSongs, customPlaylists,
        navigateTo, setCreatePlaylistOpen, showToast
    } = useContext(MusicContext);

    const [showDownloadsModal, setShowDownloadsModal] = useState(false);

    const handleJoinWaitlist = () => {
        showToast('✓ Added to Waitlist!', 'success');
        setShowDownloadsModal(false);
    };

    return (
        <div className="mobile-library-view">
            <div className="mobile-screen-header premium-library-header">
                <h1>Library</h1>
                <p className="mobile-library-subtitle">Your music, playlists and favorites</p>
                <div className="gold-glow-behind"></div>
            </div>

            <div className="mobile-library-grid">
                <button className="library-tile-liked" onClick={() => navigateTo('album', { 
                    id: 'liked-songs',
                    name: 'Liked Songs', 
                    songs: likedSongs, 
                    type: 'Playlist', 
                    cover: '/liked-songs-cover.webp',
                    isCustom: true 
                })}>
                    <div className="library-tile-title-row">
                        <strong>Liked Songs</strong>
                        <span className="library-tile-badge gold-badge">
                            <HeartIcon />
                        </span>
                    </div>
                    <span className="library-tile-count">
                        {likedSongs.length}
                        <span className="library-tile-count-unit">songs</span>
                    </span>
                </button>
                <button className="library-tile-downloads" onClick={() => setShowDownloadsModal(true)}>
                    <div className="library-tile-title-row">
                        <strong>Downloads</strong>
                        <span className="library-tile-badge gold-badge">
                            <DownloadIcon />
                        </span>
                    </div>
                    <span className="library-tile-count">
                        0
                        <span className="library-tile-count-unit">songs</span>
                    </span>
                </button>
            </div>

            <section className="mobile-library-section">
                <div className="mobile-library-section-title premium-playlist-title-row">
                    <h2>Your Playlists</h2>
                    <button type="button" className="create-playlist-plus-btn" onClick={() => setCreatePlaylistOpen(true)} title="Create Playlist">+</button>
                </div>
                <div className="mobile-library-list">
                    {customPlaylists.length === 0 ? (
                        <div className="mobile-library-empty premium-empty-state">
                            <div className="premium-empty-icon-container">
                                <Disc3Icon />
                            </div>
                            <strong>Your Collection Awaits</strong>
                            <p>Create your first playlist and<br />build your perfect soundtrack.</p>
                            <button type="button" className="premium-empty-btn" onClick={() => setCreatePlaylistOpen(true)}>+ Create Playlist</button>
                        </div>
                    ) : customPlaylists.map((playlist) => (
                        <button
                            key={playlist.id || playlist._id || playlist.name}
                            onClick={() => navigateTo('album', { name: playlist.name, ...playlist, type: 'Playlist', isCustom: true })}
                        >
                            <PlaylistCover
                                customCover={playlist.cover}
                                songs={playlist.songs || []}
                                playlistName={playlist.name}
                                size="medium"
                                className="library-playlist-cover"
                            />
                            <span>
                                <strong>{playlist.name}</strong>
                                <small>{playlist.songs?.length || 0} songs</small>
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Premium Downloads Modal */}
            {showDownloadsModal && (
                <div className="playlist-modal-backdrop" onClick={() => setShowDownloadsModal(false)}>
                    <div className="playlist-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="playlist-modal-header">
                            <span>Downloads</span>
                            <button onClick={() => setShowDownloadsModal(false)}>×</button>
                        </div>
                        <div style={{ padding: '20px 0', textAlign: 'center' }}>
                            <span className="badge-premium-tag" style={{ display: 'inline-block', marginBottom: '12px' }}>⭐ Premium Coming Soon</span>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px' }}>
                                Offline listening will be available with SurTaal Premium. Join the waitlist to get early access.
                            </p>
                        </div>
                        <div className="playlist-modal-actions">
                            <button onClick={() => setShowDownloadsModal(false)}>Cancel</button>
                            <button className="primary" onClick={handleJoinWaitlist}>Join Waitlist</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryView;
