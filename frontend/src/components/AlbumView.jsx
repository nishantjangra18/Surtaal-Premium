import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicContext } from '../context/MusicContext';
import { AuthContext } from '../context/AuthContext';
import { GeneratedAvatar, useProfileSettings } from './ProfileViews';
import PlaylistCover from './PlaylistCover';


const PlayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

const HeartIcon = ({ filled }) => filled ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>
);

const ShuffleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
);

const PlayAllIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);
const MoreIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>;

const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/Covers/dhun.jpg';
};

const readImageFile = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
};

const formatSongDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '3:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const AlbumView = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [profile] = useProfileSettings();
    const {
        activeViewData, playSong, currentSong, isPlaying, toggleLike, isLiked, navigateTo, setCurrentPlaylistName,
        addToQueue, setPlaylistPickerSong, updatePlaylist, deletePlaylist, removeSongFromPlaylist,
        reorderPlaylistSong, customPlaylists, likedSongs
    } = useContext(MusicContext);
    const headerRef = useRef(null);
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState('');
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isCustomPlaylist = !!activeViewData?.isCustom;
    
    // For Liked Songs, always use fresh likedSongs from context
    let data;
    if (activeViewData?.id === 'liked-songs' || activeViewData?.name === 'Liked Songs') {
        data = {
            id: 'liked-songs',
            name: 'Liked Songs',
            cover: '/liked-songs-cover.webp',
            songs: likedSongs,
            type: 'Playlist',
            isCustom: true
        };
    } else {
        data = isCustomPlaylist
            ? customPlaylists.find(playlist => playlist.id === activeViewData.id) || activeViewData
            : activeViewData;
    }

    console.log('[AlbumView] Final data:', data);

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    // Defensive check for missing data
    if (!data) {
        return (
            <div className="detail-view" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '20px' }}>Playlist not found</p>
                <button 
                    onClick={handleBack}
                    style={{ 
                        padding: '10px 24px', 
                        background: 'linear-gradient(135deg, var(--amber), var(--copper))', 
                        color: 'var(--bg-deep)', 
                        border: 'none', 
                        borderRadius: '999px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Go Back
                </button>
            </div>
        );
    }

    const { id, name, songs = [], cover, type } = data;

    // Show loading if songs is undefined
    if (!songs) {
        return (
            <div className="detail-view" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212, 161, 93, 0.2)', borderTop: '3px solid var(--amber)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '20px' }}>Loading playlist...</p>
            </div>
        );
    }

    const isLikedSongs = name === 'Liked Songs' || id === 'liked-songs';
    const displayCover = isLikedSongs ? '/liked-songs-cover.webp' : (cover || '/Covers/dhun.jpg');

    // Calculate mobile Liked Songs stats
    const totalSongs = songs?.length || 0;
    const uniqueArtists = new Set((songs || []).map(s => s.singer || s.artist).filter(Boolean));
    const totalArtists = uniqueArtists.size;
    const totalSeconds = (songs || []).reduce((sum, s) => sum + (Number(s.duration) || 180), 0);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const totalDurationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

    // Apply gradient from cover color
    useEffect(() => {
        if (!headerRef.current) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = displayCover;
        img.onload = () => {
            try {
                if (window.ColorThief) {
                    const ct = new window.ColorThief();
                    const color = ct.getColor(img);
                    if (color && headerRef.current) {
                        headerRef.current.style.background = `linear-gradient(to bottom, rgba(${color.join(',')}, 0.4) 0%, var(--bg-base) 100%)`;
                    }
                }
            } catch {
                if (headerRef.current) {
                    headerRef.current.style.background = 'linear-gradient(to bottom, rgba(42, 36, 32, 0.6) 0%, var(--bg-base) 100%)';
                }
            }
        };
    }, [displayCover]);

    useEffect(() => {
        setDraftName(name);
    }, [name]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showPlaylistMenu && !e.target.closest('.playlist-menu-wrapper')) {
                setShowPlaylistMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showPlaylistMenu]);

    const handlePlayAll = () => {
        playSong(songs, 0, name);
        setCurrentPlaylistName(name);
    };

    const handlePlaySong = (index) => {
        playSong(songs, index, name);
        setCurrentPlaylistName(name);
    };

    const handleShufflePlay = () => {
        const idx = Math.floor(Math.random() * songs.length);
        playSong(songs, idx, name);
        setCurrentPlaylistName(name);
    };

    const handleRenamePlaylist = () => {
        if (draftName.trim() && draftName.trim() !== name) {
            updatePlaylist(id, { name: draftName.trim() });
        }
        setShowRenameModal(false);
        setShowPlaylistMenu(false);
    };

    const handleChangeCover = (e) => {
        readImageFile(e.target.files?.[0], (image) => {
            updatePlaylist(id, { cover: image });
            setShowPlaylistMenu(false);
        });
    };

    const handleDeletePlaylist = () => {
        if (window.confirm('Are you sure you want to delete this playlist?')) {
            deletePlaylist(id);
            setShowPlaylistMenu(false);
            navigate(-1);
        }
    };

    if (isMobile && isLikedSongs) {
        return (
            <div className="detail-view liked-songs-detail-view-mobile">
                {/* Visual order is preserved:
                    1. Back Button and Profile Avatar are already rendered sticky/absolute at the top of the viewport by App.jsx & MobileHeader.jsx.
                    2. Next is Liked Songs Cover, label, title, song count:
                */}
                {/* Liked Songs Cover, YOUR COLLECTION label, Liked Songs title, Song count */}
                <div className="liked-songs-header-mobile">
                    <div className="liked-songs-cover-wrapper-mobile">
                        <img src="/liked-songs-cover.webp" alt="Liked Songs" className="liked-songs-cover-mobile" onError={handleImageError} />
                    </div>
                    <div className="liked-songs-meta-mobile">
                        <span className="liked-songs-label-mobile">YOUR COLLECTION</span>
                        <h1 className="liked-songs-title-mobile">Liked Songs</h1>
                        <span className="liked-songs-count-mobile">{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
                    </div>
                </div>

                {/* Play Button, Shuffle Button */}
                <div className="liked-songs-actions-mobile">
                    <button className="liked-action-play-mobile" onClick={handlePlayAll}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        Play
                    </button>
                    <button className="liked-action-shuffle-mobile" onClick={handleShufflePlay}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                        </svg>
                        Shuffle
                    </button>
                </div>

                {/* Empty State */}
                {songs.length === 0 && (
                    <div className="liked-songs-empty-mobile">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <h3>No liked songs yet</h3>
                        <p>Songs you like will appear here</p>
                        <button className="liked-empty-cta-mobile" onClick={() => navigateTo('home')}>
                            Explore Music
                        </button>
                    </div>
                )}

                {/* Song List (Mapped exactly once) */}
                {songs.length > 0 && (
                    <div className="liked-songs-tracklist-mobile">
                        {songs.map((song, index) => {
                            const isActive = currentSong?.src === song.src;
                            return (
                                <div
                                    key={index}
                                    className={`liked-track-row-mobile ${isActive ? 'active' : ''}`}
                                    onClick={() => handlePlaySong(index)}
                                >
                                    <img src={song.cover || '/Covers/dhun.jpg'} alt="" className="liked-track-cover-mobile" onError={handleImageError} />
                                    <div className="liked-track-info-mobile">
                                        <span className="liked-track-title-mobile">{song.title}</span>
                                        <span className="liked-track-artist-mobile">{song.singer || song.artist}</span>
                                    </div>
                                    <button 
                                        className="liked-track-menu-mobile"
                                        onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === index ? null : index); }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                        </svg>
                                    </button>
                                    {openMenuIndex === index && (
                                        <div className="song-options-menu song-row-menu" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => { addToQueue(song, true); setOpenMenuIndex(null); }}>Play Next</button>
                                            <button onClick={() => { addToQueue(song); setOpenMenuIndex(null); }}>Add to Queue</button>
                                            <button onClick={() => { setPlaylistPickerSong(song); setOpenMenuIndex(null); }}>Add to Playlist</button>
                                            <button onClick={() => { toggleLike(song); setOpenMenuIndex(null); }}>Remove from Liked Songs</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="detail-view">
            <button className="mobile-back-btn" onClick={handleBack} aria-label="Back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            {/* Mobile-only Liked Songs Redesigned Header - Only shown on mobile */}
            {isLikedSongs && (
                <>
                    <div className="liked-songs-header-mobile" style={{ display: 'none' }}>
                        <div className="liked-songs-cover-wrapper-mobile">
                            <img src="/liked-songs-cover.webp" alt="Liked Songs" className="liked-songs-cover-mobile" onError={handleImageError} />
                        </div>
                        <div className="liked-songs-meta-mobile">
                            <span className="liked-songs-label-mobile">YOUR COLLECTION</span>
                            <h1 className="liked-songs-title-mobile">Liked Songs</h1>
                            <span className="liked-songs-count-mobile">{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
                        </div>
                    </div>

                    {/* Mobile-only Playback Controls */}
                    <div className="liked-songs-actions-mobile" style={{ display: 'none' }}>
                        <button className="liked-action-play-mobile" onClick={handlePlayAll}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            Play
                        </button>
                        <button className="liked-action-shuffle-mobile" onClick={handleShufflePlay}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                            </svg>
                            Shuffle
                        </button>
                    </div>

                    {/* Mobile-only Empty State */}
                    {songs.length === 0 && (
                        <div className="liked-songs-empty-mobile" style={{ display: 'none' }}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <h3>No liked songs yet</h3>
                            <p>Songs you like will appear here</p>
                            <button className="liked-empty-cta-mobile" onClick={() => navigateTo('home')}>
                                Explore Music
                            </button>
                        </div>
                    )}

                    {/* Mobile-only Song List */}
                    {songs.length > 0 && (
                        <div className="liked-songs-tracklist-mobile" style={{ display: 'none' }}>
                            {songs.map((song, index) => {
                                const isActive = currentSong?.src === song.src;
                                return (
                                    <div
                                        key={index}
                                        className={`liked-track-row-mobile ${isActive ? 'active' : ''}`}
                                        onClick={() => handlePlaySong(index)}
                                    >
                                        <img src={song.cover || '/Covers/dhun.jpg'} alt="" className="liked-track-cover-mobile" onError={handleImageError} />
                                        <div className="liked-track-info-mobile">
                                            <span className="liked-track-title-mobile">{song.title}</span>
                                            <span className="liked-track-artist-mobile">{song.singer || song.artist}</span>
                                        </div>
                                        <button 
                                            className="liked-track-menu-mobile"
                                            onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === index ? null : index); }}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                            </svg>
                                        </button>
                                        {openMenuIndex === index && (
                                            <div className="song-options-menu song-row-menu" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => { addToQueue(song, true); setOpenMenuIndex(null); }}>Play Next</button>
                                                <button onClick={() => { addToQueue(song); setOpenMenuIndex(null); }}>Add to Queue</button>
                                                <button onClick={() => { setPlaylistPickerSong(song); setOpenMenuIndex(null); }}>Add to Playlist</button>
                                                <button onClick={() => { toggleLike(song); setOpenMenuIndex(null); }}>Remove from Liked Songs</button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Standard Desktop / Other Playlist View Header - Hidden on mobile for Liked Songs */}
            {!isLikedSongs && (
                <>
                    <div className="detail-header" ref={headerRef}>
                        <PlaylistCover
                            customCover={cover}
                            songs={songs}
                            playlistName={name}
                            size="large"
                            className="detail-cover"
                            alt={name}
                        />
                        <div className="detail-info">
                            <span className="detail-type">{type || 'Playlist'}</span>
                            <h1 className="detail-title">{name}</h1>
                            <span className="detail-meta">{songs.length} songs</span>
                        </div>
                    </div>

                    {/* Standard Desktop / Other Playlist Actions */}
                    <div className="detail-actions">
                        <button className="play-all-btn" onClick={handlePlayAll} title="Play All">
                            <PlayAllIcon />
                        </button>
                        <button className="shuffle-btn" onClick={handleShufflePlay} title="Shuffle Play">
                            <ShuffleIcon />
                        </button>
                        {isCustomPlaylist && (
                            <div className="playlist-menu-wrapper">
                                <button className="playlist-menu-btn" onClick={() => setShowPlaylistMenu(!showPlaylistMenu)} title="Playlist Options">
                                    <MoreIcon />
                                </button>
                                {showPlaylistMenu && (
                                    <div className="playlist-options-menu" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => { setShowRenameModal(true); setShowPlaylistMenu(false); }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                            Rename Playlist
                                        </button>
                                        <label className="playlist-menu-label">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                            Change Cover
                                            <input type="file" accept="image/*" onChange={handleChangeCover} style={{ display: 'none' }} />
                                        </label>
                                        <button className="danger-action" onClick={handleDeletePlaylist}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                            Delete Playlist
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Decorative divider */}
                    <div className="detail-divider"></div>
                </>
            )}

            <div className="song-list">
                    <div className="song-list-header">
                        <span>#</span>
                        <span>Title</span>
                        <span>Artist</span>
                        <span></span>
                    </div>
                    {songs.map((song, index) => {
                        const isActive = currentSong?.src === song.src;
                        return (
                            <div
                                key={index}
                                className={`song-row ${isActive ? 'active' : ''}`}
                                onClick={() => handlePlaySong(index)}
                            >
                                <div className="song-index">
                                    {isActive && isPlaying ? (
                                        <div className="equalizer">
                                            <span></span><span></span><span></span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="index-number">{index + 1}</span>
                                            <span className="play-icon"><PlayIcon /></span>
                                        </>
                                    )}
                                </div>
                                <div className="song-main">
                                    <img src={song.cover || '/Covers/dhun.jpg'} alt={song.title} onError={handleImageError} />
                                    <div className="song-text-info">
                                        <span className="song-name">{song.title}</span>
                                        <span className="song-artist-mobile">{song.singer}</span>
                                    </div>
                                </div>
                                <span className="song-artist-col">{song.singer}</span>
                                <button
                                    className={`song-like-btn ${isLiked(song) ? 'liked' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                                >
                                    <HeartIcon filled={isLiked(song)} />
                                </button>
                                <div className="song-more-wrapper">
                                    <button className="song-more-btn" onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === index ? null : index); }}>
                                        <MoreIcon />
                                    </button>
                                    {openMenuIndex === index && (
                                        <div className="song-options-menu song-row-menu" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => { addToQueue(song, true); setOpenMenuIndex(null); }}>Play Next</button>
                                            <button onClick={() => { addToQueue(song); setOpenMenuIndex(null); }}>Add to Queue</button>
                                            <button onClick={() => { setPlaylistPickerSong(song); setOpenMenuIndex(null); }}>Add to Playlist</button>
                                            <button onClick={() => { toggleLike(song); setOpenMenuIndex(null); }}>{isLiked(song) ? 'Unlike Song' : 'Like Song'}</button>
                                            {isCustomPlaylist && <button onClick={() => { removeSongFromPlaylist(id, song.src); setOpenMenuIndex(null); }}>Remove from Playlist</button>}
                                            {isCustomPlaylist && <button onClick={() => { reorderPlaylistSong(id, index, 'up'); setOpenMenuIndex(null); }}>Move Up</button>}
                                            {isCustomPlaylist && <button onClick={() => { reorderPlaylistSong(id, index, 'down'); setOpenMenuIndex(null); }}>Move Down</button>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

            {/* Rename Playlist Modal */}
            {showRenameModal && (
                <div className="rename-modal-backdrop" onClick={() => setShowRenameModal(false)}>
                    <div className="rename-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Rename Playlist</h3>
                        <input
                            type="text"
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            placeholder="Enter playlist name"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && handleRenamePlaylist()}
                        />
                        <div className="rename-modal-actions">
                            <button className="rename-modal-cancel" onClick={() => setShowRenameModal(false)}>Cancel</button>
                            <button className="rename-modal-save" onClick={handleRenamePlaylist}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlbumView;
