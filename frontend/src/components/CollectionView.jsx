import React, { useContext, useEffect, useRef, useState } from 'react';
import { MusicContext } from '../context/MusicContext';
import { resolveExploreCollection } from '../services/exploreService';

const PlayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

const PlayAllIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

const ShuffleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
);

const HeartIcon = ({ filled }) => filled ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>
);

const MoreIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
);

const Equalizer = () => (
    <span className="search-eq" aria-label="Now playing" style={{ display: 'inline-flex', gap: '3px', alignItems: 'flex-end', height: '14px' }}>
        <span className="search-eq-bar" style={{ width: '3px', height: '100%', background: 'var(--amber)', animation: 'bounce-eq 0.8s ease-in-out infinite alternate' }} />
        <span className="search-eq-bar" style={{ width: '3px', height: '60%', background: 'var(--amber)', animation: 'bounce-eq 0.8s ease-in-out infinite alternate 0.2s' }} />
        <span className="search-eq-bar" style={{ width: '3px', height: '80%', background: 'var(--amber)', animation: 'bounce-eq 0.8s ease-in-out infinite alternate 0.4s' }} />
        <span className="search-eq-bar" style={{ width: '3px', height: '40%', background: 'var(--amber)', animation: 'bounce-eq 0.8s ease-in-out infinite alternate 0.6s' }} />
    </span>
);

const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/Covers/dhun.jpg';
};

const CollectionView = () => {
    const {
        activeView, activeViewData, playSpotifySong, playSong, currentSong, isPlaying, toggleLike, isLiked, navigateTo,
        addToQueue, setPlaylistPickerSong, setCurrentPlaylistName
    } = useContext(MusicContext);

    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [loadingSongId, setLoadingSongId] = useState(null);
    const headerRef = useRef(null);

    const name = activeViewData?.name || '';
    const key = activeViewData?.key || '';
    const type = activeView === 'mood' ? 'Mood Playlist' : activeView === 'language' ? 'Language Collection' : 'Trending Playlist';
    const gradient = activeViewData?.gradient || 'linear-gradient(to bottom, rgba(42, 36, 32, 0.6) 0%, var(--bg-base) 100%)';
    const cover = activeViewData?.cover || null;

    useEffect(() => {
        if (!name) return;

        let cancelled = false;
        const loadCollectionSongs = async () => {
            if (!cancelled) {
                setIsLoading(true);
                setError('');
            }

            try {
                const queryText = activeViewData?.query || key || name;
                const fetched = await resolveExploreCollection(activeView, key || name, queryText);
                if (!cancelled) {
                    setSongs(fetched);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Failed loading collection:", err);
                if (!cancelled) {
                    setError('Failed to load collection songs.');
                    setIsLoading(false);
                }
            }
        };

        loadCollectionSongs();

        return () => {
            cancelled = true;
        };
    }, [name, key, activeView]);

    // Apply color gradient or thumbnail gradient color to header background
    useEffect(() => {
        if (!headerRef.current) return;

        if (cover) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = cover;
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
                    headerRef.current.style.background = `linear-gradient(to bottom, rgba(42, 36, 32, 0.6) 0%, var(--bg-base) 100%)`;
                }
            };
        } else if (gradient) {
            // Convert linear-gradient to bottom-based blend
            headerRef.current.style.background = gradient;
        }
    }, [cover, gradient]);

    // Clear spinner once playing status is verified
    useEffect(() => {
        if (isPlaying && currentSong && loadingSongId) {
            const songKey = currentSong.spotifyId || currentSong.id || currentSong.src || currentSong.title;
            if (songKey === loadingSongId) setLoadingSongId(null);
        }
    }, [isPlaying, currentSong, loadingSongId]);

    const handlePlayAll = () => {
        if (songs.length === 0) return;
        const song = songs[0];
        setLoadingSongId(song.spotifyId || song.id || song.src || song.title);
        playSpotifySong(song, name, songs, 0);
        setCurrentPlaylistName(name);
    };

    const handleShufflePlay = () => {
        if (songs.length === 0) return;
        const idx = Math.floor(Math.random() * songs.length);
        const song = songs[idx];
        setLoadingSongId(song.spotifyId || song.id || song.src || song.title);
        playSpotifySong(song, name, songs, idx);
        setCurrentPlaylistName(name);
    };

    const handlePlaySong = (song, idx) => {
        setLoadingSongId(song.spotifyId || song.id || song.src || song.title);
        playSpotifySong(song, name, songs, idx);
        setCurrentPlaylistName(name);
    };

    if (isLoading) {
        return (
            <div className="explore-collection-loading" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span className="explore-collection-spinner" />
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading collection tracks...</p>
            </div>
        );
    }

    return (
        <div className="detail-view collection-view-page">
            {/* Header section */}
            <div className="detail-header" ref={headerRef}>
                {cover ? (
                    <img src={cover || '/Covers/dhun.jpg'} alt={name} className="detail-cover" onError={handleImageError} />
                ) : (
                    <div className="detail-cover collection-fallback-cover" style={{ background: gradient, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', fontSize: '32px' }}>
                        🎵
                    </div>
                )}
                <div className="detail-info">
                    <span className="detail-type">{type}</span>
                    <h1 className="detail-title">{name}</h1>
                    <span className="detail-meta">{songs.length} songs</span>
                </div>
            </div>

            {/* Actions section */}
            <div className="detail-actions">
                <button className="play-all-btn" onClick={handlePlayAll} title="Play All" disabled={songs.length === 0}>
                    <PlayAllIcon />
                </button>
                <button className="shuffle-btn" onClick={handleShufflePlay} title="Shuffle Play" disabled={songs.length === 0}>
                    <ShuffleIcon />
                </button>
                <button className="explore-load-more-btn" onClick={() => navigateTo('search')} style={{ margin: '0 0 0 auto', padding: '8px 16px', fontSize: '14px' }}>
                    Back to Explore
                </button>
            </div>

            <div className="detail-divider"></div>

            {/* Song list */}
            {songs.length === 0 ? (
                <p style={{ padding: '2rem', color: 'var(--text-secondary)' }}>No songs found in this collection.</p>
            ) : (
                <div className="song-list">
                    <div className="song-list-header">
                        <span>#</span>
                        <span>Title</span>
                        <span>Singer</span>
                        <span></span>
                    </div>
                    {songs.map((song, index) => {
                        const isCurrent = currentSong && (currentSong.spotifyId === song.spotifyId || currentSong.id === song.id || currentSong.src === song.src);
                        const isActive = isCurrent && isPlaying;
                        const isSongLoading = loadingSongId && (song.spotifyId === loadingSongId || song.id === loadingSongId || song.src === loadingSongId);

                        return (
                            <div
                                key={song.id || index}
                                className={`song-row ${isCurrent ? 'active' : ''}`}
                                onClick={() => handlePlaySong(song, index)}
                            >
                                <div className="song-index">
                                    {isSongLoading ? (
                                        <span className="song-row-spinner" />
                                    ) : isActive ? (
                                        <Equalizer />
                                    ) : (
                                        <>
                                            <span className="index-number">{index + 1}</span>
                                            <span className="play-icon"><PlayIcon /></span>
                                        </>
                                    )}
                                </div>
                                <div className="song-main">
                                    <img src={song.cover || '/Covers/dhun.jpg'} alt={song.title} onError={handleImageError} />
                                    <span className="song-name">{song.title}</span>
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
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CollectionView;
